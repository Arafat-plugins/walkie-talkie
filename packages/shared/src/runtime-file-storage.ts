import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { ConfigValidationIssue } from "../../config/src/schema.ts";
import {
  DEFAULT_STORAGE_DIRECTORY,
  resolveStorageDirectory
} from "./entity-file-storage.ts";
import {
  STORAGE_CONTRACT_VERSION,
  createRuntimeStorageSnapshot,
  type RuntimeStorageSnapshot
} from "./storage-contract.ts";

export const DEFAULT_RUNTIME_STORAGE_FILE = "runtime.snapshot.json";

export type RuntimeStorageLoadResult =
  | {
      ok: true;
      path: string;
      snapshot: RuntimeStorageSnapshot;
    }
  | {
      ok: false;
      path: string;
      issues: ConfigValidationIssue[];
    };

export function resolveRuntimeStoragePath(
  baseDirectory: string,
  fileName = DEFAULT_RUNTIME_STORAGE_FILE
): string {
  return resolve(resolveStorageDirectory(baseDirectory, DEFAULT_STORAGE_DIRECTORY), fileName);
}

export function serializeRuntimeStorageSnapshot(snapshot: RuntimeStorageSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export async function writeRuntimeStorageFile(
  path: string,
  snapshot: RuntimeStorageSnapshot
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, serializeRuntimeStorageSnapshot(snapshot), "utf8");
}

export async function readRuntimeStorageFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function loadRuntimeStorageFile(path: string): Promise<RuntimeStorageLoadResult> {
  try {
    const raw = await readRuntimeStorageFile(path);
    const parsed = JSON.parse(raw) as Partial<RuntimeStorageSnapshot>;

    if (parsed.version !== STORAGE_CONTRACT_VERSION) {
      return {
        ok: false,
        path,
        issues: [
          {
            path: "version",
            message: `Runtime storage version must be "${STORAGE_CONTRACT_VERSION}".`
          }
        ]
      };
    }

    return {
      ok: true,
      path,
      snapshot: createRuntimeStorageSnapshot({
        runs: Array.isArray(parsed.runs) ? parsed.runs : [],
        auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents : [],
        now: () =>
          typeof parsed.updatedAt === "string" && parsed.updatedAt.trim().length > 0
            ? parsed.updatedAt
            : new Date().toISOString()
      })
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read runtime storage file.";
    return {
      ok: false,
      path,
      issues: [{ path: "$file", message }]
    };
  }
}
