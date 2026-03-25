import { resolveConfigSecretsFromEnv, type WalkieTalkieConfig } from "../../config/src/index.ts";
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

export function resolveDefaultAiProviderConfig(
  config: WalkieTalkieConfig,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): AiProviderConfig {
  const resolvedConfig = resolveConfigSecretsFromEnv(config, env);

  return {
    id: "default-ai",
    kind: "openai-compatible",
    baseUrl: resolvedConfig.providers.defaultAi.baseUrl,
    apiKey: resolvedConfig.providers.defaultAi.apiKey
  };
}

export function resolveDefaultAiModel(config: WalkieTalkieConfig): string {
  return config.providers.defaultAi.model ?? "gpt-4o-mini";
}

export function createRuntimeDefaultAiProvider(input: {
  config: WalkieTalkieConfig;
  fetchImpl?: AiFetchLike;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
}): RuntimeDefaultAiProviderBinding {
  const providerConfig = resolveDefaultAiProviderConfig(input.config, input.env);
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
