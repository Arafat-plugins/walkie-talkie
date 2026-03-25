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
  const lines = buildPromptLines(schema.questions[7]!);

  assert.deepEqual(lines, [
    "Communication channel *",
    "Choose the first channel users will talk through. Telegram is live today; the others are saved for future connectors.",
    "- telegram: Telegram",
    "- whatsapp: WhatsApp",
    "- discord: Discord",
    "> communicationChannel [default: telegram]"
  ]);
});

test("runOnboardingPromptShell collects normalized answers in schema order", async () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const writes: string[] = [];
  const responses = [
    "demo-app",
    "yes",
    "",
    "",
    "sk-test-123",
    "no",
    "",
    "",
    "123:telegram",
    "",
    "",
    "",
    "no"
  ];
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
    fullMachineAccess: true,
    providerModel: "gpt-4o-mini",
    aiAuthMode: "api-key",
    providerApiKey: "sk-test-123",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "telegram",
    channelCredential: "123:telegram",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: false
  });
});
