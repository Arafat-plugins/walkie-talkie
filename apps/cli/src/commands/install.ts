import {
  SystemDependencyChecker,
  buildDependencyGuidance,
  type DependencyRequirement
} from "../../../../packages/core/src/index.ts";
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
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export type CommandResult = {
  exitCode: number;
};

const INSTALL_REQUIREMENTS: DependencyRequirement[] = [
  { name: "node", minVersion: "20.0.0" },
  { name: "npm", minVersion: "10.0.0" }
];

const execFileAsync = promisify(execFile);

const SKIP_BOOTSTRAP_ENV_KEY = "WALKIE_SKIP_BOOTSTRAP";
const SKIP_ONBOARDING_ENV_KEY = "WALKIE_SKIP_ONBOARDING";

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

function getOptionalBooleanAnswer(answers: OnboardingAnswers, key: string, fallback: boolean): boolean {
  const value = answers[key];
  return typeof value === "boolean" ? value : fallback;
}

export function buildConfigFromOnboardingAnswers(answers: OnboardingAnswers): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: getRequiredStringAnswer(answers, "projectName"),
      primaryTrigger: getRequiredStringAnswer(answers, "primaryTrigger") as "cli" | "telegram"
    },
    runtime: {
      environment: "local",
      logLevel: "info"
    },
    providers: {
      defaultAi: {
        apiKey: getRequiredStringAnswer(answers, "providerApiKey")
      }
    },
    bootstrap: {
      createExamplePipeline: getOptionalBooleanAnswer(answers, "confirmExamplePipeline", true)
    }
  };
}

async function runProjectBootstrap(): Promise<CommandResult> {
  const packageJsonPath = resolve(process.cwd(), "package.json");
  if (!existsSync(packageJsonPath)) {
    console.log("Install blocked. No package.json found in current directory.");
    console.log("Run `walkie-talkie install` from your Walkie-Talkie project root.");
    return { exitCode: 1 };
  }

  console.log("Bootstrapping project dependencies with npm install...");
  try {
    await execFileAsync("npm", ["install"], { cwd: process.cwd() });
    console.log("Project dependencies installed successfully.");
    return { exitCode: 0 };
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException;
    console.log("Install bootstrap failed while running npm install.");
    console.log(typedError.message || "Unknown npm install failure.");
    return { exitCode: 1 };
  }
}

async function runOnboardingFlow(): Promise<CommandResult> {
  const io = createTerminalPromptIO();
  const result = await executeOnboardingFlow(io);

  if (!result.ok) {
    console.log("Onboarding validation failed:");
    for (const issue of result.validation.issues) {
      console.log(`- ${issue.message}`);
    }
    return { exitCode: 1 };
  }

  const config = buildConfigFromOnboardingAnswers(result.answers);
  const configPath = resolveConfigPath(process.cwd());
  await writeConfigFile(configPath, config);

  console.log("Onboarding answers collected successfully.");
  console.log(`- projectName: ${result.answers.projectName}`);
  console.log(`- primaryTrigger: ${result.answers.primaryTrigger}`);
  console.log(`- confirmExamplePipeline: ${String(result.answers.confirmExamplePipeline)}`);
  console.log(`Config saved to: ${configPath}`);

  const runtimeResult = await bootstrapRuntime(process.cwd());
  for (const line of buildRuntimeBootstrapSummary(runtimeResult)) {
    console.log(line);
  }

  if (!runtimeResult.ok) {
    return { exitCode: 1 };
  }

  return { exitCode: 0 };
}

/**
 * Runs dependency checks and prints actionable guidance for install readiness.
 */
export async function executeInstallCommand(): Promise<CommandResult> {
  const checker = new SystemDependencyChecker();
  const summary = await checker.check(INSTALL_REQUIREMENTS);
  const guidance = buildDependencyGuidance(summary);

  console.log("Dependency check results:");
  for (const item of guidance) {
    console.log(`- [${item.severity}] ${item.message}`);
  }

  if (summary.hasBlockingIssue) {
    console.log("Install blocked. Resolve dependency issues and run again.");
    return { exitCode: 1 };
  }

  if (process.env[SKIP_BOOTSTRAP_ENV_KEY] === "1") {
    console.log(`Dependency bootstrap skipped via ${SKIP_BOOTSTRAP_ENV_KEY}=1.`);
    if (process.env[SKIP_ONBOARDING_ENV_KEY] === "1") {
      console.log(`Onboarding skipped via ${SKIP_ONBOARDING_ENV_KEY}=1.`);
      console.log("Dependencies are ready. Next step: onboarding setup (M4).");
      return { exitCode: 0 };
    }

    const onboardingResult = await runOnboardingFlow();
    return onboardingResult.exitCode === 0
      ? { exitCode: 0 }
      : onboardingResult;
  }

  const bootstrapResult = await runProjectBootstrap();
  if (bootstrapResult.exitCode !== 0) {
    return bootstrapResult;
  }

  if (process.env[SKIP_ONBOARDING_ENV_KEY] === "1") {
    console.log(`Onboarding skipped via ${SKIP_ONBOARDING_ENV_KEY}=1.`);
    return { exitCode: 0 };
  }

  return runOnboardingFlow();
}
