import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentRegistryStore } from "../../packages/agents/src/index.ts";
import { createTriggerEvent } from "../../packages/core/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import { executeTriggerPipeline } from "../../packages/runtime/src/index.ts";
import { SkillRegistryStore } from "../../packages/skills/src/index.ts";

test("trigger -> pipeline -> agent -> skill -> response executes successfully", async () => {
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
      assert.equal(context.agentId, "router-agent");
      assert.equal(context.triggerKind, "telegram");
      assert.equal(context.input.text, "check whether cursor is installed");

      return {
        ok: true,
        output: {
          replyText: "Cursor is installed."
        }
      };
    }
  });

  const pipeline = createPipelineDefinition({
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

  const trigger = createTriggerEvent({
    kind: "telegram",
    eventName: "telegram.message.received",
    sourceId: "998877",
    occurredAt: "2026-03-21T13:00:00.000Z",
    payload: {
      text: "check whether cursor is installed",
      chatId: 998877
    }
  });

  const result = await executeTriggerPipeline({
    trigger,
    pipeline,
    agentRegistry,
    skillRegistry,
    now: () => "2026-03-21T13:00:00.000Z"
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.report.status, "success");
  assert.equal(result.agent?.id, "router-agent");
  assert.deepEqual(result.finalOutput, {
    replyText: "Cursor is installed."
  });
  assert.deepEqual(
    result.skillExecutions.map((entry) => [entry.skillId, entry.result.ok]),
    [["cursor-check-skill", true]]
  );
});

test("trigger -> pipeline -> agent -> skill fails when agent binding does not match trigger event", async () => {
  const agentRegistry = new AgentRegistryStore();
  agentRegistry.create({
    id: "router-agent",
    name: "Router Agent",
    prompt: "Route checks.",
    model: {
      provider: "primary-openai",
      model: "gpt-4o-mini"
    },
    triggers: [
      {
        kind: "telegram",
        event: "telegram.command.received"
      }
    ]
  });

  const skillRegistry = new SkillRegistryStore();
  skillRegistry.register({
    id: "cursor-check-skill",
    name: "Cursor Check Skill",
    handler: async () => ({
      ok: true,
      output: "unused"
    })
  });

  const pipeline = createPipelineDefinition({
    id: "telegram-cursor-check",
    name: "Telegram Cursor Check",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent", config: { refId: "router-agent" } },
      { id: "skill-1", type: "skill", label: "Cursor Check Skill", config: { refId: "cursor-check-skill" } }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" }
    ]
  });

  const trigger = createTriggerEvent({
    kind: "telegram",
    eventName: "telegram.message.received",
    sourceId: "998877",
    occurredAt: "2026-03-21T13:00:00.000Z",
    payload: {
      text: "check whether cursor is installed"
    }
  });

  const result = await executeTriggerPipeline({
    trigger,
    pipeline,
    agentRegistry,
    skillRegistry,
    now: () => "2026-03-21T13:00:00.000Z"
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.equal(result.error, 'Agent "router-agent" is not bound to trigger "telegram.message.received".');
  assert.equal(result.report.status, "failed");
  assert.deepEqual(
    result.report.steps.map((step) => [step.nodeId, step.status]),
    [
      ["trigger-1", "completed"],
      ["agent-1", "failed"],
      ["skill-1", "blocked"]
    ]
  );
});
