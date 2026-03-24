import { AgentRegistryStore } from "../../agents/src/index.ts";
import {
  loadConfigFile,
  resolveConfigPath,
  type ConfigValidationIssue,
  type WalkieTalkieConfig
} from "../../config/src/index.ts";
import { InMemoryAuditEventStore } from "../../logging/src/index.ts";
import { McpRegistryStore } from "../../mcp/src/index.ts";
import { type PipelineDefinition } from "../../pipeline/src/index.ts";
import {
  createEntityStorageSnapshot,
  createRuntimeStorageSnapshot,
  loadEntityStorageFile,
  loadRuntimeStorageFile,
  resolveEntityStoragePath,
  resolveRuntimeStoragePath,
  type EntityStorageSnapshot,
  type RuntimeStorageSnapshot
} from "../../shared/src/index.ts";
import { SkillRegistryStore } from "../../skills/src/index.ts";
import { InMemoryRunHistoryStore } from "./run-history.ts";
import { verifyRuntimeReadiness } from "./readiness.ts";

export type PersistentRuntimeState = {
  config: WalkieTalkieConfig;
  entitySnapshot: EntityStorageSnapshot;
  runtimeSnapshot: RuntimeStorageSnapshot;
  agentRegistry: AgentRegistryStore;
  skillRegistry: SkillRegistryStore;
  mcpRegistry: McpRegistryStore;
  pipelines: PipelineDefinition[];
  historyStore: InMemoryRunHistoryStore;
  auditStore: InMemoryAuditEventStore;
};

export type PersistentRuntimeBootstrapSuccess = {
  ok: true;
  configPath: string;
  entityStoragePath: string;
  runtimeStoragePath: string;
  state: PersistentRuntimeState;
  warnings: string[];
};

export type PersistentRuntimeBootstrapFailure = {
  ok: false;
  configPath: string;
  entityStoragePath: string;
  runtimeStoragePath: string;
  issues: ConfigValidationIssue[];
};

export type PersistentRuntimeBootstrapResult =
  | PersistentRuntimeBootstrapSuccess
  | PersistentRuntimeBootstrapFailure;

function isMissingStorageFile(issues: ConfigValidationIssue[]): boolean {
  return issues.some(
    (issue) =>
      issue.path === "$file" &&
      (issue.message.includes("ENOENT") || issue.message.toLowerCase().includes("no such file"))
  );
}

function prefixIssues(prefix: string, issues: ConfigValidationIssue[]): ConfigValidationIssue[] {
  return issues.map((issue) => ({
    path: `${prefix}.${issue.path}`,
    message: issue.message
  }));
}

function hydrateAgentRegistry(snapshot: EntityStorageSnapshot): AgentRegistryStore {
  const registry = new AgentRegistryStore();
  for (const agent of snapshot.agents) {
    registry.seed(agent);
  }

  return registry;
}

function hydrateSkillRegistry(snapshot: EntityStorageSnapshot): SkillRegistryStore {
  const registry = new SkillRegistryStore();
  for (const skill of snapshot.skills) {
    registry.seed(skill);
  }

  return registry;
}

function hydrateMcpRegistry(snapshot: EntityStorageSnapshot): McpRegistryStore {
  const registry = new McpRegistryStore();
  for (const server of snapshot.mcpServers) {
    registry.seed(server);
  }

  return registry;
}

function hydrateRunHistoryStore(snapshot: RuntimeStorageSnapshot): InMemoryRunHistoryStore {
  const store = new InMemoryRunHistoryStore();
  for (const entry of snapshot.runs) {
    store.seed(entry);
  }

  return store;
}

function hydrateAuditStore(snapshot: RuntimeStorageSnapshot): InMemoryAuditEventStore {
  const store = new InMemoryAuditEventStore();
  for (const event of snapshot.auditEvents) {
    store.seed(event);
  }

  return store;
}

function createPersistentRuntimeState(input: {
  config: WalkieTalkieConfig;
  entitySnapshot: EntityStorageSnapshot;
  runtimeSnapshot: RuntimeStorageSnapshot;
}): PersistentRuntimeState {
  return {
    config: input.config,
    entitySnapshot: input.entitySnapshot,
    runtimeSnapshot: input.runtimeSnapshot,
    agentRegistry: hydrateAgentRegistry(input.entitySnapshot),
    skillRegistry: hydrateSkillRegistry(input.entitySnapshot),
    mcpRegistry: hydrateMcpRegistry(input.entitySnapshot),
    pipelines: input.entitySnapshot.pipelines.map((pipeline) => ({
      ...pipeline,
      nodes: pipeline.nodes.map((node) => ({
        ...node,
        config: node.config ? { ...node.config } : undefined
      })),
      edges: pipeline.edges.map((edge) => ({ ...edge })),
      tags: [...pipeline.tags]
    })),
    historyStore: hydrateRunHistoryStore(input.runtimeSnapshot),
    auditStore: hydrateAuditStore(input.runtimeSnapshot)
  };
}

export function buildPersistentRuntimeBootstrapSummary(
  result: PersistentRuntimeBootstrapResult
): string[] {
  const lines = [
    `Persistent runtime config path: ${result.configPath}`,
    `Persistent entity storage path: ${result.entityStoragePath}`,
    `Persistent runtime storage path: ${result.runtimeStoragePath}`
  ];

  if (!result.ok) {
    lines.push("Persistent runtime readiness: blocked");
    lines.push(...result.issues.map((issue) => `- ${issue.path}: ${issue.message}`));
    return lines;
  }

  lines.push("Persistent runtime readiness: ready");
  lines.push(`- agents: ${result.state.agentRegistry.count()}`);
  lines.push(`- skills: ${result.state.skillRegistry.count()}`);
  lines.push(`- mcp servers: ${result.state.mcpRegistry.count()}`);
  lines.push(`- pipelines: ${result.state.pipelines.length}`);
  lines.push(`- runs: ${result.state.historyStore.count()}`);
  lines.push(`- audit events: ${result.state.auditStore.count()}`);
  lines.push(...result.warnings.map((warning) => `- warning: ${warning}`));

  return lines;
}

export async function bootstrapPersistentRuntime(
  baseDirectory: string,
  options?: {
    configFileName?: string;
    entityStorageFileName?: string;
    runtimeStorageFileName?: string;
  }
): Promise<PersistentRuntimeBootstrapResult> {
  const configPath = resolveConfigPath(baseDirectory, options?.configFileName);
  const entityStoragePath = resolveEntityStoragePath(baseDirectory, options?.entityStorageFileName);
  const runtimeStoragePath = resolveRuntimeStoragePath(baseDirectory, options?.runtimeStorageFileName);

  const loadedConfig = await loadConfigFile(configPath);
  if (!loadedConfig.ok) {
    return {
      ok: false,
      configPath,
      entityStoragePath,
      runtimeStoragePath,
      issues: loadedConfig.issues
    };
  }

  const readiness = verifyRuntimeReadiness(loadedConfig.config);
  if (!readiness.ready) {
    return {
      ok: false,
      configPath,
      entityStoragePath,
      runtimeStoragePath,
      issues: readiness.issues
    };
  }

  const warnings: string[] = [];

  const loadedEntities = await loadEntityStorageFile(entityStoragePath);
  let entitySnapshot: EntityStorageSnapshot;
  if (!loadedEntities.ok) {
    if (isMissingStorageFile(loadedEntities.issues)) {
      warnings.push("No entity snapshot was found on disk; using empty entity state.");
      entitySnapshot = createEntityStorageSnapshot();
    } else {
      return {
        ok: false,
        configPath,
        entityStoragePath,
        runtimeStoragePath,
        issues: prefixIssues("storage.entities", loadedEntities.issues)
      };
    }
  } else {
    entitySnapshot = loadedEntities.snapshot;
  }

  const loadedRuntime = await loadRuntimeStorageFile(runtimeStoragePath);
  let runtimeSnapshot: RuntimeStorageSnapshot;
  if (!loadedRuntime.ok) {
    if (isMissingStorageFile(loadedRuntime.issues)) {
      warnings.push("No runtime snapshot was found on disk; using empty runtime state.");
      runtimeSnapshot = createRuntimeStorageSnapshot();
    } else {
      return {
        ok: false,
        configPath,
        entityStoragePath,
        runtimeStoragePath,
        issues: prefixIssues("storage.runtime", loadedRuntime.issues)
      };
    }
  } else {
    runtimeSnapshot = loadedRuntime.snapshot;
  }

  return {
    ok: true,
    configPath,
    entityStoragePath,
    runtimeStoragePath,
    state: createPersistentRuntimeState({
      config: loadedConfig.config,
      entitySnapshot,
      runtimeSnapshot
    }),
    warnings
  };
}

export function createPersistentEntitySnapshot(input: {
  agents?: AgentRegistryStore;
  skills?: SkillRegistryStore;
  mcpServers?: McpRegistryStore;
  pipelines?: PipelineDefinition[];
  now?: () => string;
}): EntityStorageSnapshot {
  return createEntityStorageSnapshot({
    agents: input.agents?.snapshot() ?? [],
    skills: input.skills?.snapshot() ?? [],
    mcpServers: input.mcpServers?.snapshot() ?? [],
    pipelines: input.pipelines ?? [],
    now: input.now
  });
}

export function createPersistentRuntimeSnapshot(input: {
  historyStore?: InMemoryRunHistoryStore;
  auditStore?: InMemoryAuditEventStore;
  now?: () => string;
}): RuntimeStorageSnapshot {
  return createRuntimeStorageSnapshot({
    runs: input.historyStore?.list() ?? [],
    auditEvents: input.auditStore?.list() ?? [],
    now: input.now
  });
}
