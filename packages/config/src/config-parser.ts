import type {
  ConfigValidationIssue,
  ConfigValidationResult,
  WalkieTalkieConfig
} from "./schema.ts";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pushIssue(issues: ConfigValidationIssue[], path: string, message: string) {
  issues.push({ path, message });
}

export function parseConfigString(raw: string): unknown {
  return JSON.parse(raw);
}

export function validateConfig(config: unknown): ConfigValidationResult {
  const issues: ConfigValidationIssue[] = [];

  if (!isRecord(config)) {
    return {
      valid: false,
      issues: [{ path: "$", message: "Config must be an object." }]
    };
  }

  if (config.version !== "1") {
    pushIssue(issues, "version", 'Version must be "1".');
  }

  if (!isRecord(config.project)) {
    pushIssue(issues, "project", "Project section is required.");
  } else {
    if (!isNonEmptyString(config.project.name)) {
      pushIssue(issues, "project.name", "Project name must be a non-empty string.");
    }

    if (config.project.primaryTrigger !== "cli" && config.project.primaryTrigger !== "telegram") {
      pushIssue(issues, "project.primaryTrigger", 'Primary trigger must be "cli" or "telegram".');
    }

    if (
      config.project.preferredChannel !== undefined &&
      config.project.preferredChannel !== "telegram" &&
      config.project.preferredChannel !== "whatsapp" &&
      config.project.preferredChannel !== "discord"
    ) {
      pushIssue(
        issues,
        "project.preferredChannel",
        'Preferred channel must be "telegram", "whatsapp", or "discord".'
      );
    }
  }

  if (!isRecord(config.runtime)) {
    pushIssue(issues, "runtime", "Runtime section is required.");
  } else {
    if (config.runtime.environment !== "local" && config.runtime.environment !== "server") {
      pushIssue(issues, "runtime.environment", 'Runtime environment must be "local" or "server".');
    }

    if (
      config.runtime.logLevel !== undefined &&
      config.runtime.logLevel !== "info" &&
      config.runtime.logLevel !== "warning" &&
      config.runtime.logLevel !== "error" &&
      config.runtime.logLevel !== "debug"
    ) {
      pushIssue(issues, "runtime.logLevel", "Runtime logLevel is invalid.");
    }

    if (config.runtime.access !== undefined) {
      if (!isRecord(config.runtime.access)) {
        pushIssue(issues, "runtime.access", "Runtime access config must be an object.");
      } else if (
        config.runtime.access.fullMachineAccess !== undefined &&
        typeof config.runtime.access.fullMachineAccess !== "boolean"
      ) {
        pushIssue(
          issues,
          "runtime.access.fullMachineAccess",
          "Runtime access fullMachineAccess must be a boolean."
        );
      }
    }

    if (config.runtime.telegram !== undefined) {
      if (!isRecord(config.runtime.telegram)) {
        pushIssue(issues, "runtime.telegram", "Runtime telegram config must be an object.");
      } else {
        if (
          config.runtime.telegram.enabled !== undefined &&
          typeof config.runtime.telegram.enabled !== "boolean"
        ) {
          pushIssue(issues, "runtime.telegram.enabled", "Runtime telegram enabled must be a boolean.");
        }

        if (config.runtime.telegram.delivery !== undefined) {
          if (!isRecord(config.runtime.telegram.delivery)) {
            pushIssue(
              issues,
              "runtime.telegram.delivery",
              "Runtime telegram delivery config must be an object."
            );
          } else {
            if (
              config.runtime.telegram.delivery.mode !== "webhook" &&
              config.runtime.telegram.delivery.mode !== "polling"
            ) {
              pushIssue(
                issues,
                "runtime.telegram.delivery.mode",
                'Runtime telegram delivery mode must be "webhook" or "polling".'
              );
            }

            if (
              config.runtime.telegram.delivery.webhookPath !== undefined &&
              !isNonEmptyString(config.runtime.telegram.delivery.webhookPath)
            ) {
              pushIssue(
                issues,
                "runtime.telegram.delivery.webhookPath",
                "Runtime telegram webhookPath must be a non-empty string."
              );
            }

            if (
              config.runtime.telegram.delivery.pollingIntervalMs !== undefined
            ) {
              const pollingIntervalMs = config.runtime.telegram.delivery.pollingIntervalMs;

              if (
                typeof pollingIntervalMs !== "number" ||
                !Number.isInteger(pollingIntervalMs) ||
                pollingIntervalMs <= 0
              ) {
                pushIssue(
                  issues,
                  "runtime.telegram.delivery.pollingIntervalMs",
                "Runtime telegram pollingIntervalMs must be a positive integer."
              );
              }
            }
          }
        }

        if (
          config.runtime.telegram.publicBaseUrl !== undefined &&
          !isNonEmptyString(config.runtime.telegram.publicBaseUrl)
        ) {
          pushIssue(
            issues,
            "runtime.telegram.publicBaseUrl",
            "Runtime telegram publicBaseUrl must be a non-empty string."
          );
        }

        if (
          config.runtime.telegram.webhookSecretToken !== undefined &&
          !isNonEmptyString(config.runtime.telegram.webhookSecretToken)
        ) {
          pushIssue(
            issues,
            "runtime.telegram.webhookSecretToken",
            "Runtime telegram webhookSecretToken must be a non-empty string."
          );
        }

        if (
          isRecord(config.runtime.telegram.delivery) &&
          config.runtime.telegram.delivery.mode === "webhook" &&
          !isNonEmptyString(config.runtime.telegram.publicBaseUrl)
        ) {
          pushIssue(
            issues,
            "runtime.telegram.publicBaseUrl",
            "Runtime telegram publicBaseUrl is required when delivery mode is webhook."
          );
        }
      }
    }

    if (config.runtime.flowBindings !== undefined) {
      if (!Array.isArray(config.runtime.flowBindings)) {
        pushIssue(issues, "runtime.flowBindings", "Runtime flowBindings must be an array.");
      } else {
        for (const [index, binding] of config.runtime.flowBindings.entries()) {
          if (!isRecord(binding)) {
            pushIssue(issues, `runtime.flowBindings[${index}]`, "Flow binding must be an object.");
            continue;
          }

          if (
            binding.triggerKind !== "cli" &&
            binding.triggerKind !== "schedule" &&
            binding.triggerKind !== "telegram" &&
            binding.triggerKind !== "webhook" &&
            binding.triggerKind !== "dashboard"
          ) {
            pushIssue(
              issues,
              `runtime.flowBindings[${index}].triggerKind`,
              'Flow binding triggerKind must be one of "cli", "schedule", "telegram", "webhook", or "dashboard".'
            );
          }

          if (binding.eventName !== undefined && !isNonEmptyString(binding.eventName)) {
            pushIssue(
              issues,
              `runtime.flowBindings[${index}].eventName`,
              "Flow binding eventName must be a non-empty string."
            );
          }

          if (!isNonEmptyString(binding.pipelineId)) {
            pushIssue(
              issues,
              `runtime.flowBindings[${index}].pipelineId`,
              "Flow binding pipelineId must be a non-empty string."
            );
          }
        }
      }
    }
  }

  if (!isRecord(config.providers)) {
    pushIssue(issues, "providers", "Providers section is required.");
  } else if (!isRecord(config.providers.defaultAi)) {
    pushIssue(issues, "providers.defaultAi", "Default AI provider is required.");
  } else {
    if (
      config.providers.defaultAi.apiKey !== undefined &&
      !isNonEmptyString(config.providers.defaultAi.apiKey)
    ) {
      pushIssue(issues, "providers.defaultAi.apiKey", "Default AI apiKey must be a non-empty string.");
    }

    if (
      config.providers.defaultAi.baseUrl !== undefined &&
      !isNonEmptyString(config.providers.defaultAi.baseUrl)
    ) {
      pushIssue(issues, "providers.defaultAi.baseUrl", "Default AI baseUrl must be a non-empty string.");
    }

    if (
      config.providers.defaultAi.model !== undefined &&
      !isNonEmptyString(config.providers.defaultAi.model)
    ) {
      pushIssue(issues, "providers.defaultAi.model", "Default AI model must be a non-empty string.");
    }

    if (
      config.providers.defaultAi.authMode !== undefined &&
      config.providers.defaultAi.authMode !== "api-key" &&
      config.providers.defaultAi.authMode !== "codex"
    ) {
      pushIssue(
        issues,
        "providers.defaultAi.authMode",
        'Default AI authMode must be "api-key" or "codex".'
      );
    }

    if (
      config.providers.defaultAi.authMode !== "codex" &&
      !isNonEmptyString(config.providers.defaultAi.apiKey)
    ) {
      pushIssue(
        issues,
        "providers.defaultAi.apiKey",
        "Default AI apiKey must be a non-empty string when authMode is api-key."
      );
    }
  }

  if (
    isRecord(config.providers) &&
    config.providers.telegram !== undefined &&
    (!isRecord(config.providers.telegram) ||
      (config.providers.telegram.botToken !== undefined &&
        !isNonEmptyString(config.providers.telegram.botToken)))
  ) {
    pushIssue(issues, "providers.telegram.botToken", "Telegram botToken must be a non-empty string.");
  }

  if (
    isRecord(config.providers) &&
    config.providers.whatsapp !== undefined &&
    (!isRecord(config.providers.whatsapp) ||
      (config.providers.whatsapp.accessToken !== undefined &&
        !isNonEmptyString(config.providers.whatsapp.accessToken)))
  ) {
    pushIssue(
      issues,
      "providers.whatsapp.accessToken",
      "WhatsApp accessToken must be a non-empty string."
    );
  }

  if (
    isRecord(config.providers) &&
    config.providers.discord !== undefined &&
    (!isRecord(config.providers.discord) ||
      (config.providers.discord.botToken !== undefined &&
        !isNonEmptyString(config.providers.discord.botToken)))
  ) {
    pushIssue(
      issues,
      "providers.discord.botToken",
      "Discord botToken must be a non-empty string."
    );
  }

  if (!isRecord(config.bootstrap)) {
    pushIssue(issues, "bootstrap", "Bootstrap section is required.");
  } else if (typeof config.bootstrap.createExamplePipeline !== "boolean") {
    pushIssue(
      issues,
      "bootstrap.createExamplePipeline",
      "Bootstrap createExamplePipeline must be a boolean."
    );
  }

  if (issues.length > 0) {
    return {
      valid: false,
      issues
    };
  }

  return {
    valid: true,
    issues: []
  };
}

export function parseAndValidateConfig(raw: string):
  | { ok: true; config: WalkieTalkieConfig }
  | { ok: false; issues: ConfigValidationIssue[] } {
  let parsed: unknown;

  try {
    parsed = parseConfigString(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    return {
      ok: false,
      issues: [{ path: "$", message }]
    };
  }

  const validation = validateConfig(parsed);
  if (!validation.valid) {
    return {
      ok: false,
      issues: validation.issues
    };
  }

  return {
    ok: true,
    config: parsed as WalkieTalkieConfig
  };
}
