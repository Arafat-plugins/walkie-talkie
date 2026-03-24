export const AI_PROVIDER_KINDS = ["openai-compatible"] as const;
export const AI_MESSAGE_ROLES = ["system", "user", "assistant", "tool"] as const;

export type AiProviderKind = (typeof AI_PROVIDER_KINDS)[number];
export type AiMessageRole = (typeof AI_MESSAGE_ROLES)[number];

export type AiProviderConfig = {
  id: string;
  kind: AiProviderKind;
  baseUrl?: string;
  apiKey?: string;
};

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiCompletionRequest = {
  provider: AiProviderConfig;
  model: string;
  temperature?: number;
  messages: AiMessage[];
};

export type AiCompletionResponse = {
  providerId: string;
  model: string;
  outputText: string;
  raw?: unknown;
};

export type AiProviderErrorCode = "timeout" | "transport" | "response";

export type AiProviderError = {
  providerId: string;
  code: AiProviderErrorCode;
  message: string;
  cause?: unknown;
};

export type AiProvider = {
  config: AiProviderConfig;
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>;
};

export function createAiCompletionRequest(input: AiCompletionRequest): AiCompletionRequest {
  return {
    provider: { ...input.provider },
    model: input.model,
    temperature: input.temperature,
    messages: input.messages.map((message) => ({ ...message }))
  };
}
