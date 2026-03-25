import { buildSecretPresenceSummary, type WalkieTalkieConfig } from "../../config/src/index.ts";

export type RuntimeReadinessIssue = {
  path: string;
  message: string;
};

export type RuntimeReadinessResult =
  | {
      ready: true;
      issues: [];
    }
  | {
      ready: false;
      issues: RuntimeReadinessIssue[];
    };

function pushIssue(issues: RuntimeReadinessIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

export function verifyRuntimeReadiness(config: WalkieTalkieConfig): RuntimeReadinessResult {
  const issues: RuntimeReadinessIssue[] = [];
  const secretPresence = buildSecretPresenceSummary(config);
  const aiAuthMode = config.providers.defaultAi.authMode ?? "api-key";

  if (aiAuthMode !== "codex" && !secretPresence["providers.defaultAi.apiKey"]) {
    pushIssue(
      issues,
      "providers.defaultAi.apiKey",
      "Runtime requires a configured default AI apiKey unless Codex auth mode is selected."
    );
  }

  if (config.project.primaryTrigger === "telegram" && !secretPresence["providers.telegram.botToken"]) {
    pushIssue(
      issues,
      "providers.telegram.botToken",
      'Runtime requires Telegram botToken when primaryTrigger is "telegram".'
    );
  }

  if (
    config.project.primaryTrigger === "telegram" &&
    config.runtime.telegram?.delivery?.mode === "webhook" &&
    !config.runtime.telegram.publicBaseUrl
  ) {
    pushIssue(
      issues,
      "runtime.telegram.publicBaseUrl",
      'Runtime requires telegram publicBaseUrl when Telegram delivery mode is "webhook".'
    );
  }

  if (issues.length > 0) {
    return {
      ready: false,
      issues
    };
  }

  return {
    ready: true,
    issues: []
  };
}
