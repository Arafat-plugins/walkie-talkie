import {
  SystemDependencyChecker,
  buildDependencyGuidance,
  type DependencyRequirement
} from "../../../../packages/core/src/index.ts";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { executeOnboardCommand, type CommandResult } from "./onboard.ts";

export type { CommandResult } from "./onboard.ts";

const INSTALL_REQUIREMENTS: DependencyRequirement[] = [
  { name: "node", minVersion: "20.0.0" },
  { name: "npm", minVersion: "10.0.0" }
];

const execFileAsync = promisify(execFile);

const SKIP_BOOTSTRAP_ENV_KEY = "WALKIE_SKIP_BOOTSTRAP";
const SKIP_ONBOARDING_ENV_KEY = "WALKIE_SKIP_ONBOARDING";

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
      console.log("Dependencies are ready.");
      console.log("Next step: run `walkie-talkie onboard` to configure your project from the terminal.");
      return { exitCode: 0 };
    }
    console.log("Dependencies are ready. Starting terminal onboarding...");
    return executeOnboardCommand();
  }

  const bootstrapResult = await runProjectBootstrap();
  if (bootstrapResult.exitCode !== 0) {
    return bootstrapResult;
  }

  if (process.env[SKIP_ONBOARDING_ENV_KEY] === "1") {
    console.log(`Onboarding skipped via ${SKIP_ONBOARDING_ENV_KEY}=1.`);
  } else {
    console.log("Dependency install complete. Starting terminal onboarding...");
    return executeOnboardCommand();
  }

  return { exitCode: 0 };
}
