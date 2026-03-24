import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { parseAndValidateConfig } from "./config-parser.ts";
import type { ConfigValidationIssue, WalkieTalkieConfig } from "./schema.ts";

export const DEFAULT_CONFIG_FILE = "walkie-talkie.config.json";

export type ConfigLoadResult =
  | {
      ok: true;
      path: string;
      config: WalkieTalkieConfig;
    }
  | {
      ok: false;
      path: string;
      issues: ConfigValidationIssue[];
    };

export function resolveConfigPath(baseDirectory: string, fileName = DEFAULT_CONFIG_FILE): string {
  return resolve(baseDirectory, fileName);
}

export function serializeConfig(config: WalkieTalkieConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export async function writeConfigFile(path: string, config: WalkieTalkieConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, serializeConfig(config), "utf8");
}

export async function readConfigFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function loadConfigFile(path: string): Promise<ConfigLoadResult> {
  try {
    const raw = await readConfigFile(path);
    const result = parseAndValidateConfig(raw);

    if (!result.ok) {
      return {
        ok: false,
        path,
        issues: result.issues
      };
    }

    return {
      ok: true,
      path,
      config: result.config
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read config file.";
    return {
      ok: false,
      path,
      issues: [{ path: "$file", message }]
    };
  }
}
