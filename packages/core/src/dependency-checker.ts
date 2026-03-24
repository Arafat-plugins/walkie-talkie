import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

import type {
  DependencyCheckResult,
  DependencyCheckSummary,
  DependencyChecker,
  DependencyName,
  DependencyRequirement
} from "./dependency-checker.contract.ts";

const execFileAsync = promisify(execFile);

type CommandSpec = {
  command: string;
  args: string[];
};

const COMMAND_MAP: Record<DependencyName, CommandSpec> = {
  node: { command: "node", args: ["--version"] },
  npm: { command: "npm", args: ["--version"] }
};

function normalizeVersion(raw: string): string {
  return raw.trim().replace(/^v/i, "");
}

function parseVersion(version: string): number[] | null {
  if (!/^\d+(\.\d+){0,2}$/.test(version)) {
    return null;
  }

  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts.slice(0, 3);
}

function isVersionSupported(detectedVersion: string, minVersion: string): boolean {
  const detected = parseVersion(detectedVersion);
  const minimum = parseVersion(minVersion);
  if (!detected || !minimum) {
    return false;
  }

  for (let i = 0; i < 3; i += 1) {
    if (detected[i] > minimum[i]) {
      return true;
    }
    if (detected[i] < minimum[i]) {
      return false;
    }
  }
  return true;
}

async function detectDependencyVersion(name: DependencyName): Promise<string> {
  const spec = COMMAND_MAP[name];
  const { stdout, stderr } = await execFileAsync(spec.command, spec.args);
  const rawOutput = stdout.trim() || stderr.trim();
  const normalized = normalizeVersion(rawOutput);

  // Some npm installations return empty output when spawned directly.
  if (!normalized && name === "npm") {
    const fallback = detectNpmVersionFromPackageJson();
    if (fallback) {
      return fallback;
    }
  }

  if (!normalized) {
    throw new Error(`${name} version command returned empty output.`);
  }

  return normalized;
}

function detectNpmVersionFromPackageJson(): string | null {
  const nodeBinDir = dirname(process.execPath);
  const npmPackageJsonPath = resolve(nodeBinDir, "../lib/node_modules/npm/package.json");
  if (!existsSync(npmPackageJsonPath)) {
    return null;
  }

  const raw = readFileSync(npmPackageJsonPath, "utf-8");
  const parsed = JSON.parse(raw) as { version?: string };
  if (!parsed.version) {
    return null;
  }

  return normalizeVersion(parsed.version);
}

export class SystemDependencyChecker implements DependencyChecker {
  async check(requirements: DependencyRequirement[]): Promise<DependencyCheckSummary> {
    const results = await Promise.all(requirements.map(async (requirement) => this.checkOne(requirement)));
    const hasBlockingIssue = results.some((result) => result.health !== "ok");

    return {
      results,
      hasBlockingIssue
    };
  }

  private async checkOne(requirement: DependencyRequirement): Promise<DependencyCheckResult> {
    try {
      const detectedVersion = await detectDependencyVersion(requirement.name);

      if (requirement.minVersion && !isVersionSupported(detectedVersion, requirement.minVersion)) {
        return {
          name: requirement.name,
          health: "unsupported_version",
          detectedVersion,
          message: `Requires >= ${requirement.minVersion}, found ${detectedVersion}.`
        };
      }

      return {
        name: requirement.name,
        health: "ok",
        detectedVersion
      };
    } catch (error) {
      const typedError = error as NodeJS.ErrnoException;
      if (typedError.code === "ENOENT") {
        return {
          name: requirement.name,
          health: "missing",
          message: `${requirement.name} is not installed or not available in PATH.`
        };
      }

      return {
        name: requirement.name,
        health: "error",
        message: typedError.message || `Failed to check ${requirement.name}.`
      };
    }
  }
}

export { isVersionSupported, parseVersion, normalizeVersion };
