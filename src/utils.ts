import fs from 'node:fs'
import { fileURLToPath } from "node:url";
import path from 'node:path'
export function getPathWithFilePath(dir: string, filePath: string) {
  dir = /file:\/\//.test(dir) ? fileURLToPath(dir) : dir;
  filePath = /file:\/\//.test(filePath) ? fileURLToPath(filePath) : filePath;
  const templateDir = path.resolve(dir, filePath);
  return templateDir;
}
export function hasPath(targetDir: fs.PathLike) {
  return fs.existsSync(targetDir);
}
export function readFile(filePath: string) {
  return fs.readFileSync(filePath, "utf-8");
}
export function readJSON(filePath: string) {
  return JSON.parse(readFile(filePath));
}
export function write(targetPath: string, content: string) {
  fs.writeFileSync(targetPath, content);
}