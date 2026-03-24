export const SKILL_CONTRACT_VERSION = "1" as const;

export const SKILL_EXECUTION_MODES = ["sync", "async"] as const;

export const SKILL_STATUSES = ["active", "deprecated", "disabled"] as const;

export type SkillExecutionMode = (typeof SKILL_EXECUTION_MODES)[number];
export type SkillStatus = (typeof SKILL_STATUSES)[number];

export type SkillParameterDefinition = {
  name: string;
  type: "string" | "number" | "boolean" | "json";
  required: boolean;
  description?: string;
};

export type SkillExecutionContext = {
  agentId?: string;
  triggerKind?: string;
  runId?: string;
  input: Record<string, unknown>;
};

export type SkillExecutionResult = {
  ok: boolean;
  output?: unknown;
  error?: string;
};

export type SkillHandler = (context: SkillExecutionContext) => Promise<SkillExecutionResult>;

export type SkillDefinition = {
  version: typeof SKILL_CONTRACT_VERSION;
  id: string;
  name: string;
  description?: string;
  status: SkillStatus;
  executionMode: SkillExecutionMode;
  parameters: SkillParameterDefinition[];
  tags: string[];
  handler: SkillHandler;
};

export type SkillDefinitionInput = {
  id: string;
  name: string;
  description?: string;
  status?: SkillStatus;
  executionMode?: SkillExecutionMode;
  parameters?: SkillParameterDefinition[];
  tags?: string[];
  handler: SkillHandler;
};

export function createSkillDefinition(input: SkillDefinitionInput): SkillDefinition {
  return {
    version: SKILL_CONTRACT_VERSION,
    id: input.id,
    name: input.name,
    description: input.description,
    status: input.status ?? "active",
    executionMode: input.executionMode ?? "async",
    parameters: input.parameters?.map((parameter) => ({ ...parameter })) ?? [],
    tags: [...(input.tags ?? [])],
    handler: input.handler
  };
}
