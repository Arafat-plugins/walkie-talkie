import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { ConfigValidationIssue } from "../../config/src/schema.ts";
import type { SkillDefinition, SkillExecutionContext, SkillExecutionResult } from "../../skills/src/skill-contract.ts";
import {
  STORAGE_CONTRACT_VERSION,
  createEntityStorageSnapshot,
  type EntityStorageSnapshot
} from "./storage-contract.ts";

export const DEFAULT_STORAGE_DIRECTORY = ".walkie-talkie/storage";
export const DEFAULT_ENTITY_STORAGE_FILE = "entities.snapshot.json";

type PersistedSkillDefinition = Omit<SkillDefinition, "handler">;

type PersistedEntityStorageSnapshot = Omit<EntityStorageSnapshot, "skills"> & {
  skills: PersistedSkillDefinition[];
};

export type EntityStorageLoadResult =
  | {
      ok: true;
      path: string;
      snapshot: EntityStorageSnapshot;
    }
  | {
      ok: false;
      path: string;
      issues: ConfigValidationIssue[];
    };

function createPersistedSkillHandler(skillId: string) {
  return async (_context: SkillExecutionContext): Promise<SkillExecutionResult> => ({
    ok: false,
    error: `Skill "${skillId}" was loaded from file storage without a runtime handler.`
  });
}

function serializePersistedEntityStorageSnapshot(
  snapshot: EntityStorageSnapshot
): PersistedEntityStorageSnapshot {
  return {
    ...snapshot,
    skills: snapshot.skills.map((skill) => ({
      version: skill.version,
      id: skill.id,
      name: skill.name,
      description: skill.description,
      status: skill.status,
      executionMode: skill.executionMode,
      parameters: skill.parameters.map((parameter) => ({ ...parameter })),
      tags: [...skill.tags]
    }))
  };
}

function hydratePersistedEntityStorageSnapshot(
  snapshot: PersistedEntityStorageSnapshot
): EntityStorageSnapshot {
  return createEntityStorageSnapshot({
    agents: snapshot.agents,
    skills: snapshot.skills.map((skill) => ({
      ...skill,
      handler: createPersistedSkillHandler(skill.id)
    })),
    mcpServers: snapshot.mcpServers,
    pipelines: snapshot.pipelines,
    now: () => snapshot.updatedAt
  });
}

export function resolveStorageDirectory(
  baseDirectory: string,
  directoryName = DEFAULT_STORAGE_DIRECTORY
): string {
  return resolve(baseDirectory, directoryName);
}

export function resolveEntityStoragePath(
  baseDirectory: string,
  fileName = DEFAULT_ENTITY_STORAGE_FILE
): string {
  return resolve(resolveStorageDirectory(baseDirectory), fileName);
}

export function serializeEntityStorageSnapshot(snapshot: EntityStorageSnapshot): string {
  const persisted = serializePersistedEntityStorageSnapshot(snapshot);
  return `${JSON.stringify(persisted, null, 2)}\n`;
}

export async function writeEntityStorageFile(
  path: string,
  snapshot: EntityStorageSnapshot
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, serializeEntityStorageSnapshot(snapshot), "utf8");
}

export async function readEntityStorageFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function loadEntityStorageFile(path: string): Promise<EntityStorageLoadResult> {
  try {
    const raw = await readEntityStorageFile(path);
    const parsed = JSON.parse(raw) as Partial<PersistedEntityStorageSnapshot>;

    if (parsed.version !== STORAGE_CONTRACT_VERSION) {
      return {
        ok: false,
        path,
        issues: [
          {
            path: "version",
            message: `Entity storage version must be "${STORAGE_CONTRACT_VERSION}".`
          }
        ]
      };
    }

    return {
      ok: true,
      path,
      snapshot: hydratePersistedEntityStorageSnapshot({
        version: STORAGE_CONTRACT_VERSION,
        updatedAt:
          typeof parsed.updatedAt === "string" && parsed.updatedAt.trim().length > 0
            ? parsed.updatedAt
            : new Date().toISOString(),
        agents: Array.isArray(parsed.agents) ? parsed.agents : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        mcpServers: Array.isArray(parsed.mcpServers) ? parsed.mcpServers : [],
        pipelines: Array.isArray(parsed.pipelines) ? parsed.pipelines : []
      })
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read entity storage file.";
    return {
      ok: false,
      path,
      issues: [{ path: "$file", message }]
    };
  }
}
