import { isEnvSecretReference, parseEnvSecretReference } from "./env-policy.ts";
import type { WalkieTalkieConfig } from "./schema.ts";

export const SECRET_CONFIG_PATHS = [
  "providers.defaultAi.apiKey",
  "providers.telegram.botToken"
] as const;

type SecretConfigPath = (typeof SECRET_CONFIG_PATHS)[number];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneRecord(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneRecord(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, cloneRecord(nestedValue)])
  );
}

function setNestedValue(target: UnknownRecord, path: string, value: unknown): void {
  const segments = path.split(".");
  let current: UnknownRecord = target;

  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];
    if (!isRecord(next)) {
      return;
    }

    current = next;
  }

  current[segments.at(-1) as string] = value;
}

function getNestedValue(target: UnknownRecord, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = target;

  for (const segment of segments) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

export function isSecretConfigPath(path: string): path is SecretConfigPath {
  return SECRET_CONFIG_PATHS.includes(path as SecretConfigPath);
}

export function maskSecretValue(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    return "[not-set]";
  }

  const trimmed = value.trim();
  if (trimmed.length <= 4) {
    return "***";
  }

  return `${"*".repeat(Math.max(3, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

export function redactConfigSecrets(config: WalkieTalkieConfig): WalkieTalkieConfig {
  const clone = cloneRecord(config) as UnknownRecord;

  for (const path of SECRET_CONFIG_PATHS) {
    const currentValue = getNestedValue(clone, path);
    if (currentValue === undefined) {
      continue;
    }

    if (isEnvSecretReference(currentValue)) {
      const envName = parseEnvSecretReference(currentValue) ?? "UNKNOWN_ENV";
      setNestedValue(clone, path, `[env:${envName}]`);
      continue;
    }

    setNestedValue(clone, path, maskSecretValue(currentValue));
  }

  return clone as WalkieTalkieConfig;
}

export function buildSecretPresenceSummary(config: WalkieTalkieConfig): Record<SecretConfigPath, boolean> {
  const record = config as unknown as UnknownRecord;

  return Object.fromEntries(
    SECRET_CONFIG_PATHS.map((path) => {
      const value = getNestedValue(record, path);
      return [
        path,
        typeof value === "string" && value.trim().length > 0 && !isEnvSecretReference(value)
      ];
    })
  ) as Record<SecretConfigPath, boolean>;
}
