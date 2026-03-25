export const OPERATOR_SAFETY_CONTRACT_VERSION = "1" as const;

export const SAFETY_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export const APPROVAL_CHANNELS = ["cli", "dashboard", "telegram"] as const;

export type SafetyRiskLevel = (typeof SAFETY_RISK_LEVELS)[number];
export type ApprovalChannel = (typeof APPROVAL_CHANNELS)[number];

export type OperatorBudgetPolicy = {
  maxRuntimeMs?: number;
  maxAiCallsPerRun?: number;
  maxToolCallsPerRun?: number;
  maxBackgroundJobsPerHour?: number;
};

export type OperatorAllowlistPolicy = {
  skillIds?: string[];
  mcpServerIds?: string[];
  integrationIds?: string[];
  modelIds?: string[];
  triggerKinds?: string[];
};

export type OperatorApprovalPolicy = {
  requireApprovalForRiskLevels?: SafetyRiskLevel[];
  requireApprovalForAutonomousAgents?: boolean;
  channels: ApprovalChannel[];
  defaultTimeoutMs?: number;
};

export type OperatorSafetyProfile = {
  version: typeof OPERATOR_SAFETY_CONTRACT_VERSION;
  budgets: OperatorBudgetPolicy;
  allowlists: OperatorAllowlistPolicy;
  approvals: OperatorApprovalPolicy;
};

export type OperatorSafetyEvaluationContext = {
  riskLevel?: SafetyRiskLevel;
  autonomousAgent?: boolean;
  skillId?: string;
  mcpServerId?: string;
  integrationId?: string;
  modelId?: string;
  triggerKind?: string;
  runtimeMs?: number;
  aiCalls?: number;
  toolCalls?: number;
  backgroundJobsThisHour?: number;
};

export type OperatorSafetyDecision = {
  allowed: boolean;
  requiresApproval: boolean;
  approvalChannels: ApprovalChannel[];
  reasons: string[];
};

function cloneStringList(values?: string[]): string[] | undefined {
  return values ? [...values] : undefined;
}

function includesOrIsUnset(values: string[] | undefined, candidate: string | undefined): boolean {
  if (!values || values.length === 0 || candidate === undefined) {
    return true;
  }

  return values.includes(candidate);
}

function getRiskRank(level: SafetyRiskLevel): number {
  return SAFETY_RISK_LEVELS.indexOf(level);
}

function cloneBudgets(input?: OperatorBudgetPolicy): OperatorBudgetPolicy {
  return {
    maxRuntimeMs: input?.maxRuntimeMs,
    maxAiCallsPerRun: input?.maxAiCallsPerRun,
    maxToolCallsPerRun: input?.maxToolCallsPerRun,
    maxBackgroundJobsPerHour: input?.maxBackgroundJobsPerHour
  };
}

function cloneAllowlists(input?: OperatorAllowlistPolicy): OperatorAllowlistPolicy {
  return {
    skillIds: cloneStringList(input?.skillIds),
    mcpServerIds: cloneStringList(input?.mcpServerIds),
    integrationIds: cloneStringList(input?.integrationIds),
    modelIds: cloneStringList(input?.modelIds),
    triggerKinds: cloneStringList(input?.triggerKinds)
  };
}

function cloneApprovals(input?: Partial<OperatorApprovalPolicy>): OperatorApprovalPolicy {
  return {
    requireApprovalForRiskLevels: cloneStringList(
      input?.requireApprovalForRiskLevels as string[] | undefined
    ) as SafetyRiskLevel[] | undefined,
    requireApprovalForAutonomousAgents: input?.requireApprovalForAutonomousAgents ?? true,
    channels: [...(input?.channels ?? ["dashboard"])],
    defaultTimeoutMs: input?.defaultTimeoutMs ?? 300000
  };
}

export function createOperatorSafetyProfile(input?: {
  budgets?: OperatorBudgetPolicy;
  allowlists?: OperatorAllowlistPolicy;
  approvals?: Partial<OperatorApprovalPolicy>;
}): OperatorSafetyProfile {
  return {
    version: OPERATOR_SAFETY_CONTRACT_VERSION,
    budgets: cloneBudgets(input?.budgets),
    allowlists: cloneAllowlists(input?.allowlists),
    approvals: cloneApprovals(input?.approvals)
  };
}

export function evaluateOperatorSafety(
  profile: OperatorSafetyProfile,
  context: OperatorSafetyEvaluationContext
): OperatorSafetyDecision {
  const reasons: string[] = [];

  if (!includesOrIsUnset(profile.allowlists.skillIds, context.skillId)) {
    reasons.push(`Skill "${context.skillId}" is not in the operator allowlist.`);
  }

  if (!includesOrIsUnset(profile.allowlists.mcpServerIds, context.mcpServerId)) {
    reasons.push(`MCP server "${context.mcpServerId}" is not in the operator allowlist.`);
  }

  if (!includesOrIsUnset(profile.allowlists.integrationIds, context.integrationId)) {
    reasons.push(`Integration "${context.integrationId}" is not in the operator allowlist.`);
  }

  if (!includesOrIsUnset(profile.allowlists.modelIds, context.modelId)) {
    reasons.push(`Model "${context.modelId}" is not in the operator allowlist.`);
  }

  if (!includesOrIsUnset(profile.allowlists.triggerKinds, context.triggerKind)) {
    reasons.push(`Trigger "${context.triggerKind}" is not in the operator allowlist.`);
  }

  if (
    profile.budgets.maxRuntimeMs !== undefined &&
    context.runtimeMs !== undefined &&
    context.runtimeMs > profile.budgets.maxRuntimeMs
  ) {
    reasons.push(
      `Runtime budget exceeded (${context.runtimeMs}ms > ${profile.budgets.maxRuntimeMs}ms).`
    );
  }

  if (
    profile.budgets.maxAiCallsPerRun !== undefined &&
    context.aiCalls !== undefined &&
    context.aiCalls > profile.budgets.maxAiCallsPerRun
  ) {
    reasons.push(
      `AI call budget exceeded (${context.aiCalls} > ${profile.budgets.maxAiCallsPerRun}).`
    );
  }

  if (
    profile.budgets.maxToolCallsPerRun !== undefined &&
    context.toolCalls !== undefined &&
    context.toolCalls > profile.budgets.maxToolCallsPerRun
  ) {
    reasons.push(
      `Tool call budget exceeded (${context.toolCalls} > ${profile.budgets.maxToolCallsPerRun}).`
    );
  }

  if (
    profile.budgets.maxBackgroundJobsPerHour !== undefined &&
    context.backgroundJobsThisHour !== undefined &&
    context.backgroundJobsThisHour > profile.budgets.maxBackgroundJobsPerHour
  ) {
    reasons.push(
      `Background job budget exceeded (${context.backgroundJobsThisHour} > ${profile.budgets.maxBackgroundJobsPerHour}).`
    );
  }

  const approvalRiskLevels = profile.approvals.requireApprovalForRiskLevels ?? ["high", "critical"];
  const requiresApprovalForRisk =
    context.riskLevel !== undefined &&
    approvalRiskLevels.some((level) => getRiskRank(context.riskLevel!) >= getRiskRank(level));

  const requiresApprovalForAutonomy =
    profile.approvals.requireApprovalForAutonomousAgents === true && context.autonomousAgent === true;

  return {
    allowed: reasons.length === 0,
    requiresApproval: reasons.length === 0 && (requiresApprovalForRisk || requiresApprovalForAutonomy),
    approvalChannels:
      reasons.length === 0 && (requiresApprovalForRisk || requiresApprovalForAutonomy)
        ? [...profile.approvals.channels]
        : [],
    reasons
  };
}

export function buildOperatorSafetySummary(profile: OperatorSafetyProfile): string[] {
  return [
    `Operator safety profile version: ${profile.version}`,
    `Approval channels: ${profile.approvals.channels.join(", ")}`,
    `Approval timeout: ${profile.approvals.defaultTimeoutMs ?? 0}ms`,
    `Require approval for autonomy: ${profile.approvals.requireApprovalForAutonomousAgents ? "yes" : "no"}`,
    `Skill allowlist size: ${profile.allowlists.skillIds?.length ?? 0}`,
    `MCP allowlist size: ${profile.allowlists.mcpServerIds?.length ?? 0}`,
    `Integration allowlist size: ${profile.allowlists.integrationIds?.length ?? 0}`,
    `Model allowlist size: ${profile.allowlists.modelIds?.length ?? 0}`,
    `Trigger allowlist size: ${profile.allowlists.triggerKinds?.length ?? 0}`
  ];
}
