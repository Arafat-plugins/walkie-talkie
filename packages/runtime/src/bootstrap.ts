import {
  loadConfigFile,
  resolveConfigPath,
  resolveConfigSecretsFromEnv,
  type WalkieTalkieConfig
} from "../../config/src/index.ts";
import { verifyRuntimeReadiness } from "./readiness.ts";

export type RuntimeBootstrapSuccess = {
  ok: true;
  configPath: string;
  config: WalkieTalkieConfig;
};

export type RuntimeBootstrapFailure = {
  ok: false;
  configPath: string;
  issues: { path: string; message: string }[];
};

export type RuntimeBootstrapResult = RuntimeBootstrapSuccess | RuntimeBootstrapFailure;

export function buildRuntimeBootstrapSummary(result: RuntimeBootstrapResult): string[] {
  const lines = [`Runtime bootstrap config path: ${result.configPath}`];

  if (!result.ok) {
    lines.push("Runtime readiness: blocked");
    lines.push(...result.issues.map((issue) => `- ${issue.path}: ${issue.message}`));
    return lines;
  }

  lines.push("Runtime readiness: ready");
  lines.push(`- project: ${result.config.project.name}`);
  lines.push(`- trigger: ${result.config.project.primaryTrigger}`);
  lines.push(`- environment: ${result.config.runtime.environment}`);

  return lines;
}

export async function bootstrapRuntime(
  baseDirectory: string,
  fileName?: string,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): Promise<RuntimeBootstrapResult> {
  const configPath = resolveConfigPath(baseDirectory, fileName);
  const loaded = await loadConfigFile(configPath);

  if (!loaded.ok) {
    return {
      ok: false,
      configPath,
      issues: loaded.issues
    };
  }

  const resolvedConfig = resolveConfigSecretsFromEnv(loaded.config, env);
  const readiness = verifyRuntimeReadiness(resolvedConfig);
  if (!readiness.ready) {
    return {
      ok: false,
      configPath,
      issues: readiness.issues
    };
  }

  return {
    ok: true,
    configPath,
    config: resolvedConfig
  };
}
