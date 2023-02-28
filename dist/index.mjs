import minimist from 'minimist';
import { green, red } from 'kolorist';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import axios from 'axios';

function getPathWithFilePath(dir, filePath) {
  dir = /file:\/\//.test(dir) ? fileURLToPath(dir) : dir;
  filePath = /file:\/\//.test(filePath) ? fileURLToPath(filePath) : filePath;
  const templateDir = path.resolve(dir, filePath);
  return templateDir;
}
function hasPath(targetDir) {
  return fs.existsSync(targetDir);
}
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}
function readJSON(filePath) {
  return JSON.parse(readFile(filePath));
}
function write(targetPath, content) {
  fs.writeFileSync(targetPath, content);
}

const URLS = ["https://gotin-test.oss-accelerate.aliyuncs.com/", "https://gotin-test.oss-accelerate.aliyuncs.com"].map((item) => item.endsWith("/") ? item.substring(0, item.length - 1) : item);
const PATH = "src/utils/api-client/config/";
init();
async function init() {
  try {
    const context = await getJSON();
    write(getPathWithFilePath(process.cwd(), PATH + "apifox.json"), JSON.stringify(context, null, 2));
    hadleTypes(context);
    hadleConfig(context);
    console.log(green("\u2714") + "\u6DFB\u52A0\u6210\u529F");
  } catch (error) {
    console.log(red("\u2716") + " " + error.message);
  }
}
function handleArgv() {
  const argv = minimist(process.argv.slice(2));
  const path = argv["_"][0];
  if (!/^(((ht|f)tps?):\/\/)/.test(path)) {
    throw new Error("\u8BF7\u8F93\u5165\u6B63\u786E\u7684\u8DEF\u5F84");
  }
  const type = argv["_"][1] || 0;
  return {
    path,
    type
  };
}
async function getJSON() {
  const server = await getServer();
  if (getLocal() === "nodata") {
    return server;
  }
  const local = getLocal();
  const result = {
    openapi: server.openapi,
    info: server.info,
    paths: getPaths(),
    components: {
      schemas: getComponents()
    }
  };
  return result;
  function getComponents() {
    const keys = Object.keys({ ...server.components.schemas, ...local.components.schemas }).sort();
    return keys.reduce((result2, key) => {
      result2[key] = server.components.schemas[key] || local.components.schemas[key];
      return result2;
    }, {});
  }
  function getPaths() {
    const keys = Object.keys({ ...server.paths, ...local.paths }).sort();
    return keys.reduce((result2, key) => {
      const keys2 = [...Object.keys(server.paths[key] || {}), ...Object.keys(local.paths[key] || {})].sort();
      const value = keys2.reduce((res, k) => ({ ...res, [k]: server?.paths?.[key]?.[k] || local?.paths?.[key]?.[k] }), {});
      return { ...result2, [key]: value };
    }, {});
  }
  function getLocal() {
    const p = getPathWithFilePath(process.cwd(), PATH + "apifox.json");
    return hasPath(p) ? readJSON(p) : "nodata";
  }
  async function getServer() {
    const { path, type } = handleArgv();
    const server2 = (await axios.get(path)).data;
    const paths = Object.keys(server2.paths).reduce((result2, key) => {
      const method = Object.keys(server2.paths[key]);
      return {
        ...result2,
        [key]: method.reduce((result3, k) => {
          const item = { ...server2.paths[key][k], baseURL: URLS[type] };
          return { ...result3, [k]: item };
        }, {})
      };
    }, {});
    return { ...server2, paths };
  }
}
function hadleConfig(context) {
  let result = `export default {`;
  for (const path in context.paths) {
    Object.keys(context.paths[path]).forEach((method) => {
      let mock = context.paths[path][method].responses["200"]?.content?.["application/json"]?.examples?.["1"]?.value?.data;
      const baseURL = context.paths[path][method].baseURL;
      result += `'${path},${method}':{
        url:${baseURL} + '${path}',
        method:'${method}',
        mock:${JSON.stringify(mock, null, 2)}
      },`;
    });
  }
  result += "}";
  write(getPathWithFilePath(process.cwd(), PATH + "api-url.ts"), result);
}
function hadleTypes(context) {
  let result = handleContext(context);
  result += handleComponents(context);
  write(getPathWithFilePath(process.cwd(), PATH + "api-types.ts"), result);
}
function handleComponents(context) {
  let result = `
export interface apifoxComponents {`;
  for (const key in context.components.schemas) {
    result += `
    '${key}':${handleKey(context.components.schemas[key], "")},
    `;
  }
  result += "}";
  return result;
}
function handleContext(context) {
  let result = `export interface apifoxTypes {
`;
  for (const path in context.paths) {
    Object.keys(context.paths[path]).forEach((k) => {
      result += `/**
         * @\u6807\u9898 ${context.paths[path][k].summary}
         * @\u63CF\u8FF0 ${context.paths[path][k].description} 
        */
        '${path},${k}':{
          request:${getHandleRequest(k)(context.paths[path][k])},
          response:${handleResponse(context.paths[path][k])}
        }
      `;
    });
  }
  result += "}";
  return result;
}
function handleResponse(context) {
  if (!context.responses["200"].content["application/json"]?.schema || !context.responses["200"].content["application/json"]?.schema.properties.data) {
    return `{data:{}}`;
  }
  const reslut = handleKey(context.responses["200"].content["application/json"].schema, "");
  return reslut;
}
function getHandleRequest(type) {
  const handleContextFn = {
    delete: handleNotGet,
    post: handleNotGet,
    put: handleNotGet,
    get(context) {
      return "{" + context.parameters.reduce((result, item) => {
        if (item.in !== "header") {
          result += `
          /**
           * @\u63CF\u8FF0 ${item.description} 
           * @\u63D2\u5165\u4F4D\u7F6E ${item.in}
           */
          '${item.name}' ${item.required ? "" : "?"}:${item.schema.type} `;
        }
        return result;
      }, "") + "}";
    }
  };
  return handleContextFn[type];
  function handleNotGet(context) {
    if (!context["requestBody"]?.["content"]) {
      return `{}`;
    }
    const reslut = handleKey(context["requestBody"]["content"]["application/json"]["schema"], "");
    return reslut;
  }
}
function handleKey(context, key, required = true) {
  if (!context) {
    return "";
  }
  const { type } = context;
  switch (type) {
    case "string": {
      let result = "";
      if (key) {
        result += `
          ${context["description"] ? `
            /** 
            * @\u63CF\u8FF0 ${context["description"]}
            */` : ""}
          '${key}'${required ? "" : "?"}:`;
      }
      let value = handleNullEnum();
      return result + value;
    }
    case "object": {
      const properties = context["properties"];
      const requireds = context["required"] || [];
      let result = key ? `
        '${key}'${required ? "" : "?"}:` : "";
      return result + `{
            ${Object.keys(properties).map((key2) => handleKey(properties[key2], key2, requireds.includes(key2))).join("")}
        }`;
    }
    case "array":
      return `${context["description"] ? `
      /** 
      * @\u63CF\u8FF0 ${context["description"]}
      */` : ""}
      '${key}'${required ? "" : "?"}:Array<${handleKey(context.items, "", true)}>,`;
    case "number":
    case "integer": {
      let result = "";
      if (key) {
        result += `
            ${context["description"] ? `/** 
            * @\u63CF\u8FF0 ${context["description"]}
            */` : ""}
            '${key}'${required ? "" : "?"}:`;
      }
      let value = "number";
      return result + value;
    }
    case "boolean": {
      let result = "";
      if (key) {
        result += `
            ${context["description"] ? `/** 
            * @\u63CF\u8FF0 ${context["description"]}
            */` : ""}
            '${key}'${required ? "" : "?"}:`;
      }
      let value = "boolean";
      return result + value;
    }
    case "null": {
      let result = "";
      if (key) {
        result += `
              ${context["description"] ? `/** 
              * @\u63CF\u8FF0 ${context["description"]}
              */` : ""}
              '${key}'${required ? "" : "?"}:`;
      }
      let value = "null";
      return result + value;
    }
    case void 0: {
      let result = "";
      if (key) {
        result += `
            ${context["description"] ? `/** 
            * @\u63CF\u8FF0 ${context["description"]}
            */` : ""}
            '${key}'${required ? "" : "?"}:`;
      }
      if (context["$ref"]) {
        return result + `apifoxComponents['${decodeURI(context["$ref"]).split("/").pop()}']`;
      }
      if (context["allOf"]) {
        return result + context["allOf"].map((item) => handleKey(item, ""));
      }
      console.log(context, type);
      throw new Error("\u6CA1\u6709\u5904\u7406\u8BE5\u7C7B\u578B");
    }
    default:
      console.log(context, type);
      throw new Error("\u6CA1\u6709\u5904\u7406\u8BE5\u7C7B\u578B");
  }
  function handleNullEnum() {
    let value = "";
    if (context["nullable"]) {
      value = "null|";
    }
    if (context["enum"]) {
      value += context["enum"].map((item) => `'${item}'`).join("|");
    } else {
      value += "string";
    }
    return value;
  }
}
