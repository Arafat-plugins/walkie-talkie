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
      name: "demo-app",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "local",
      flowBindings: [
        {
          triggerKind: "telegram",
          eventName: "telegram.message.received",
          pipelineId: "telegram-history-pipeline"
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
    id: "telegram-history-pipeline",
    name: "Telegram History Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Skill", config: { refId: "history-skill" } },
      { id: "response-1", type: "response", label: "Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });
}

test("executeConfiguredTriggerPipelineWithHistory records successful run entry", async () => {
  const historyStore = new InMemoryRunHistoryStore();
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
    id: "history-skill",
    name: "History Skill",
    handler: async () => ({
      ok: true,
      output: "done"
    })
  });

  const trigger = createTriggerEvent({
    kind: "telegram",
    eventName: "telegram.message.received",
    sourceId: "998877",
    occurredAt: "2026-03-21T15:00:00.000Z",
    payload: {
      text: "hello"
    }
  });

  const result = await executeConfiguredTriggerPipelineWithHistory({
    config: createConfig(),
    pipelines: [createPipeline()],
    trigger,
    agentRegistry,
    skillRegistry,
    historyStore,
    now: () => "2026-03-21T15:00:00.000Z"
  });

  assert.equal(result.ok, true);
  assert.deepEqual(historyStore.latest(), {
    runId: "telegram-history-pipeline:2026-03-21T15:00:00.000Z",
    pipelineId: "telegram-history-pipeline",
    pipelineName: "Telegram History Pipeline",
    triggerKind: "telegram",
    triggerEventName: "telegram.message.received",
    status: "success",
    startedAt: "2026-03-21T15:00:00.000Z",
    finishedAt: "2026-03-21T15:00:00.000Z",
    error: undefined
  });
});

test("executeConfiguredTriggerPipelineWithHistory records blocked run when flow binding is missing", async () => {
  const historyStore = new InMemoryRunHistoryStore();

  const trigger = createTriggerEvent({
    kind: "telegram",
    eventName: "telegram.command.received",
    sourceId: "998877",
    occurredAt: "2026-03-21T15:05:00.000Z",
    payload: {}
  });

  const result = await executeConfiguredTriggerPipelineWithHistory({
    config: createConfig(),
    pipelines: [createPipeline()],
    trigger,
    agentRegistry: new AgentRegistryStore(),
    skillRegistry: new SkillRegistryStore(),
    historyStore,
    now: () => "2026-03-21T15:05:00.000Z"
  });

  assert.equal(result.ok, false);
  assert.deepEqual(historyStore.latest(), {
    runId: "unresolved:2026-03-21T15:05:00.000Z",
    pipelineId: "unresolved",
    pipelineName: "Unresolved Pipeline",
    triggerKind: "telegram",
    triggerEventName: "telegram.command.received",
    status: "blocked",
    startedAt: "2026-03-21T15:05:00.000Z",
    finishedAt: "2026-03-21T15:05:00.000Z",
    error: 'No flow binding matched trigger "telegram.command.received".'
  });
});
