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
    primaryTrigger: "cli",
    providerApiKey: "sk-demo",
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
    primaryTrigger: "cli",
    providerApiKey: "",
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
      message: "Provider API key is required."
    }
  ]);
});

test("validateOnboardingAnswers reports unsupported select values", () => {
  const schema = getDefaultOnboardingQuestionSchema();
  const answers: OnboardingAnswers = {
    projectName: "demo-app",
    primaryTrigger: "email",
    providerApiKey: "sk-demo",
    confirmExamplePipeline: false
  };

  const result = validateOnboardingAnswers(schema, answers);

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    {
      questionId: "primaryTrigger",
      message: "Primary trigger must be one of: cli, telegram."
    }
  ]);
});
