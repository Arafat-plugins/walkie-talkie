import {
  getDefaultOnboardingQuestionSchema,
  type OnboardingQuestionSchema
} from "./question-schema.ts";
import {
  runOnboardingPromptShell,
  type OnboardingAnswers,
  type OnboardingPromptIO
} from "./prompt-shell.ts";
import {
  validateOnboardingAnswers,
  type OnboardingValidationResult
} from "./answer-validation.ts";

export type OnboardingFlowSuccess = {
  ok: true;
  answers: OnboardingAnswers;
  validation: OnboardingValidationResult;
};

export type OnboardingFlowFailure = {
  ok: false;
  answers: OnboardingAnswers;
  validation: OnboardingValidationResult;
};

export type OnboardingFlowResult = OnboardingFlowSuccess | OnboardingFlowFailure;

export async function executeOnboardingFlow(
  io: OnboardingPromptIO,
  schema: OnboardingQuestionSchema = getDefaultOnboardingQuestionSchema()
): Promise<OnboardingFlowResult> {
  const answers = await runOnboardingPromptShell(schema, io);
  const validation = validateOnboardingAnswers(schema, answers);

  if (!validation.valid) {
    return {
      ok: false,
      answers,
      validation
    };
  }

  return {
    ok: true,
    answers,
    validation
  };
}

