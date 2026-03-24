import assert from "node:assert/strict";
import { test } from "node:test";

import {
  SKILL_CONTRACT_VERSION,
  SKILL_EXECUTION_MODES,
  SKILL_STATUSES,
  createSkillDefinition
} from "../../packages/skills/src/index.ts";

test("skill contract exports stable enum-like values", () => {
  assert.deepEqual(SKILL_EXECUTION_MODES, ["sync", "async"]);
  assert.deepEqual(SKILL_STATUSES, ["active", "deprecated", "disabled"]);
  assert.equal(SKILL_CONTRACT_VERSION, "1");
});

test("createSkillDefinition applies defaults and clones metadata arrays", async () => {
  const input = {
    id: "telegram-send",
    name: "Telegram Send",
    handler: async () => ({ ok: true, output: { sent: true } }),
    parameters: [
      {
        name: "message",
        type: "string" as const,
        required: true
      }
    ],
    tags: ["telegram"]
  };

  const skill = createSkillDefinition(input);

  assert.equal(skill.version, "1");
  assert.equal(skill.status, "active");
  assert.equal(skill.executionMode, "async");
  assert.deepEqual(skill.parameters, [
    {
      name: "message",
      type: "string",
      required: true
    }
  ]);
  assert.deepEqual(skill.tags, ["telegram"]);

  input.parameters[0].name = "mutated";
  input.tags.push("changed");

  assert.equal(skill.parameters[0]?.name, "message");
  assert.deepEqual(skill.tags, ["telegram"]);

  const execution = await skill.handler({
    agentId: "agent-1",
    triggerKind: "telegram",
    runId: "run-1",
    input: { message: "hello" }
  });

  assert.deepEqual(execution, { ok: true, output: { sent: true } });
});
