import type { OnboardingQuestion, OnboardingQuestionSchema } from "./question-schema.ts";

export type OnboardingAnswerValue = string | boolean;

export type OnboardingAnswers = Record<string, OnboardingAnswerValue>;

export interface OnboardingPromptIO {
  writeLine(line: string): void;
  ask(prompt: string): Promise<string>;
}

function formatDefaultValue(question: OnboardingQuestion): string {
  if (question.defaultValue === undefined) {
    return "";
  }

  if (typeof question.defaultValue === "boolean") {
    return question.defaultValue ? " [default: yes]" : " [default: no]";
  }

  return ` [default: ${question.defaultValue}]`;
}

function formatOptions(question: OnboardingQuestion): string[] {
  if (question.kind !== "select" || !question.options?.length) {
    return [];
  }

  return question.options.map((option) => `- ${option.value}: ${option.label}`);
}

function normalizeAnswer(question: OnboardingQuestion, rawAnswer: string): OnboardingAnswerValue {
  const trimmed = rawAnswer.trim();

  if (trimmed === "" && question.defaultValue !== undefined) {
    return question.defaultValue;
  }

  if (question.kind === "confirm") {
    return /^(y|yes|true|1)$/i.test(trimmed);
  }

  return trimmed;
}

export function buildPromptLines(question: OnboardingQuestion): string[] {
  const lines = [`${question.label}${question.required ? " *" : ""}`];

  if (question.helpText) {
    lines.push(question.helpText);
  }

  lines.push(...formatOptions(question));

  const placeholder = question.placeholder ? ` (${question.placeholder})` : "";
  lines.push(`> ${question.id}${placeholder}${formatDefaultValue(question)}`);

  return lines;
}

export async function runOnboardingPromptShell(
  schema: OnboardingQuestionSchema,
  io: OnboardingPromptIO
): Promise<OnboardingAnswers> {
  const answers: OnboardingAnswers = {};

  for (const question of schema.questions) {
    for (const line of buildPromptLines(question)) {
      io.writeLine(line);
    }

    const rawAnswer = await io.ask("");
    answers[question.id] = normalizeAnswer(question, rawAnswer);
  }

  return answers;
}

