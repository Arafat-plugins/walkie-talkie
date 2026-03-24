import assert from "node:assert/strict";
import { test } from "node:test";

import { getDefaultOnboardingQuestionSchema } from "../../packages/onboarding/src/index.ts";

test("default onboarding question schema exposes deterministic core questions", () => {
  const schema = getDefaultOnboardingQuestionSchema();

  assert.equal(schema.version, "1");
  assert.deepEqual(
    schema.questions.map((question) => question.id),
    ["projectName", "primaryTrigger", "providerApiKey", "confirmExamplePipeline"]
  );
  assert.equal(schema.questions[0]?.required, true);
  assert.equal(schema.questions[1]?.kind, "select");
  assert.deepEqual(schema.questions[1]?.options, [
    { value: "cli", label: "CLI" },
    { value: "telegram", label: "Telegram" }
  ]);
  assert.equal(schema.questions[2]?.kind, "password");
  assert.equal(schema.questions[3]?.defaultValue, true);
});
