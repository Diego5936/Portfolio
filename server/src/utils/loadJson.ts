import fs from "fs";
import path from "path";

export function loadJson<T>(absolutePath: string): T {
  const raw = fs.readFileSync(absolutePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function rootPath(...parts: string[]) {
  // server/
  return path.join(process.cwd(), ...parts);
}