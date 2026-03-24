import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import { InMemoryRunHistoryStore } from "../../packages/runtime/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";
import {
  buildTelegramSendMessagePayload,
  createTelegramBotApiClient,
  createTelegramPollingRunner
} from "../../packages/integrations/src/index.ts";

function readFixture<T>(name: string): T {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/telegram", name);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as T;
}

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-telegram-live",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "server",
      telegram: {
        enabled: true,
        delivery: {
          mode: "polling",
          pollingIntervalMs: 5000
        }
      },
      flowBindings: [
        {
          triggerKind: "telegram",
          eventName: "telegram.message.received",
          pipelineId: "telegram-live-pipeline"
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
    id: "telegram-live-pipeline",
    name: "Telegram Live Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Cursor Skill", config: { refId: "cursor-skill" } },
      { id: "response-1", type: "response", label: "Telegram Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });
}

function createAgentRegistry(): AgentRegistryStore {
  const registry = new AgentRegistryStore();
  registry.create({
    id: "router-agent",
    name: "Router Agent",
    prompt: "Handle live Telegram transport tasks.",
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
  return registry;
}

function createSkillRegistry(): SkillRegistryStore {
  const registry = new SkillRegistryStore();
  registry.register({
    id: "cursor-skill",
    name: "Cursor Skill",
    handler: async (context) => ({
      ok: true,
      output: {
        replyText: `Cursor transport smoke: ${String(context.input.text ?? "")}`
      }
    })
  });
  return registry;
}

test("telegram live transport smoke: fixture getUpdates flows through client and polling runner", async () => {
  const updatesFixture = readFixture<{
    ok: true;
    result: unknown[];
  }>("get-updates-response.json");

  const calls: Array<{ method: string; payload: Record<string, unknown> }> = [];
  const client = createTelegramBotApiClient({
    config: {
      botToken: "telegram-demo-token"
    },
    transport: async ({ method, payload }) => {
      calls.push({ method, payload });

      return updatesFixture;
    }
  });

  const historyStore = new InMemoryRunHistoryStore();
  const runner = createTelegramPollingRunner({
    config: createConfig(),
    pipelines: [createPipeline()],
    agentRegistry: createAgentRegistry(),
    skillRegistry: createSkillRegistry(),
    historyStore,
    client,
    now: () => "2026-03-24T12:00:00.000Z"
  });

  const result = await runner.pollOnce({
    nextOffset: 501001
  });

  assert.equal(result.skipped, false);
  assert.equal(result.processedUpdates, 2);
  assert.equal(result.executedRuns, 1);
  assert.equal(result.ignoredUpdates, 1);
  assert.equal(result.nextOffset, 501003);
  if (result.results[0]?.ok) {
    assert.deepEqual(result.results[0].finalOutput, {
      replyText: "Cursor transport smoke: check cursor on my server"
    });
  }

  assert.deepEqual(historyStore.latest(), {
    runId: "telegram-live-pipeline:2026-03-24T12:00:00.000Z",
    pipelineId: "telegram-live-pipeline",
    pipelineName: "Telegram Live Pipeline",
    triggerKind: "telegram",
    triggerEventName: "telegram.message.received",
    status: "success",
    startedAt: "2026-03-24T12:00:00.000Z",
    finishedAt: "2026-03-24T12:00:00.000Z",
    error: undefined
  });

  assert.deepEqual(calls, [
    {
      method: "getUpdates",
      payload: {
        offset: 501001,
        timeout: 5
      }
    }
  ]);
});

test("telegram live transport smoke: fixture sendMessage response normalizes delivered message", async () => {
  const deliveredFixture = readFixture<{
    ok: true;
    result: {
      message_id: number;
      text: string;
      chat: { id: number };
    };
  }>("send-message-response.json");

  const calls: Array<{ method: string; payload: Record<string, unknown> }> = [];
  const client = createTelegramBotApiClient({
    config: {
      botToken: "telegram-demo-token"
    },
    transport: async ({ method, payload }) => {
      calls.push({ method, payload });

      return deliveredFixture;
    }
  });

  const message = {
    chatId: 998877,
    text: "Cursor check queued.",
    replyToMessageId: 73
  };
  const delivered = await client.sendMessage(message);

  assert.deepEqual(calls, [
    {
      method: "sendMessage",
      payload: buildTelegramSendMessagePayload(message)
    }
  ]);
  assert.deepEqual(delivered, {
    messageId: 84,
    chatId: 998877,
    text: "Cursor check queued."
  });
});
