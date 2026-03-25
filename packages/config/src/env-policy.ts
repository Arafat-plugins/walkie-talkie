import type { WalkieTalkieConfig } from "./schema.ts";

export const ENV_SECRET_REFERENCE_PREFIX = "env:" as const;

export const SECRET_ENV_BINDINGS = {
  "providers.defaultAi.apiKey": "WALKIE_DEFAULT_AI_API_KEY",
  "providers.telegram.botToken": "WALKIE_TELEGRAM_BOT_TOKEN"
} as const;

export type SecretEnvBindingPath = keyof typeof SECRET_ENV_BINDINGS;
export type SecretEnvVariableName = (typeof SECRET_ENV_BINDINGS)[SecretEnvBindingPath];
export type EnvSecretReference = `${typeof ENV_SECRET_REFERENCE_PREFIX}${string}`;
export type SecretValueSource = "config" | "env-binding" | "env-reference" | "missing";

export type SecretValueResolution = {
  path: SecretEnvBindingPath;
  envName: SecretEnvVariableName;
  source: SecretValueSource;
  resolved: boolean;
};

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

function readEnvValue(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
  envName: string
): string | undefined {
  const value = env[envName];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function createEnvSecretReference(envName: SecretEnvVariableName | string): EnvSecretReference {
  return `${ENV_SECRET_REFERENCE_PREFIX}${envName}`;
}

export function isEnvSecretReference(value: unknown): value is EnvSecretReference {
  return typeof value === "string" && value.startsWith(ENV_SECRET_REFERENCE_PREFIX) && value.length > ENV_SECRET_REFERENCE_PREFIX.length;
}

export function parseEnvSecretReference(value: unknown): string | undefined {
  if (!isEnvSecretReference(value)) {
    return undefined;
  }

  return value.slice(ENV_SECRET_REFERENCE_PREFIX.length).trim() || undefined;
}

export function resolveConfigSecretsFromEnv(
  config: WalkieTalkieConfig,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): WalkieTalkieConfig {
  const clone = cloneRecord(config) as UnknownRecord;

  for (const [path, defaultEnvName] of Object.entries(SECRET_ENV_BINDINGS) as Array<
    [SecretEnvBindingPath, SecretEnvVariableName]
  >) {
    const currentValue = getNestedValue(clone, path);

    if (isEnvSecretReference(currentValue)) {
      const referencedEnvName = parseEnvSecretReference(currentValue);
      const referencedValue = referencedEnvName ? readEnvValue(env, referencedEnvName) : undefined;
      if (referencedValue !== undefined) {
        setNestedValue(clone, path, referencedValue);
      }
      continue;
    }

    const boundValue = readEnvValue(env, defaultEnvName);
    if (boundValue !== undefined) {
      setNestedValue(clone, path, boundValue);
    }
  }

  return clone as WalkieTalkieConfig;
}

export function buildSecretValueResolutionSummary(
  config: WalkieTalkieConfig,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): SecretValueResolution[] {
  const record = config as unknown as UnknownRecord;

  return (Object.entries(SECRET_ENV_BINDINGS) as Array<[SecretEnvBindingPath, SecretEnvVariableName]>).map(
    ([path, envName]) => {
      const currentValue = getNestedValue(record, path);

      if (isEnvSecretReference(currentValue)) {
        const referencedEnvName = parseEnvSecretReference(currentValue);
        const resolvedValue = referencedEnvName ? readEnvValue(env, referencedEnvName) : undefined;

        return {
          path,
          envName,
          source: "env-reference",
          resolved: resolvedValue !== undefined
        };
      }

      if (readEnvValue(env, envName) !== undefined) {
        return {
          path,
          envName,
          source: "env-binding",
          resolved: true
        };
      }

      if (typeof currentValue === "string" && currentValue.trim().length > 0) {
        return {
          path,
          envName,
          source: "config",
          resolved: true
        };
      }

      return {
        path,
        envName,
        source: "missing",
        resolved: false
      };
    }
  );
}

export function buildEnvLoadingPolicySummary(): string[] {
  return [
    "Env loading policy: env overrides known secret fields, while config stays authoritative for non-secret fields.",
    ...buildEnvTemplateLines().map((line) => `- ${line}`)
  ];
}

export function buildEnvTemplateLines(): string[] {
  return [
    "# Walkie-Talkie secret env template",
    "WALKIE_DEFAULT_AI_API_KEY=",
    "WALKIE_TELEGRAM_BOT_TOKEN="
  ];
}
