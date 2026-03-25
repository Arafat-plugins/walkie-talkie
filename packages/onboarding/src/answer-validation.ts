import type {
  OnboardingQuestion,
  OnboardingQuestionSchema
} from "./question-schema.ts";
import type { OnboardingAnswerValue, OnboardingAnswers } from "./prompt-shell.ts";

export type OnboardingValidationIssue = {
  questionId: string;
  message: string;
};

export type OnboardingValidationResult = {
  valid: boolean;
  issues: OnboardingValidationIssue[];
};

function isEmptyAnswer(answer: OnboardingAnswerValue | undefined): boolean {
  if (answer === undefined) {
    return true;
  }

  if (typeof answer === "boolean") {
    return false;
  }

  return answer.trim() === "";
}

function validateRequired(question: OnboardingQuestion, answer: OnboardingAnswerValue | undefined) {
  if (!question.required || !isEmptyAnswer(answer)) {
    return null;
  }

  return {
    questionId: question.id,
    message: `${question.label} is required.`
  };
}

function validateSelectOption(
  question: OnboardingQuestion,
  answer: OnboardingAnswerValue | undefined
) {
  if (question.kind !== "select" || answer === undefined || typeof answer !== "string" || answer === "") {
    return null;
  }

  const allowedValues = question.options?.map((option) => option.value) ?? [];
  if (allowedValues.includes(answer)) {
    return null;
  }

  return {
    questionId: question.id,
    message: `${question.label} must be one of: ${allowedValues.join(", ")}.`
  };
}

export function validateOnboardingAnswers(
  schema: OnboardingQuestionSchema,
  answers: OnboardingAnswers
): OnboardingValidationResult {
  const issues: OnboardingValidationIssue[] = [];

  for (const question of schema.questions) {
    const answer = answers[question.id];
    const requiredIssue = validateRequired(question, answer);
    if (requiredIssue) {
      issues.push(requiredIssue);
      continue;
    }

    const selectIssue = validateSelectOption(question, answer);
    if (selectIssue) {
      issues.push(selectIssue);
    }
  }

  const aiAuthMode = answers.aiAuthMode;
  const providerApiKey = answers.providerApiKey;
  const communicationChannel = answers.communicationChannel;
  const channelCredential = answers.channelCredential;
  const telegramDeliveryMode = answers.telegramDeliveryMode;
  const telegramPublicBaseUrl = answers.telegramPublicBaseUrl;
  const telegramPollingIntervalMs = answers.telegramPollingIntervalMs;
  const runtimeEnvironment = answers.runtimeEnvironment;

  if (
    aiAuthMode === "api-key" &&
    (providerApiKey === undefined || (typeof providerApiKey === "string" && providerApiKey.trim() === ""))
  ) {
    issues.push({
      questionId: "providerApiKey",
      message: "Provider API key is required when AI connection mode is api-key."
    });
  }

  if (
    communicationChannel === "telegram" &&
    telegramDeliveryMode === "webhook" &&
    (telegramPublicBaseUrl === undefined ||
      (typeof telegramPublicBaseUrl === "string" && telegramPublicBaseUrl.trim() === ""))
  ) {
    issues.push({
      questionId: "telegramPublicBaseUrl",
      message: "Telegram public base URL is required when delivery mode is webhook."
    });
  }

  if (
    telegramPollingIntervalMs !== undefined &&
    typeof telegramPollingIntervalMs === "string" &&
    telegramPollingIntervalMs.trim() !== ""
  ) {
    const parsedInterval = Number(telegramPollingIntervalMs);
    if (!Number.isInteger(parsedInterval) || parsedInterval <= 0) {
      issues.push({
        questionId: "telegramPollingIntervalMs",
        message: "Telegram polling interval must be a positive integer."
      });
    }
  }

  if (
    runtimeEnvironment !== undefined &&
    runtimeEnvironment !== "local" &&
    runtimeEnvironment !== "server"
  ) {
    issues.push({
      questionId: "runtimeEnvironment",
      message: "Runtime environment must be one of: local, server."
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
