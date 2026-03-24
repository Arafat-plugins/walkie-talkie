import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { createTriggerEvent } from "../../packages/core/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import {
  executeConfiguredTriggerPipelineWithHistory,
  InMemoryRunHistoryStore
} from "../../packages/runtime/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-demo",
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

test("orchestration e2e: telegram trigger resolves configured pipeline, runs agent+skill, and records history", async () => {
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
    handler: async (context) => {
      const text = String(context.input.text ?? "");

      return {
        ok: true,
        output: {
          replyText: text.includes("cursor")
            ? "Cursor is installed on the server."
            : "I could not determine the tool state."
        }
      };
    }
  });

  const historyStore = new InMemoryRunHistoryStore();
  const pipeline = createPipeline();
  const trigger = createTriggerEvent({
    kind: "telegram",
    eventName: "telegram.message.received",
    sourceId: "998877",
    occurredAt: "2026-03-21T16:00:00.000Z",
    payload: {
      chatId: 998877,
      text: "check whether cursor is installed"
    }
  });

  const result = await executeConfiguredTriggerPipelineWithHistory({
    config: createConfig(),
    pipelines: [pipeline],
    trigger,
    agentRegistry,
    skillRegistry,
    historyStore,
    now: () => "2026-03-21T16:00:00.000Z"
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.report.pipelineId, "telegram-cursor-check");
  assert.equal(result.report.status, "success");
  assert.equal(result.agent?.id, "router-agent");
  assert.deepEqual(result.finalOutput, {
    replyText: "Cursor is installed on the server."
  });
  assert.deepEqual(result.skillExecutions, [
    {
      skillId: "cursor-check-skill",
      result: {
        ok: true,
        output: {
          replyText: "Cursor is installed on the server."
        }
      }
    }
  ]);
  assert.deepEqual(historyStore.list(), [
    {
      runId: "telegram-cursor-check:2026-03-21T16:00:00.000Z",
      pipelineId: "telegram-cursor-check",
      pipelineName: "Telegram Cursor Check",
      triggerKind: "telegram",
      triggerEventName: "telegram.message.received",
      status: "success",
      startedAt: "2026-03-21T16:00:00.000Z",
      finishedAt: "2026-03-21T16:00:00.000Z",
      error: undefined
    }
  ]);
});
