import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { createTriggerEvent } from "../../packages/core/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import { executeConfiguredTriggerPipeline, resolvePipelineForTrigger } from "../../packages/runtime/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "demo-app",
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
        apiKey: "sk-demo"
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
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Skill", config: { refId: "cursor-check-skill" } },
      { id: "response-1", type: "response", label: "Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });
}

test("resolvePipelineForTrigger selects pipeline from config flow binding", () => {
  const trigger = createTriggerEvent({
    kind: "telegram",
    eventName: "telegram.message.received",
    sourceId: "998877",
    occurredAt: "2026-03-21T14:00:00.000Z",
    payload: {}
  });
  const pipeline = createPipeline();

  const result = resolvePipelineForTrigger({
    config: createConfig(),
    trigger,
    pipelines: [pipeline]
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.binding.pipelineId, "telegram-cursor-check");
  assert.equal(result.pipeline.id, "telegram-cursor-check");
});

test("executeConfiguredTriggerPipeline runs orchestration from config-driven pipeline binding", async () => {
  const agentRegistry = new AgentRegistryStore();
  agentRegistry.create({
    id: "router-agent",
    name: "Router Agent",
    prompt: "Route Telegram checks.",
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
    name: "Cursor Check",
    handler: async () => ({
      ok: true,
      output: "Cursor is installed."
    })
  });

  const result = await executeConfiguredTriggerPipeline({
    config: createConfig(),
    pipelines: [createPipeline()],
    trigger: createTriggerEvent({
      kind: "telegram",
      eventName: "telegram.message.received",
      sourceId: "998877",
      occurredAt: "2026-03-21T14:00:00.000Z",
      payload: {
        text: "check cursor"
      }
    }),
    agentRegistry,
    skillRegistry,
    now: () => "2026-03-21T14:00:00.000Z"
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.report.status, "success");
  assert.equal(result.finalOutput, "Cursor is installed.");
});

test("executeConfiguredTriggerPipeline blocks when no config flow binding matches", async () => {
  const result = await executeConfiguredTriggerPipeline({
    config: createConfig(),
    pipelines: [createPipeline()],
    trigger: createTriggerEvent({
      kind: "telegram",
      eventName: "telegram.command.received",
      sourceId: "998877",
      occurredAt: "2026-03-21T14:00:00.000Z",
      payload: {}
    }),
    agentRegistry: new AgentRegistryStore(),
    skillRegistry: new SkillRegistryStore(),
    now: () => "2026-03-21T14:00:00.000Z"
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.equal(result.error, 'No flow binding matched trigger "telegram.command.received".');
  assert.equal(result.report.status, "blocked");
});
