import assert from "node:assert/strict";
import { test } from "node:test";

import { validateSkillDefinitionInput } from "../../packages/skills/src/index.ts";

test("validateSkillDefinitionInput accepts a valid skill interface", () => {
  const result = validateSkillDefinitionInput({
    id: "telegram-send",
    name: "Telegram Send",
    handler: async () => ({ ok: true }),
    parameters: [
      {
        name: "message",
        type: "string",
        required: true
      }
    ]
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("validateSkillDefinitionInput reports empty identity and missing handler", () => {
  const result = validateSkillDefinitionInput({
    id: "",
    name: "",
    handler: undefined as never
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(
    result.issues.map((issue) => issue.path),
    ["id", "name", "handler"]
  );
});

test("validateSkillDefinitionInput reports invalid and duplicate parameter definitions", () => {
  const result = validateSkillDefinitionInput({
    id: "email-draft",
    name: "Email Draft",
    handler: async () => ({ ok: true }),
    parameters: [
      {
        name: "",
        type: "string",
        required: true
      },
      {
        name: "message",
        type: "xml" as never,
        required: "yes" as never
      },
      {
        name: "message",
        type: "string",
        required: true
      }
    ]
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(
    result.issues.map((issue) => issue.path),
    [
      "parameters[0].name",
      "parameters[1].type",
      "parameters[1].required",
      "parameters[2].name"
    ]
  );
});
