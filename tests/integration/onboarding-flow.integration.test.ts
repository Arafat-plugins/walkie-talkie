import assert from "node:assert/strict";
import { test } from "node:test";

import {
  executeOnboardingFlow,
  type OnboardingPromptIO
} from "../../packages/onboarding/src/index.ts";

test("executeOnboardingFlow succeeds with valid answers", async () => {
  const responses = ["demo-app", "telegram", "sk-live", "yes"];
  let askCount = 0;

  const io: OnboardingPromptIO = {
    writeLine() {},
    async ask() {
      const response = responses[askCount];
      askCount += 1;
      return response ?? "";
    }
  };

  const result = await executeOnboardingFlow(io);

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.answers.projectName, "demo-app");
  assert.equal(result.answers.primaryTrigger, "telegram");
  assert.equal(result.answers.confirmExamplePipeline, true);
});

test("executeOnboardingFlow returns validation issues for invalid answers", async () => {
  const responses = ["", "email", "", "yes"];
  let askCount = 0;

  const io: OnboardingPromptIO = {
    writeLine() {},
    async ask() {
      const response = responses[askCount];
      askCount += 1;
      return response ?? "";
    }
  };

  const result = await executeOnboardingFlow(io);

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.deepEqual(result.validation.issues, [
    {
      questionId: "projectName",
      message: "Project name is required."
    },
    {
      questionId: "primaryTrigger",
      message: "Primary trigger must be one of: cli, telegram."
    },
    {
      questionId: "providerApiKey",
      message: "Provider API key is required."
    }
  ]);
});
