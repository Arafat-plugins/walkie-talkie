import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildPromptLines,
  getDefaultOnboardingQuestionSchema,
  runOnboardingPromptShell,
  type OnboardingPromptIO
} from "../../packages/onboarding/src/index.ts";

test("buildPromptLines renders deterministic question output", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const lines = buildPromptLines(schema.questions[1]!);

  assert.deepEqual(lines, [
    "Primary trigger *",
    "Choose the first interface that should trigger your workflow.",
    "- cli: CLI",
    "- telegram: Telegram",
    "> primaryTrigger [default: cli]"
  ]);
});

test("runOnboardingPromptShell collects normalized answers in schema order", async () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const writes: string[] = [];
  const responses = ["demo-app", "", "sk-test-123", "no"];
  let askCount = 0;

  const io: OnboardingPromptIO = {
    writeLine(line) {
      writes.push(line);
    },
    async ask() {
      const response = responses[askCount];
      askCount += 1;
      return response ?? "";
    }
  };

  const answers = await runOnboardingPromptShell(schema, io);

  assert.equal(askCount, schema.questions.length);
  assert.equal(writes[0], "Project name *");
  assert.deepEqual(answers, {
    projectName: "demo-app",
    primaryTrigger: "cli",
    providerApiKey: "sk-test-123",
    confirmExamplePipeline: false
  });
});
