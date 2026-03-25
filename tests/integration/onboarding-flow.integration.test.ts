import assert from "node:assert/strict";
import { test } from "node:test";

import {
  executeOnboardingFlow,
  type OnboardingPromptIO
} from "../../packages/onboarding/src/index.ts";

test("executeOnboardingFlow succeeds with valid answers", async () => {
  const responses = [
    "demo-app",
    "yes",
    "gpt-4o-mini",
    "api-key",
    "sk-live",
    "no",
    "local",
    "telegram",
    "123:telegram",
    "",
    "",
    "",
    "yes"
  ];
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
  assert.equal(result.answers.communicationChannel, "telegram");
  assert.equal(result.answers.channelCredential, "123:telegram");
  assert.equal(result.answers.confirmExamplePipeline, true);
});

test("executeOnboardingFlow returns validation issues for invalid answers", async () => {
  const responses = ["", "no", "", "oauth", "", "no", "", "email", "", "", "", "", "yes"];
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
      questionId: "aiAuthMode",
      message: "AI connection mode must be one of: api-key, codex."
    },
    {
      questionId: "communicationChannel",
      message: "Communication channel must be one of: telegram, whatsapp, discord."
    },
    {
      questionId: "channelCredential",
      message: "Channel credential is required."
    }
  ]);
});
