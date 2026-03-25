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
    id: "fullMachineAccess",
    label: "Full machine access",
    kind: "confirm",
    required: true,
    helpText: "Allow Walkie-Talkie to use the broader local machine tool and terminal layer when you approve actions.",
    defaultValue: false
  },
  {
    id: "providerModel",
    label: "Provider model",
    kind: "text",
    required: false,
    helpText: "Default model used when human-style replies need the AI provider.",
    defaultValue: "gpt-4o-mini",
    placeholder: "gpt-4o-mini"
  },
  {
    id: "aiAuthMode",
    label: "AI connection mode",
    kind: "select",
    required: true,
    helpText: "Choose whether Walkie-Talkie should use a direct API key or the local Codex login flow.",
    defaultValue: "api-key",
    options: [
      { value: "api-key", label: "API key" },
      { value: "codex", label: "Codex" }
    ]
  },
  {
    id: "providerApiKey",
    label: "Provider API key",
    kind: "password",
    required: false,
    helpText: "Secret credential for API-key mode. Leave blank when using Codex mode."
  },
  {
    id: "connectCodexNow",
    label: "Connect Codex now",
    kind: "confirm",
    required: true,
    helpText: "If enabled, Walkie-Talkie will launch the Codex device-auth flow right after onboarding.",
    defaultValue: true
  },
  {
    id: "runtimeEnvironment",
    label: "Runtime environment",
    kind: "select",
    required: true,
    helpText: "Choose whether this install mainly runs on your local machine or a server.",
    defaultValue: "local",
    options: [
      { value: "local", label: "Local machine" },
      { value: "server", label: "Server" }
    ]
  },
  {
    id: "communicationChannel",
    label: "Communication channel",
    kind: "select",
    required: true,
    helpText: "Choose the first channel users will talk through. Telegram is live today; the others are saved for future connectors.",
    defaultValue: "telegram",
    options: [
      { value: "telegram", label: "Telegram" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "discord", label: "Discord" }
    ]
  },
  {
    id: "channelCredential",
    label: "Channel credential",
    kind: "password",
    required: true,
    helpText: "Paste the token/key for the selected communication channel."
  },
  {
    id: "telegramDeliveryMode",
    label: "Telegram delivery mode",
    kind: "select",
    required: true,
    helpText: "Polling is the easiest first setup. Webhook is better when you already have a public server URL.",
    defaultValue: "polling",
    options: [
      { value: "polling", label: "Polling" },
      { value: "webhook", label: "Webhook" }
    ]
  },
  {
    id: "telegramPollingIntervalMs",
    label: "Telegram polling interval",
    kind: "text",
    required: false,
    helpText: "Used only for polling mode. Milliseconds between update checks.",
    defaultValue: "2000",
    placeholder: "2000"
  },
  {
    id: "telegramPublicBaseUrl",
    label: "Telegram public base URL",
    kind: "text",
    required: false,
    helpText: "Used only for webhook mode. Example: https://example.com",
    placeholder: "https://example.com"
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
