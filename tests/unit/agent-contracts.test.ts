import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AGENT_CONTRACT_VERSION,
  AGENT_EXECUTION_MODES,
  AGENT_STATUSES,
  AGENT_TRIGGER_KINDS,
  createAgentDefinition
} from "../../packages/agents/src/index.ts";

test("agent contract exports stable enum-like values", () => {
  assert.deepEqual(AGENT_TRIGGER_KINDS, ["cli", "schedule", "telegram", "webhook", "dashboard"]);
  assert.deepEqual(AGENT_EXECUTION_MODES, ["manual", "assisted", "autonomous"]);
  assert.deepEqual(AGENT_STATUSES, ["active", "paused", "disabled"]);
  assert.equal(AGENT_CONTRACT_VERSION, "1");
});

test("createAgentDefinition applies defaults and clones arrays", () => {
  const input = {
    id: "daily-reminder-agent",
    name: "Daily Reminder Agent",
    prompt: "Remind the user about daily tasks.",
    model: {
      provider: "openai-compatible",
      model: "gpt-5-mini"
    },
    skills: [{ skillId: "telegram-send", required: true }],
    triggers: [{ kind: "schedule" as const, schedule: "0 9 * * *" }],
    tags: ["reminder"]
  };

  const agent = createAgentDefinition(input);

  assert.equal(agent.version, "1");
  assert.equal(agent.status, "active");
  assert.equal(agent.executionMode, "assisted");
  assert.deepEqual(agent.skills, [{ skillId: "telegram-send", required: true }]);
  assert.deepEqual(agent.triggers, [{ kind: "schedule", schedule: "0 9 * * *" }]);
  assert.deepEqual(agent.tags, ["reminder"]);

  input.skills[0].skillId = "mutated";
  input.tags.push("changed");

  assert.equal(agent.skills[0]?.skillId, "telegram-send");
  assert.deepEqual(agent.tags, ["reminder"]);
});
