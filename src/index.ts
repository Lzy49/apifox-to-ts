import minimist from 'minimist'
import { red } from "kolorist";
import { getPathWithFilePath, hasPath, readJSON, write } from './utils'
import axios from 'axios';
const URLS: string[] = ['https://gotin-test.oss-accelerate.aliyuncs.com/', 'https://gotin-test.oss-accelerate.aliyuncs.com'].map((item: string) => item.endsWith('/') ? item.substring(0, item.length - 1) : item)
const PATH = "src/utils/api-client/config/";
init();
async function init() {
  try {
    const context = await getJSON()
    write(getPathWithFilePath(process.cwd(), PATH + 'apifox.json'), JSON.stringify(context, null, 2));
    hadleTypes(context);
    hadleConfig(context)
  } catch (error: any) {
    console.log(red("✖") + " " + error.message);
  }
}
function handleArgv() {
  const argv = minimist(process.argv.slice(2));
  const path: string = argv["_"][0];
  if (!/^(((ht|f)tps?):\/\/)/.test(path)) {
    throw new Error('请输入正确的路径')
  }
  const type = argv["_"][1] || 0
  return {
    path, type
  }
}

async function getJSON() {
  const server = await getServer()
  console.log('%c------------ start [] -------------', 'color:purple');
  console.log(server);
  console.log('%c------------ end [] ---------------', 'color:purple');

  if (getLocal() === 'nodata') {
    return server
  }
  const local = getLocal()
  const result = {
    openapi: server.openapi,
    info: server.info,
    paths: getPaths(),
    components: {
      schemas: getComponents()
    }
  }
  return result
  function getComponents() {
    const keys = Object.keys({ ...server.components.schemas, ...local.components.schemas }).sort()
    return keys.reduce((result, key) => {
      result[key] = server.components.schemas[key] || local.components.schemas[key]
      return result
    }, {})
  }
  function getPaths() {
    const keys = Object.keys({ ...server.paths, ...local.paths }).sort()
    return keys.reduce((result, key) => {
      const keys = [...Object.keys(server.paths[key] || {}), ...Object.keys(local.paths[key] || {})].sort();
      const value = keys.reduce((res, k) => (
        { ...res, [k]: server?.paths?.[key]?.[k] || local?.paths?.[key]?.[k] }
      ), {});
      return { ...result, [key]: value };
    }, {});
  }
  function getLocal() {
    const p = getPathWithFilePath(process.cwd(), PATH + 'apifox.json')
    return hasPath(p) ? readJSON(p) : 'nodata';
  }
  async function getServer() {
    const { path, type } = handleArgv();
    const server = (await axios.get(path)).data
    const paths = Object.keys(server.paths).reduce((result, key) => {
      const method = Object.keys(server.paths[key])
      return {
        ...result, [key]: method.reduce((result, k) => {
          const item = { ...server.paths[key][k], baseURL: URLS[type] }
          return { ...result, [k]: item }
        }, {})
      }
    }, {})
    return { ...server, paths }
  }
}
function hadleConfig(context: any) {
  let result = `export default {`
  for (const path in context.paths) {
    Object.keys(context.paths[path]).forEach(method => {
      const baseURL = context.paths[path][method].baseURL
      result += `'${path},${method}':{
        url:${baseURL} + '${path}',
        method:'${method}',
      },`
    })
  }
  result += '}'
  write(getPathWithFilePath(process.cwd(), PATH + 'api-url.ts'), result);
}
function hadleTypes(context: any) {
  let result = handleContext(context);
  result += handleComponents(context);
  write(getPathWithFilePath(process.cwd(), PATH + 'api-types.ts'), result);
}
function handleComponents(context: any) {
  let result = `\nexport interface apifoxComponents {`
  for (const key in context.components.schemas) {
    result += `
    '${key}':${handleKey(context.components.schemas[key], '')},
    `
  }
  result += '}'
  return result
}
function handleContext(context: any) {
  let result = `export interface apifoxTypes {\n`
  for (const path in context.paths) {
    Object.keys(context.paths[path]).forEach(k => {
      result += `/**
         * @标题 ${context.paths[path][k].summary}
         * @描述 ${context.paths[path][k].description} 
        */
        '${path},${k}':{
          request:${getHandleRequest(k)(context.paths[path][k])},
          response:${handleResponse(context.paths[path][k])}
        }
      `
    })
  }
  result += '}'
  return result
}
function handleResponse(context) {
  if (!context.responses['200'].content['application/json']?.schema || !context.responses['200'].content['application/json']?.schema.properties.data) {
    return `{data:{}}`
  }
  const reslut = handleKey(context.responses['200'].content['application/json'].schema, '')
  return reslut
}
function getHandleRequest(type) {
  const handleContextFn = {
    delete: handleNotGet,
    post: handleNotGet,
    put: handleNotGet,
    get(context) {
      return '{' + context.parameters.reduce((result, item) => {
        if (item.in !== 'header') {
          result += `
          /**
           * @描述 ${item.description} 
           * @插入位置 ${item.in}
           */
          '${item.name}' ${item.required ? '' : '?'}:${item.schema.type} `
        }
        return result
      }, '') + '}'
    },
  }
  return handleContextFn[type]
  function handleNotGet(context) {
    if (!context['requestBody']?.['content']) { return `{}` }
    const reslut = handleKey(context['requestBody']['content']['application/json']['schema'], '')
    return reslut
  }
}
function handleKey(context, key, required: boolean = true) {
  if (!context) {
    return ''
  }
  const { type } = context
  switch (type) {
    case 'string':
      {
        let result = ''
        if (key) {
          result += `
          ${context['description'] ? `
            /** 
            * @描述 ${context['description']}
            */` : ''}
          '${key}'${required ? '' : '?'}:`
        }
        let value = handleNullEnum();
        return result + value
      }
    case 'object':
      {
        const properties = context['properties']
        const requireds = context['required'] || []
        let result = key ? `
        '${key}'${required ? '' : '?'}:` : ''
        return result + `{
            ${Object.keys(properties).map(key => handleKey(properties[key], key, requireds.includes(key))).join('')}
        }`
      }
    case 'array':
      return (`${context['description'] ? `
      /** 
      * @描述 ${context['description']}
      */` : ''}
      '${key}'${required ? '' : '?'}:Array<${handleKey(context.items, '', true)}>,`)
    case 'number':
    case 'integer':
      {
        let result = ''
        if (key) {
          result += `
            ${context['description'] ? `/** 
            * @描述 ${context['description']}
            */` : ''}
            '${key}'${required ? '' : '?'}:`
        }
        let value = 'number';
        return result + value
      }
    case 'boolean':
      {
        let result = ''
        if (key) {
          result += `
            ${context['description'] ? `/** 
            * @描述 ${context['description']}
            */` : ''}
            '${key}'${required ? '' : '?'}:`
        }
        let value = 'boolean';
        return result + value
      }
    case 'null':
      {
        let result = ''
        if (key) {
          result += `
              ${context['description'] ? `/** 
              * @描述 ${context['description']}
              */` : ''}
              '${key}'${required ? '' : '?'}:`
        }
        let value = 'null';
        return result + value
      }
    case undefined: {
      let result = ''
      if (key) {
        result += `
            ${context['description'] ? `/** 
            * @描述 ${context['description']}
            */` : ''}
            '${key}'${required ? '' : '?'}:`
      }
      if (context['$ref']) {
        return result + `apifoxComponents['${decodeURI(context['$ref']).split('/').pop()}']`
      }
      if (context['allOf']) {
        return result + context['allOf'].map(item => handleKey(item, ''))
      }
      console.log(context, type);
      throw new Error('没有处理该类型')
    }
    default:
      console.log(context, type);
      throw new Error('没有处理该类型')
  }
  function handleNullEnum() {
    let value = '';
    if (context['nullable']) {
      value = 'null|';
    }
    if (context['enum']) {
      value += context['enum'].map(item => `'${item}'`).join('|');
    } else {
      value += 'string';
    }
    return value;
  }
}