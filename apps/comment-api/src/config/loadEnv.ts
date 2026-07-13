import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadEnvFile(path: string) {
  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      continue;
    }

    const [key, value] = parsed;
    process.env[key] ??= value;
  }
}

export function loadLocalEnv() {
  const cwd = process.cwd();
  const candidatePaths = [
    resolve(cwd, ".env"),
    resolve(cwd, ".env.local"),
    resolve(cwd, "apps/comment-api/.env"),
    resolve(cwd, "apps/comment-api/.env.local"),
    resolve(cwd, "../../.env"),
    resolve(cwd, "../../.env.local"),
  ];

  for (const path of candidatePaths) {
    loadEnvFile(path);
  }
}