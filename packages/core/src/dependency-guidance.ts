import type { DependencyCheckSummary, DependencyName } from "./dependency-checker.contract.ts";

export type GuidanceSeverity = "info" | "warning" | "error";

export type DependencyGuidanceItem = {
  dependency: DependencyName;
  severity: GuidanceSeverity;
  message: string;
};

const INSTALL_HINTS: Record<DependencyName, string> = {
  node: "Install Node.js LTS from https://nodejs.org or via nvm.",
  npm: "Install npm with Node.js or enable Corepack/npm in your Node installation."
};

function buildMissingGuidance(dependency: DependencyName): DependencyGuidanceItem {
  return {
    dependency,
    severity: "error",
    message: `${dependency} is missing. ${INSTALL_HINTS[dependency]}`
  };
}

function buildUnsupportedVersionGuidance(
  dependency: DependencyName,
  message?: string
): DependencyGuidanceItem {
  return {
    dependency,
    severity: "error",
    message: `${dependency} version is unsupported. ${message ?? "Upgrade to a supported version."}`
  };
}

function buildErrorGuidance(dependency: DependencyName, message?: string): DependencyGuidanceItem {
  return {
    dependency,
    severity: "error",
    message: `Could not verify ${dependency}. ${message ?? "Check PATH and permissions, then retry."}`
  };
}

function buildOkGuidance(dependency: DependencyName, version?: string): DependencyGuidanceItem {
  return {
    dependency,
    severity: "info",
    message: `${dependency} is ready${version ? ` (v${version})` : ""}.`
  };
}

export function buildDependencyGuidance(summary: DependencyCheckSummary): DependencyGuidanceItem[] {
  return summary.results.map((result) => {
    if (result.health === "missing") {
      return buildMissingGuidance(result.name);
    }
    if (result.health === "unsupported_version") {
      return buildUnsupportedVersionGuidance(result.name, result.message);
    }
    if (result.health === "error") {
      return buildErrorGuidance(result.name, result.message);
    }
    return buildOkGuidance(result.name, result.detectedVersion);
  });
}

