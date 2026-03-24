import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import { InMemoryRunHistoryStore } from "../../packages/runtime/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";
import { createTelegramWebhookHandler } from "../../packages/integrations/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-telegram-webhook",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "server",
      telegram: {
        enabled: true,
        delivery: {
          mode: "webhook",
          webhookPath: "/telegram/live"
        },
        publicBaseUrl: "https://walkie-talkie.local",
        webhookSecretToken: "telegram-secret"
      },
      flowBindings: [
        {
          triggerKind: "telegram",
          eventName: "telegram.message.received",
          pipelineId: "telegram-webhook-pipeline"
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
    id: "telegram-webhook-pipeline",
    name: "Telegram Webhook Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Webhook Skill", config: { refId: "webhook-skill" } },
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
    prompt: "Handle webhook-triggered Telegram events.",
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
    id: "webhook-skill",
    name: "Webhook Skill",
    handler: async (context) => ({
      ok: true,
      output: {
        replyText: `Webhook handled: ${String(context.input.text ?? "")}`
      }
    })
  });
  return registry;
}

test("telegram webhook handler integration: matching path and secret process supported update", async () => {
  const historyStore = new InMemoryRunHistoryStore();
  const handler = createTelegramWebhookHandler({
    config: createConfig(),
    pipelines: [createPipeline()],
    agentRegistry: createAgentRegistry(),
    skillRegistry: createSkillRegistry(),
    historyStore,
    now: () => "2026-03-24T11:00:00.000Z"
  });

  const result = await handler.handle({
    path: "/telegram/live",
    headers: {
      "x-telegram-bot-api-secret-token": "telegram-secret"
    },
    body: {
      update_id: 1300,
      message: {
        message_id: 71,
        text: "cursor webhook check",
        chat: { id: 6677 },
        from: { username: "arafat" }
      }
    }
  });

  assert.equal(result.accepted, true);
  assert.equal(result.ignored, false);
  assert.equal(result.statusCode, 200);
  assert.equal(result.body, "Telegram webhook processed.");
  assert.equal(result.result?.ok, true);
  if (result.result?.ok) {
    assert.deepEqual(result.result.finalOutput, {
      replyText: "Webhook handled: cursor webhook check"
    });
  }

  assert.deepEqual(historyStore.latest(), {
    runId: "telegram-webhook-pipeline:2026-03-24T11:00:00.000Z",
    pipelineId: "telegram-webhook-pipeline",
    pipelineName: "Telegram Webhook Pipeline",
    triggerKind: "telegram",
    triggerEventName: "telegram.message.received",
    status: "success",
    startedAt: "2026-03-24T11:00:00.000Z",
    finishedAt: "2026-03-24T11:00:00.000Z",
    error: undefined
  });
});

test("telegram webhook handler integration: path mismatch, bad secret, and unsupported payload are handled safely", async () => {
  const historyStore = new InMemoryRunHistoryStore();
  const handler = createTelegramWebhookHandler({
    config: createConfig(),
    pipelines: [createPipeline()],
    agentRegistry: createAgentRegistry(),
    skillRegistry: createSkillRegistry(),
    historyStore
  });

  const wrongPath = await handler.handle({
    path: "/telegram/wrong",
    headers: {
      "x-telegram-bot-api-secret-token": "telegram-secret"
    },
    body: {}
  });
  const badSecret = await handler.handle({
    path: "/telegram/live",
    headers: {
      "x-telegram-bot-api-secret-token": "wrong-secret"
    },
    body: {}
  });
  const ignoredPayload = await handler.handle({
    path: "/telegram/live",
    headers: {
      "x-telegram-bot-api-secret-token": "telegram-secret"
    },
    body: {
      callback_query: {
        id: "ignore-me"
      }
    }
  });

  assert.equal(wrongPath.accepted, false);
  assert.equal(wrongPath.statusCode, 404);
  assert.match(wrongPath.reason ?? "", /did not match/);

  assert.equal(badSecret.accepted, false);
  assert.equal(badSecret.statusCode, 401);
  assert.match(badSecret.reason ?? "", /did not match/);

  assert.equal(ignoredPayload.accepted, true);
  assert.equal(ignoredPayload.ignored, true);
  assert.equal(ignoredPayload.statusCode, 200);
  assert.equal(historyStore.latest(), undefined);
});
