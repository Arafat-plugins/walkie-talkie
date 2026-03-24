import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { createAgentDefinition } from "../../packages/agents/src/index.ts";
import { writeConfigFile } from "../../packages/config/src/index.ts";
import { createAuditEvent } from "../../packages/logging/src/index.ts";
import { createMcpServerDefinition } from "../../packages/mcp/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import {
  bootstrapPersistentRuntime,
  buildPersistentRuntimeBootstrapSummary,
  createPersistentEntitySnapshot,
  createPersistentRuntimeSnapshot,
  InMemoryRunHistoryStore
} from "../../packages/runtime/src/index.ts";
import {
  resolveEntityStoragePath,
  resolveRuntimeStoragePath,
  writeEntityStorageFile,
  writeRuntimeStorageFile
} from "../../packages/shared/src/index.ts";
import { createSkillDefinition, SkillRegistryStore } from "../../packages/skills/src/index.ts";
import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import { McpRegistryStore } from "../../packages/mcp/src/index.ts";
import { InMemoryAuditEventStore } from "../../packages/logging/src/index.ts";

function createValidConfig() {
  return {
    version: "1" as const,
    project: {
      name: "demo-app",
      primaryTrigger: "cli" as const
    },
    runtime: {
      environment: "local" as const,
      logLevel: "info" as const
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

function createEntitySnapshot() {
  return createPersistentEntitySnapshot({
    agents: (() => {
      const registry = new AgentRegistryStore();
      registry.seed(
        createAgentDefinition({
          id: "agent-1",
          name: "Router",
          prompt: "Route tasks.",
          model: {
            provider: "default-ai",
            model: "gpt-4o-mini"
          },
          tags: ["ops"]
        })
      );
      return registry;
    })(),
    skills: (() => {
      const registry = new SkillRegistryStore();
      registry.seed(
        createSkillDefinition({
          id: "skill-1",
          name: "Echo Skill",
          tags: ["demo"],
          handler: async () => ({
            ok: true,
            output: "ready"
          })
        })
      );
      return registry;
    })(),
    mcpServers: (() => {
      const registry = new McpRegistryStore();
      registry.seed(
        createMcpServerDefinition({
          id: "mcp-1",
          name: "Filesystem MCP",
          connection: {
            transport: "stdio",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-filesystem"]
          }
        })
      );
      return registry;
    })(),
    pipelines: [
      createPipelineDefinition({
        id: "pipeline-1",
        name: "Ops Pipeline",
        startNodeId: "trigger-1",
        nodes: [{ id: "trigger-1", type: "trigger", label: "Trigger" }],
        edges: []
      })
    ],
    now: () => "2026-03-24T22:00:00.000Z"
  });
}

function createRuntimeSnapshot() {
  const historyStore = new InMemoryRunHistoryStore();
  historyStore.seed({
    runId: "run-1",
    pipelineId: "pipeline-1",
    pipelineName: "Ops Pipeline",
    triggerKind: "telegram",
    triggerEventName: "telegram.message.received",
    status: "success",
    startedAt: "2026-03-24T22:00:01.000Z",
    finishedAt: "2026-03-24T22:00:02.000Z"
  });

  const auditStore = new InMemoryAuditEventStore();
  auditStore.seed(
    createAuditEvent({
      id: "audit-1",
      category: "pipeline",
      action: "execute",
      target: {
        kind: "pipeline",
        id: "pipeline-1"
      },
      metadata: {
        source: "telegram"
      },
      now: () => "2026-03-24T22:00:03.000Z"
    })
  );

  return createPersistentRuntimeSnapshot({
    historyStore,
    auditStore,
    now: () => "2026-03-24T22:00:04.000Z"
  });
}

test("bootstrapPersistentRuntime restores config and disk-backed state into live stores", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-persistent-runtime-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createValidConfig());
    await writeEntityStorageFile(resolveEntityStoragePath(tempDir), createEntitySnapshot());
    await writeRuntimeStorageFile(resolveRuntimeStoragePath(tempDir), createRuntimeSnapshot());

    const result = await bootstrapPersistentRuntime(tempDir);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.state.config.project.name, "demo-app");
    assert.equal(result.state.agentRegistry.count(), 1);
    assert.equal(result.state.skillRegistry.count(), 1);
    assert.equal(result.state.mcpRegistry.count(), 1);
    assert.equal(result.state.pipelines.length, 1);
    assert.equal(result.state.historyStore.count(), 1);
    assert.equal(result.state.auditStore.count(), 1);
    assert.deepEqual(result.warnings, []);

    const skillResult = await result.state.skillRegistry.get("skill-1")?.handler({
      input: {
        text: "hello"
      }
    });

    assert.deepEqual(skillResult, {
      ok: false,
      error: 'Skill "skill-1" was loaded from file storage without a runtime handler.'
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("bootstrapPersistentRuntime falls back to empty snapshots when storage files are missing", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-persistent-runtime-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createValidConfig());

    const result = await bootstrapPersistentRuntime(tempDir);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.state.agentRegistry.count(), 0);
    assert.equal(result.state.historyStore.count(), 0);
    assert.equal(result.warnings.length, 2);
    assert.match(result.warnings[0] ?? "", /No entity snapshot/);
    assert.match(result.warnings[1] ?? "", /No runtime snapshot/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("bootstrapPersistentRuntime returns prefixed issues for invalid entity storage", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-persistent-runtime-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createValidConfig());
    const entityStoragePath = resolveEntityStoragePath(tempDir);
    await mkdir(dirname(entityStoragePath), { recursive: true });
    await writeFile(
      entityStoragePath,
      JSON.stringify({
        version: "2",
        updatedAt: "2026-03-24T22:00:00.000Z",
        agents: [],
        skills: [],
        mcpServers: [],
        pipelines: []
      }),
      "utf8"
    );

    const result = await bootstrapPersistentRuntime(tempDir);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }

    assert.equal(result.issues[0]?.path, "storage.entities.version");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("buildPersistentRuntimeBootstrapSummary reports restored state counts", () => {
  const lines = buildPersistentRuntimeBootstrapSummary({
    ok: true,
    configPath: "/tmp/walkie-talkie.config.json",
    entityStoragePath: "/tmp/.walkie-talkie/storage/entities.snapshot.json",
    runtimeStoragePath: "/tmp/.walkie-talkie/storage/runtime.snapshot.json",
    state: {
      config: createValidConfig(),
      entitySnapshot: createEntitySnapshot(),
      runtimeSnapshot: createRuntimeSnapshot(),
      agentRegistry: (() => {
        const registry = new AgentRegistryStore();
        registry.seed(createEntitySnapshot().agents[0]!);
        return registry;
      })(),
      skillRegistry: (() => {
        const registry = new SkillRegistryStore();
        registry.seed(createEntitySnapshot().skills[0]!);
        return registry;
      })(),
      mcpRegistry: (() => {
        const registry = new McpRegistryStore();
        registry.seed(createEntitySnapshot().mcpServers[0]!);
        return registry;
      })(),
      pipelines: createEntitySnapshot().pipelines,
      historyStore: (() => {
        const store = new InMemoryRunHistoryStore();
        store.seed(createRuntimeSnapshot().runs[0]!);
        return store;
      })(),
      auditStore: (() => {
        const store = new InMemoryAuditEventStore();
        store.seed(createRuntimeSnapshot().auditEvents[0]!);
        return store;
      })()
    },
    warnings: ["No runtime snapshot was found on disk; using empty runtime state."]
  });

  assert.deepEqual(lines, [
    "Persistent runtime config path: /tmp/walkie-talkie.config.json",
    "Persistent entity storage path: /tmp/.walkie-talkie/storage/entities.snapshot.json",
    "Persistent runtime storage path: /tmp/.walkie-talkie/storage/runtime.snapshot.json",
    "Persistent runtime readiness: ready",
    "- agents: 1",
    "- skills: 1",
    "- mcp servers: 1",
    "- pipelines: 1",
    "- runs: 1",
    "- audit events: 1",
    "- warning: No runtime snapshot was found on disk; using empty runtime state."
  ]);
});
