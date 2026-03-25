import assert from "node:assert/strict";
import { test } from "node:test";

import { createTelegramMachineAssistantSkill } from "../../packages/skills/src/index.ts";

test("telegram machine assistant skill returns a natural fallback reply when no tool is clear", async () => {
  const skill = createTelegramMachineAssistantSkill();
  const result = await skill.handler({
    input: {
      text: "amar machine e ektu dekho"
    }
  });

  assert.equal(result.ok, true);
  assert.equal(typeof (result.output as { replyText?: string }).replyText, "string");
  assert.match((result.output as { replyText?: string }).replyText ?? "", /could not clearly identify/i);
});

test("telegram machine assistant skill reports local tool state and facts", async () => {
  const skill = createTelegramMachineAssistantSkill();
  const result = await skill.handler({
    input: {
      text: "node ache naki"
    }
  });

  assert.equal(result.ok, true);
  const output = result.output as {
    replyText?: string;
    facts?: { tool?: string; installed?: boolean };
  };

  assert.equal(output.facts?.tool, "node");
  assert.equal(output.facts?.installed, true);
  assert.equal(typeof output.replyText, "string");
});
