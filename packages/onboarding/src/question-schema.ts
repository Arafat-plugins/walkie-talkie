export type OnboardingQuestionKind = "text" | "password" | "confirm" | "select";

export type OnboardingQuestionOption = {
  value: string;
  label: string;
};

export type OnboardingQuestion = {
  id: string;
  label: string;
  kind: OnboardingQuestionKind;
  required: boolean;
  helpText: string;
  placeholder?: string;
  defaultValue?: string | boolean;
  options?: OnboardingQuestionOption[];
};

export type OnboardingQuestionSchema = {
  version: "1";
  questions: OnboardingQuestion[];
};

const DEFAULT_ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "projectName",
    label: "Project name",
    kind: "text",
    required: true,
    helpText: "Human-readable project identifier used in generated config.",
    placeholder: "my-walkie-talkie-app"
  },
  {
    id: "primaryTrigger",
    label: "Primary trigger",
    kind: "select",
    required: true,
    helpText: "Choose the first interface that should trigger your workflow.",
    defaultValue: "cli",
    options: [
      { value: "cli", label: "CLI" },
      { value: "telegram", label: "Telegram" }
    ]
  },
  {
    id: "providerApiKey",
    label: "Provider API key",
    kind: "password",
    required: true,
    helpText: "Secret credential for the first AI provider connection."
  },
  {
    id: "confirmExamplePipeline",
    label: "Create example pipeline",
    kind: "confirm",
    required: true,
    helpText: "Bootstrap an example pipeline for first-run verification.",
    defaultValue: true
  }
];

export function getDefaultOnboardingQuestionSchema(): OnboardingQuestionSchema {
  return {
    version: "1",
    questions: DEFAULT_ONBOARDING_QUESTIONS.map((question) => ({
      ...question,
      options: question.options?.map((option) => ({ ...option }))
    }))
  };
}
