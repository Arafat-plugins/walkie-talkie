import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { InMemoryAuditEventStore } from "../../packages/logging/src/index.ts";
import { McpRegistryStore } from "../../packages/mcp/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import { InMemoryRunHistoryStore } from "../../packages/runtime/src/index.ts";
import { loadRuntimeStorageFile, resolveRuntimeStoragePath } from "../../packages/shared/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";
import { executeTelegramPollOnceCommand } from "../../apps/cli/src/commands/telegram-poll-once.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1" as const,
    project: {
      name: "walkie-real-test",
      primaryTrigger: "telegram" as const
    },
    runtime: {
      environment: "server" as const,
      telegram: {
        enabled: true,
        delivery: {
          mode: "polling" as const,
          pollingIntervalMs: 2000
        }
      },
      flowBindings: [
        {
          triggerKind: "telegram",
          eventName: "telegram.message.received",
          pipelineId: "telegram-real-test-pipeline"
        }
      ]
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo"
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
    id: "telegram-real-test-pipeline",
    name: "Telegram Real Test Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Echo Skill", config: { refId: "echo-skill" } },
      { id: "response-1", type: "response", label: "Telegram Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });
}

test("telegram poll-once command runs one live-style cycle and persists runtime history", async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), "walkie-telegram-real-test-"));
  const agentRegistry = new AgentRegistryStore();
  agentRegistry.create({
    id: "router-agent",
    name: "Router Agent",
    prompt: "Route live Telegram tests.",
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
    id: "echo-skill",
    name: "Echo Skill",
    handler: async ({ input }) => ({
      ok: true,
      output: {
        replyText: `Handled: ${String(input.text ?? "")}`
      }
    })
  });

  const historyStore = new InMemoryRunHistoryStore();
  const auditStore = new InMemoryAuditEventStore();
  const mcpRegistry = new McpRegistryStore();

  const result = await executeTelegramPollOnceCommand({
    baseDirectory: tempDir,
    requestedOffset: 700,
    bootstrap: async () => ({
      ok: true,
      configPath: resolve(tempDir, "walkie-talkie.config.json"),
      entityStoragePath: resolve(tempDir, ".walkie-talkie/storage/entities.snapshot.json"),
      runtimeStoragePath: resolve(tempDir, ".walkie-talkie/storage/runtime.snapshot.json"),
      warnings: [],
      state: {
        config: createConfig(),
        entitySnapshot: {
          version: "1",
          updatedAt: "2026-03-25T10:00:00.000Z",
          agents: agentRegistry.snapshot(),
          skills: skillRegistry.snapshot(),
          mcpServers: [],
          pipelines: [createPipeline()]
        },
        runtimeSnapshot: {
          version: "1",
          updatedAt: "2026-03-25T10:00:00.000Z",
          runs: [],
          auditEvents: []
        },
        agentRegistry,
        skillRegistry,
        mcpRegistry,
        pipelines: [createPipeline()],
        historyStore,
        auditStore
      }
    }),
    createClient: () => ({
      config: {
        botToken: "telegram-demo-token"
      },
      async getUpdates() {
        return [
          {
            update_id: 700,
            message: {
              message_id: 11,
              text: "check node",
              chat: { id: 9988 },
              from: { username: "arafat" }
            }
          }
        ];
      },
      async sendMessage() {
        throw new Error("sendMessage should not run in poll-once command yet");
      },
      async setWebhook() {
        throw new Error("setWebhook should not run in poll-once command");
      }
    }),
    now: () => "2026-03-25T10:00:00.000Z"
  });

  assert.equal(result.exitCode, 0);
  assert.equal(historyStore.count(), 1);

  const storedRuntime = await loadRuntimeStorageFile(resolveRuntimeStoragePath(tempDir));
  assert.equal(storedRuntime.ok, true);
  if (storedRuntime.ok) {
    assert.equal(storedRuntime.snapshot.runs.length, 1);
    assert.equal(storedRuntime.snapshot.runs[0]?.pipelineId, "telegram-real-test-pipeline");
    assert.equal(storedRuntime.snapshot.runs[0]?.status, "success");
  }
});
