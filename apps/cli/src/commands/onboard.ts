import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { spawn } from "node:child_process";

import {
  executeOnboardingFlow,
  type OnboardingAnswers,
  type OnboardingPromptIO
} from "../../../../packages/onboarding/src/index.ts";
import {
  resolveConfigPath,
  writeConfigFile,
  type WalkieTalkieConfig
} from "../../../../packages/config/src/index.ts";
import {
  bootstrapRuntime,
  buildRuntimeBootstrapSummary
} from "../../../../packages/runtime/src/index.ts";

export type CommandResult = {
  exitCode: number;
};

const SKIP_CODEX_CONNECT_ENV_KEY = "WALKIE_SKIP_CODEX_CONNECT";

function createTerminalPromptIO(): OnboardingPromptIO {
  const rl = readline.createInterface({ input, output });

  return {
    writeLine(line) {
      console.log(line);
    },
    async ask(prompt) {
      return rl.question(prompt);
    }
  };
}

function getRequiredStringAnswer(answers: OnboardingAnswers, key: string): string {
  const value = answers[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Onboarding answer "${key}" is required.`);
  }

  return value.trim();
}

function getOptionalStringAnswer(
  answers: OnboardingAnswers,
  key: string,
  fallback?: string
): string | undefined {
  const value = answers[key];
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed === "" ? fallback : trimmed;
}

function getOptionalBooleanAnswer(answers: OnboardingAnswers, key: string, fallback: boolean): boolean {
  const value = answers[key];
  return typeof value === "boolean" ? value : fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function shouldUseCodexAuth(answers: OnboardingAnswers): boolean {
  return getRequiredStringAnswer(answers, "aiAuthMode") === "codex";
}

function resolvePreferredChannel(
  answers: OnboardingAnswers
): "telegram" | "whatsapp" | "discord" {
  return getRequiredStringAnswer(answers, "communicationChannel") as
    | "telegram"
    | "whatsapp"
    | "discord";
}

async function maybeConnectCodex(answers: OnboardingAnswers): Promise<void> {
  if (!shouldUseCodexAuth(answers)) {
    return;
  }

  if (!getOptionalBooleanAnswer(answers, "connectCodexNow", true)) {
    return;
  }

  if (process.env[SKIP_CODEX_CONNECT_ENV_KEY] === "1") {
    console.log(`Codex connection skipped via ${SKIP_CODEX_CONNECT_ENV_KEY}=1.`);
    return;
  }

  console.log("Launching Codex device-auth flow...");

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn("codex", ["login", "--device-auth"], {
      stdio: "inherit"
    });

    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Codex login exited with code ${code ?? 1}.`));
    });
  });
}

export function buildConfigFromOnboardingAnswers(answers: OnboardingAnswers): WalkieTalkieConfig {
  const runtimeEnvironment = getRequiredStringAnswer(answers, "runtimeEnvironment") as "local" | "server";
  const preferredChannel = resolvePreferredChannel(answers);
  const providerModel = getOptionalStringAnswer(answers, "providerModel", "gpt-4o-mini");
  const aiAuthMode = getRequiredStringAnswer(answers, "aiAuthMode") as "api-key" | "codex";
  const providerApiKey = getOptionalStringAnswer(answers, "providerApiKey");
  const channelCredential = getOptionalStringAnswer(answers, "channelCredential");
  const telegramDeliveryMode =
    (getOptionalStringAnswer(answers, "telegramDeliveryMode", "polling") as "polling" | "webhook") ??
    "polling";
  const telegramPublicBaseUrl = getOptionalStringAnswer(answers, "telegramPublicBaseUrl");
  const telegramPollingIntervalMs = parsePositiveInteger(
    getOptionalStringAnswer(answers, "telegramPollingIntervalMs"),
    2000
  );

  const config: WalkieTalkieConfig = {
    version: "1",
    project: {
      name: getRequiredStringAnswer(answers, "projectName"),
      primaryTrigger: preferredChannel === "telegram" ? "telegram" : "cli",
      preferredChannel
    },
    runtime: {
      environment: runtimeEnvironment,
      logLevel: "info",
      access: {
        fullMachineAccess: getOptionalBooleanAnswer(answers, "fullMachineAccess", false)
      }
    },
    providers: {
      defaultAi: {
        apiKey: aiAuthMode === "api-key" ? providerApiKey : undefined,
        model: providerModel,
        authMode: aiAuthMode
      }
    },
    bootstrap: {
      createExamplePipeline: getOptionalBooleanAnswer(answers, "confirmExamplePipeline", true)
    }
  };

  if (preferredChannel === "telegram") {
    config.providers.telegram = {
      botToken: channelCredential
    };
    config.runtime.telegram = {
      enabled: true,
      delivery:
        telegramDeliveryMode === "webhook"
          ? {
              mode: "webhook",
              webhookPath: "/telegram/webhook"
            }
          : {
              mode: "polling",
              pollingIntervalMs: telegramPollingIntervalMs
            }
    };

    if (telegramDeliveryMode === "webhook" && telegramPublicBaseUrl) {
      config.runtime.telegram.publicBaseUrl = telegramPublicBaseUrl;
    }
  }

  if (preferredChannel === "whatsapp") {
    config.providers.whatsapp = {
      accessToken: channelCredential
    };
  }

  if (preferredChannel === "discord") {
    config.providers.discord = {
      botToken: channelCredential
    };
  }

  return config;
}

export async function executeOnboardFlowWithIo(
  io: OnboardingPromptIO,
  baseDirectory = process.cwd()
): Promise<CommandResult> {
  const result = await executeOnboardingFlow(io);

  if (!result.ok) {
    console.log("Onboarding validation failed:");
    for (const issue of result.validation.issues) {
      console.log(`- ${issue.message}`);
    }
    return { exitCode: 1 };
  }

  try {
    await maybeConnectCodex(result.answers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Codex connection failure.";
    console.log("Codex connection failed during onboarding.");
    console.log(message);
    return { exitCode: 1 };
  }

  const config = buildConfigFromOnboardingAnswers(result.answers);
  const configPath = resolveConfigPath(baseDirectory);
  await writeConfigFile(configPath, config);

  console.log("Onboarding answers collected successfully.");
  console.log(`- projectName: ${result.answers.projectName}`);
  console.log(`- communicationChannel: ${String(result.answers.communicationChannel)}`);
  console.log(`- aiAuthMode: ${String(result.answers.aiAuthMode)}`);
  console.log(`- runtimeEnvironment: ${String(result.answers.runtimeEnvironment)}`);
  console.log(`- fullMachineAccess: ${String(result.answers.fullMachineAccess)}`);
  console.log(
    `- telegramDeliveryMode: ${String(result.answers.telegramDeliveryMode ?? "polling")}`
  );
  console.log(`- confirmExamplePipeline: ${String(result.answers.confirmExamplePipeline)}`);
  console.log(`Config saved to: ${configPath}`);

  if (result.answers.communicationChannel !== "telegram") {
    console.log(
      `Saved ${String(result.answers.communicationChannel)} credentials for future connector wiring. Telegram remains the live runtime channel today.`
    );
  }

  const runtimeResult = await bootstrapRuntime(baseDirectory);
  for (const line of buildRuntimeBootstrapSummary(runtimeResult)) {
    console.log(line);
  }

  return { exitCode: runtimeResult.ok ? 0 : 1 };
}

export async function executeOnboardCommand(): Promise<CommandResult> {
  const io = createTerminalPromptIO();
  return executeOnboardFlowWithIo(io);
}
