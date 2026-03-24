import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import { InMemoryRunHistoryStore } from "../../packages/runtime/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";
import { createTelegramBotApiClient, createTelegramPollingRunner } from "../../packages/integrations/src/index.ts";

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
          pollingIntervalMs: 4000
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

test("telegram polling runner integration: pollOnce turns updates into configured runtime executions", async () => {
  const transportCalls: Array<{ method: string; payload: Record<string, unknown> }> = [];
  const client = createTelegramBotApiClient({
    config: {
      botToken: "telegram-demo-token"
    },
    transport: async ({ method, payload }) => {
      transportCalls.push({ method, payload });

      assert.equal(method, "getUpdates");

      return {
        ok: true,
        result: [
          {
            update_id: 1200,
            message: {
              message_id: 51,
              text: "check cursor",
              chat: { id: 8899 },
              from: { username: "arafat" }
            }
          },
          {
            update_id: 1201,
            callback_query: {
              id: "ignore-me"
            }
          }
        ]
      };
    }
  });

  const agentRegistry = new AgentRegistryStore();
  agentRegistry.create({
    id: "router-agent",
    name: "Router Agent",
    prompt: "Route Telegram live checks.",
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
    handler: async (context) => ({
      ok: true,
      output: {
        replyText: `Handled: ${String(context.input.text ?? "")}`
      }
    })
  });

  const historyStore = new InMemoryRunHistoryStore();
  const runner = createTelegramPollingRunner({
    config: createConfig(),
    pipelines: [createPipeline()],
    agentRegistry,
    skillRegistry,
    historyStore,
    client,
    now: () => "2026-03-24T10:00:00.000Z"
  });

  const result = await runner.pollOnce({
    nextOffset: 1200
  });

  assert.equal(result.skipped, false);
  assert.equal(result.requestedOffset, 1200);
  assert.equal(result.nextOffset, 1202);
  assert.equal(result.processedUpdates, 2);
  assert.equal(result.ignoredUpdates, 1);
  assert.equal(result.executedRuns, 1);
  assert.deepEqual(result.processedUpdateIds, [1200, 1201]);
  assert.equal(result.results[0]?.ok, true);
  if (result.results[0]?.ok) {
    assert.deepEqual(result.results[0].finalOutput, {
      replyText: "Handled: check cursor"
    });
  }

  assert.deepEqual(historyStore.latest(), {
    runId: "telegram-live-pipeline:2026-03-24T10:00:00.000Z",
    pipelineId: "telegram-live-pipeline",
    pipelineName: "Telegram Live Pipeline",
    triggerKind: "telegram",
    triggerEventName: "telegram.message.received",
    status: "success",
    startedAt: "2026-03-24T10:00:00.000Z",
    finishedAt: "2026-03-24T10:00:00.000Z",
    error: undefined
  });

  assert.deepEqual(transportCalls, [
    {
      method: "getUpdates",
      payload: {
        offset: 1200,
        timeout: 4
      }
    }
  ]);
});

test("telegram polling runner integration: disabled or non-polling runtime config skips cycle", async () => {
  const client = createTelegramBotApiClient({
    config: {
      botToken: "telegram-demo-token"
    },
    transport: async () => {
      throw new Error("transport should not run");
    }
  });

  const disabledRunner = createTelegramPollingRunner({
    config: {
      ...createConfig(),
      runtime: {
        environment: "server",
        telegram: {
          enabled: false,
          delivery: {
            mode: "polling",
            pollingIntervalMs: 4000
          }
        }
      }
    },
    pipelines: [createPipeline()],
    agentRegistry: new AgentRegistryStore(),
    skillRegistry: new SkillRegistryStore(),
    historyStore: new InMemoryRunHistoryStore(),
    client
  });
  const webhookRunner = createTelegramPollingRunner({
    config: {
      ...createConfig(),
      runtime: {
        environment: "server",
        telegram: {
          enabled: true,
          delivery: {
            mode: "webhook",
            webhookPath: "/telegram/live"
          },
          publicBaseUrl: "https://walkie-talkie.local"
        }
      }
    },
    pipelines: [createPipeline()],
    agentRegistry: new AgentRegistryStore(),
    skillRegistry: new SkillRegistryStore(),
    historyStore: new InMemoryRunHistoryStore(),
    client
  });

  const disabledResult = await disabledRunner.pollOnce();
  const webhookResult = await webhookRunner.pollOnce();

  assert.equal(disabledResult.skipped, true);
  assert.match(disabledResult.reason ?? "", /disabled/);
  assert.equal(webhookResult.skipped, true);
  assert.match(webhookResult.reason ?? "", /requires polling mode/);
});
