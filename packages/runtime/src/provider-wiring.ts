import type { WalkieTalkieConfig } from "../../config/src/index.ts";
import {
  createFetchOpenAiCompatibleTransport,
  createOpenAiCompatibleProvider,
  type AiFetchLike,
  type AiProvider,
  type AiProviderConfig
} from "../../integrations/src/index.ts";

export type RuntimeDefaultAiProviderBinding = {
  provider: AiProvider;
  defaultModel: string;
};

export function resolveDefaultAiProviderConfig(config: WalkieTalkieConfig): AiProviderConfig {
  return {
    id: "default-ai",
    kind: "openai-compatible",
    baseUrl: config.providers.defaultAi.baseUrl,
    apiKey: config.providers.defaultAi.apiKey
  };
}

export function resolveDefaultAiModel(config: WalkieTalkieConfig): string {
  return config.providers.defaultAi.model ?? "gpt-4o-mini";
}

export function createRuntimeDefaultAiProvider(input: {
  config: WalkieTalkieConfig;
  fetchImpl?: AiFetchLike;
  timeoutMs?: number;
}): RuntimeDefaultAiProviderBinding {
  const providerConfig = resolveDefaultAiProviderConfig(input.config);
  const transport = createFetchOpenAiCompatibleTransport({
    fetchImpl: input.fetchImpl,
    timeoutMs: input.timeoutMs
  });

  return {
    provider: createOpenAiCompatibleProvider({
      config: providerConfig,
      transport,
      timeoutMs: input.timeoutMs
    }),
    defaultModel: resolveDefaultAiModel(input.config)
  };
}
