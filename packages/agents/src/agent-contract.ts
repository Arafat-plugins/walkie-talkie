export const AGENT_CONTRACT_VERSION = "1" as const;

export const AGENT_TRIGGER_KINDS = [
  "cli",
  "schedule",
  "telegram",
  "webhook",
  "dashboard"
] as const;

export const AGENT_EXECUTION_MODES = ["manual", "assisted", "autonomous"] as const;

export const AGENT_STATUSES = ["active", "paused", "disabled"] as const;

export type AgentTriggerKind = (typeof AGENT_TRIGGER_KINDS)[number];
export type AgentExecutionMode = (typeof AGENT_EXECUTION_MODES)[number];
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export type AgentModelConfig = {
  provider: string;
  model: string;
  temperature?: number;
};

export type AgentTriggerBinding = {
  kind: AgentTriggerKind;
  event?: string;
  schedule?: string;
  pipelineId?: string;
};

export type AgentSkillBinding = {
  skillId: string;
  required: boolean;
};

export type AgentDefinition = {
  version: typeof AGENT_CONTRACT_VERSION;
  id: string;
  name: string;
  description?: string;
  status: AgentStatus;
  executionMode: AgentExecutionMode;
  prompt: string;
  model: AgentModelConfig;
  skills: AgentSkillBinding[];
  triggers: AgentTriggerBinding[];
  tags: string[];
};

export type AgentDefinitionInput = {
  id: string;
  name: string;
  description?: string;
  status?: AgentStatus;
  executionMode?: AgentExecutionMode;
  prompt: string;
  model: AgentModelConfig;
  skills?: AgentSkillBinding[];
  triggers?: AgentTriggerBinding[];
  tags?: string[];
};

export function createAgentDefinition(input: AgentDefinitionInput): AgentDefinition {
  return {
    version: AGENT_CONTRACT_VERSION,
    id: input.id,
    name: input.name,
    description: input.description,
    status: input.status ?? "active",
    executionMode: input.executionMode ?? "assisted",
    prompt: input.prompt,
    model: { ...input.model },
    skills: input.skills?.map((skill) => ({ ...skill })) ?? [],
    triggers: input.triggers?.map((trigger) => ({ ...trigger })) ?? [],
    tags: [...(input.tags ?? [])]
  };
}
