export type DependencyName = "node" | "npm";

export type DependencyHealth = "ok" | "missing" | "unsupported_version" | "error";

export type DependencyRequirement = {
  name: DependencyName;
  minVersion?: string;
};

export type DependencyCheckResult = {
  name: DependencyName;
  health: DependencyHealth;
  detectedVersion?: string;
  message?: string;
};

export type DependencyCheckSummary = {
  results: DependencyCheckResult[];
  hasBlockingIssue: boolean;
};

export interface DependencyChecker {
  check(requirements: DependencyRequirement[]): Promise<DependencyCheckSummary>;
}

