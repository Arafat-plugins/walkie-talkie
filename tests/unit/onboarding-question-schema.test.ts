import assert from "node:assert/strict";
import { test } from "node:test";

import { getDefaultOnboardingQuestionSchema } from "../../packages/onboarding/src/index.ts";

test("default onboarding question schema exposes deterministic core questions", () => {
  const schema = getDefaultOnboardingQuestionSchema();

  assert.equal(schema.version, "1");
  assert.deepEqual(
    schema.questions.map((question) => question.id),
    [
      "projectName",
      "fullMachineAccess",
      "providerModel",
      "aiAuthMode",
      "providerApiKey",
      "connectCodexNow",
      "runtimeEnvironment",
      "communicationChannel",
      "channelCredential",
      "telegramDeliveryMode",
      "telegramPollingIntervalMs",
      "telegramPublicBaseUrl",
      "confirmExamplePipeline"
    ]
  );
  assert.equal(schema.questions[0]?.required, true);
  assert.equal(schema.questions[1]?.kind, "confirm");
  assert.equal(schema.questions[1]?.defaultValue, false);
  assert.equal(schema.questions[2]?.defaultValue, "gpt-4o-mini");
  assert.equal(schema.questions[3]?.kind, "select");
  assert.deepEqual(schema.questions[3]?.options, [
    { value: "api-key", label: "API key" },
    { value: "codex", label: "Codex" }
  ]);
  assert.equal(schema.questions[6]?.defaultValue, "local");
  assert.equal(schema.questions[7]?.defaultValue, "telegram");
  assert.equal(schema.questions[9]?.defaultValue, "polling");
  assert.equal(schema.questions[12]?.defaultValue, true);
});
