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

  return {
    valid: issues.length === 0,
    issues
  };
}

