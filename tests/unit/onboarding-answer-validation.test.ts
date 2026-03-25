import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getDefaultOnboardingQuestionSchema,
  validateOnboardingAnswers,
  type OnboardingAnswers
} from "../../packages/onboarding/src/index.ts";

test("validateOnboardingAnswers accepts valid answer set", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "demo-app",
    fullMachineAccess: false,
    providerModel: "gpt-4o-mini",
    aiAuthMode: "api-key",
    providerApiKey: "sk-demo",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "telegram",
    channelCredential: "123:telegram",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: true
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("validateOnboardingAnswers reports missing required answers", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "",
    fullMachineAccess: false,
    aiAuthMode: "api-key",
    providerApiKey: "",
    providerModel: "gpt-4o-mini",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "telegram",
    channelCredential: "123:telegram",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: true
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    {
      questionId: "projectName",
      message: "Project name is required."
    },
    {
      questionId: "providerApiKey",
      message: "Provider API key is required when AI connection mode is api-key."
    }
  ]);
});

test("validateOnboardingAnswers reports unsupported select values", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "demo-app",
    fullMachineAccess: false,
    providerModel: "gpt-4o-mini",
    aiAuthMode: "oauth",
    providerApiKey: "sk-demo",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "email",
    channelCredential: "123:telegram",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: false
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    {
      questionId: "aiAuthMode",
      message: "AI connection mode must be one of: api-key, codex."
    },
    {
      questionId: "communicationChannel",
      message: "Communication channel must be one of: telegram, whatsapp, discord."
    }
  ]);
});

test("validateOnboardingAnswers requires channel credential for selected communication channel", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "demo-app",
    fullMachineAccess: false,
    providerModel: "gpt-4o-mini",
    aiAuthMode: "api-key",
    providerApiKey: "sk-demo",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "telegram",
    channelCredential: "",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: true
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    {
      questionId: "channelCredential",
      message: "Channel credential is required."
    }
  ]);
});

test("validateOnboardingAnswers requires public base URL for webhook mode", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "demo-app",
    fullMachineAccess: false,
    providerModel: "gpt-4o-mini",
    aiAuthMode: "api-key",
    providerApiKey: "sk-demo",
    connectCodexNow: false,
    runtimeEnvironment: "server",
    communicationChannel: "telegram",
    channelCredential: "123:token",
    telegramDeliveryMode: "webhook",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: true
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    {
      questionId: "telegramPublicBaseUrl",
      message: "Telegram public base URL is required when delivery mode is webhook."
    }
  ]);
});

test("validateOnboardingAnswers allows codex mode without direct API key", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "demo-app",
    fullMachineAccess: true,
    providerModel: "gpt-5",
    aiAuthMode: "codex",
    providerApiKey: "",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "discord",
    channelCredential: "discord-bot-token",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: true
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});
