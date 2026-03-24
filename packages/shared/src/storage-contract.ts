import type { AgentDefinition } from "../../agents/src/agent-contract.ts";
import type { AuditEvent } from "../../logging/src/audit-event.ts";
import type { McpServerDefinition } from "../../mcp/src/mcp-contract.ts";
import type { PipelineDefinition } from "../../pipeline/src/pipeline-contract.ts";
import type { RuntimeRunHistoryEntry } from "../../runtime/src/run-history.ts";
import type { SkillDefinition } from "../../skills/src/skill-contract.ts";

export const STORAGE_CONTRACT_VERSION = "1" as const;

export const STORED_ENTITY_KINDS = ["agent", "skill", "mcp-server", "pipeline"] as const;

export type StoredEntityKind = (typeof STORED_ENTITY_KINDS)[number];

export type EntityStorageSnapshot = {
  version: typeof STORAGE_CONTRACT_VERSION;
  updatedAt: string;
  agents: AgentDefinition[];
  skills: SkillDefinition[];
  mcpServers: McpServerDefinition[];
  pipelines: PipelineDefinition[];
};

export type RuntimeStorageSnapshot = {
  version: typeof STORAGE_CONTRACT_VERSION;
  updatedAt: string;
  runs: RuntimeRunHistoryEntry[];
  auditEvents: AuditEvent[];
};

export type WalkieTalkieStorageAdapter = {
  loadEntities(): EntityStorageSnapshot | Promise<EntityStorageSnapshot>;
  saveEntities(snapshot: EntityStorageSnapshot): void | Promise<void>;
  loadRuntimeData(): RuntimeStorageSnapshot | Promise<RuntimeStorageSnapshot>;
  saveRuntimeData(snapshot: RuntimeStorageSnapshot): void | Promise<void>;
};

function cloneAgentDefinition(agent: AgentDefinition): AgentDefinition {
  return {
    ...agent,
    model: { ...agent.model },
    skills: agent.skills.map((skill) => ({ ...skill })),
    triggers: agent.triggers.map((trigger) => ({ ...trigger })),
    tags: [...agent.tags]
  };
}

function cloneSkillDefinition(skill: SkillDefinition): SkillDefinition {
  return {
    ...skill,
    parameters: skill.parameters.map((parameter) => ({ ...parameter })),
    tags: [...skill.tags],
    handler: skill.handler
  };
}

function cloneMcpServerDefinition(server: McpServerDefinition): McpServerDefinition {
  return {
    ...server,
    connection: {
      ...server.connection,
      args: [...(server.connection.args ?? [])]
    },
    auth: { ...server.auth },
    capabilities: server.capabilities.map((capability) => ({ ...capability })),
    tags: [...server.tags]
  };
}

function clonePipelineDefinition(pipeline: PipelineDefinition): PipelineDefinition {
  return {
    ...pipeline,
    nodes: pipeline.nodes.map((node) => ({
      ...node,
      config: node.config ? { ...node.config } : undefined
    })),
    edges: pipeline.edges.map((edge) => ({ ...edge })),
    tags: [...pipeline.tags]
  };
}

function cloneRunHistoryEntry(entry: RuntimeRunHistoryEntry): RuntimeRunHistoryEntry {
  return {
    ...entry
  };
}

function cloneAuditEvent(event: AuditEvent): AuditEvent {
  return {
    ...event,
    actor: event.actor ? { ...event.actor } : undefined,
    target: event.target ? { ...event.target } : undefined,
    metadata: event.metadata ? { ...event.metadata } : undefined
  };
}

export function createEntityStorageSnapshot(input?: {
  agents?: AgentDefinition[];
  skills?: SkillDefinition[];
  mcpServers?: McpServerDefinition[];
  pipelines?: PipelineDefinition[];
  now?: () => string;
}): EntityStorageSnapshot {
  return {
    version: STORAGE_CONTRACT_VERSION,
    updatedAt: (input?.now ?? (() => new Date().toISOString()))(),
    agents: (input?.agents ?? []).map((agent) => cloneAgentDefinition(agent)),
    skills: (input?.skills ?? []).map((skill) => cloneSkillDefinition(skill)),
    mcpServers: (input?.mcpServers ?? []).map((server) => cloneMcpServerDefinition(server)),
    pipelines: (input?.pipelines ?? []).map((pipeline) => clonePipelineDefinition(pipeline))
  };
}

export function createRuntimeStorageSnapshot(input?: {
  runs?: RuntimeRunHistoryEntry[];
  auditEvents?: AuditEvent[];
  now?: () => string;
}): RuntimeStorageSnapshot {
  return {
    version: STORAGE_CONTRACT_VERSION,
    updatedAt: (input?.now ?? (() => new Date().toISOString()))(),
    runs: (input?.runs ?? []).map((entry) => cloneRunHistoryEntry(entry)),
    auditEvents: (input?.auditEvents ?? []).map((event) => cloneAuditEvent(event))
  };
}

export function createNoopWalkieTalkieStorageAdapter(): WalkieTalkieStorageAdapter {
  return {
    loadEntities() {
      return createEntityStorageSnapshot();
    },
    saveEntities() {
      return;
    },
    loadRuntimeData() {
      return createRuntimeStorageSnapshot();
    },
    saveRuntimeData() {
      return;
    }
  };
}
