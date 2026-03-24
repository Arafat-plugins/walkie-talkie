import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import { writeConfigFile, type WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { createTriggerEvent } from "../../packages/core/src/index.ts";
import { createAuditEvent, InMemoryAuditEventStore } from "../../packages/logging/src/index.ts";
import { McpRegistryStore } from "../../packages/mcp/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import {
  bootstrapPersistentRuntime,
  createPersistentEntitySnapshot,
  createPersistentRuntimeSnapshot,
  executeConfiguredTriggerPipelineWithHistory,
  InMemoryRunHistoryStore
} from "../../packages/runtime/src/index.ts";
import {
  resolveEntityStoragePath,
  resolveRuntimeStoragePath,
  writeEntityStorageFile,
  writeRuntimeStorageFile
} from "../../packages/shared/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-persist-demo",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "local",
      logLevel: "info",
      flowBindings: [
        {
          triggerKind: "telegram",
          eventName: "telegram.message.received",
          pipelineId: "telegram-cursor-check"
        }
      ]
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo",
        model: "gpt-4o-mini"
      },
      telegram: {
        botToken: "telegram-demo-token"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

function createPipeline() {
  return createPipelineDefinition({
    id: "telegram-cursor-check",
    name: "Telegram Cursor Check",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Cursor Check Skill", config: { refId: "cursor-check-skill" } },
      { id: "response-1", type: "response", label: "Telegram Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });
}

test("persistent storage roundtrip restores entity metadata and runtime history after restart", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-persistence-integration-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createConfig());

    const agentRegistry = new AgentRegistryStore();
    agentRegistry.create({
      id: "router-agent",
      name: "Router Agent",
      prompt: "Route Telegram checks to the right skill.",
      model: {
        provider: "primary-openai",
        model: "gpt-4o-mini"
      },
      triggers: [
        {
          kind: "telegram",
          event: "telegram.message.received"
        }
      ]
    });

    const skillRegistry = new SkillRegistryStore();
    skillRegistry.register({
      id: "cursor-check-skill",
      name: "Cursor Check Skill",
      handler: async (context) => ({
        ok: true,
        output: {
          replyText: String(context.input.text ?? "").includes("cursor")
            ? "Cursor is installed on the server."
            : "Unknown state."
        }
      })
    });

    const mcpRegistry = new McpRegistryStore();
    mcpRegistry.seed({
      version: "1",
      id: "filesystem-mcp",
      name: "Filesystem MCP",
      status: "active",
      connection: {
        transport: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem"]
      },
      auth: {
        type: "none"
      },
      capabilities: [],
      tags: []
    });

    const historyStore = new InMemoryRunHistoryStore();
    const auditStore = new InMemoryAuditEventStore();
    const pipeline = createPipeline();

    const result = await executeConfiguredTriggerPipelineWithHistory({
      config: createConfig(),
      pipelines: [pipeline],
      trigger: createTriggerEvent({
        kind: "telegram",
        eventName: "telegram.message.received",
        sourceId: "998877",
        occurredAt: "2026-03-24T23:00:00.000Z",
        payload: {
          chatId: 998877,
          text: "check whether cursor is installed"
        }
      }),
      agentRegistry,
      skillRegistry,
      historyStore,
      now: () => "2026-03-24T23:00:00.000Z"
    });

    assert.equal(result.ok, true);

    auditStore.append(
      createAuditEvent({
        id: "audit-1",
        category: "runtime",
        action: "pipeline.execute",
        target: {
          kind: "pipeline",
          id: pipeline.id
        },
        metadata: {
          source: "telegram",
          restored: false
        },
        now: () => "2026-03-24T23:00:01.000Z"
      })
    );

    await writeEntityStorageFile(
      resolveEntityStoragePath(tempDir),
      createPersistentEntitySnapshot({
        agents: agentRegistry,
        skills: skillRegistry,
        mcpServers: mcpRegistry,
        pipelines: [pipeline],
        now: () => "2026-03-24T23:00:02.000Z"
      })
    );

    await writeRuntimeStorageFile(
      resolveRuntimeStoragePath(tempDir),
      createPersistentRuntimeSnapshot({
        historyStore,
        auditStore,
        now: () => "2026-03-24T23:00:03.000Z"
      })
    );

    const restored = await bootstrapPersistentRuntime(tempDir);
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }

    assert.deepEqual(restored.warnings, []);
    assert.equal(restored.state.agentRegistry.count(), 1);
    assert.equal(restored.state.skillRegistry.count(), 1);
    assert.equal(restored.state.mcpRegistry.count(), 1);
    assert.equal(restored.state.pipelines.length, 1);
    assert.equal(restored.state.historyStore.count(), 1);
    assert.equal(restored.state.auditStore.count(), 1);
    assert.equal(restored.state.historyStore.latest()?.pipelineId, "telegram-cursor-check");
    assert.equal(restored.state.auditStore.latest()?.id, "audit-1");
    assert.equal(restored.state.entitySnapshot.skills[0]?.id, "cursor-check-skill");

    const restoredSkillResult = await restored.state.skillRegistry.get("cursor-check-skill")?.handler({
      input: {
        text: "check whether cursor is installed"
      }
    });

    assert.deepEqual(restoredSkillResult, {
      ok: false,
      error: 'Skill "cursor-check-skill" was loaded from file storage without a runtime handler.'
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("persistent storage bootstrap blocks on malformed runtime snapshot", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-persistence-integration-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createConfig());
    const runtimeStoragePath = resolveRuntimeStoragePath(tempDir);
    await mkdir(dirname(runtimeStoragePath), { recursive: true });
    await writeFile(
      runtimeStoragePath,
      JSON.stringify({
        version: "2",
        updatedAt: "2026-03-24T23:00:03.000Z",
        runs: [],
        auditEvents: []
      }),
      "utf8"
    );

    const restored = await bootstrapPersistentRuntime(tempDir);
    assert.equal(restored.ok, false);
    if (restored.ok) {
      return;
    }

    assert.equal(restored.issues[0]?.path, "storage.runtime.version");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
