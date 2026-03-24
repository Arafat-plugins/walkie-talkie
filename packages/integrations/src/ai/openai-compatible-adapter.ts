import {
  createAiCompletionRequest,
  type AiCompletionRequest,
  type AiCompletionResponse,
  type AiProviderError,
  type AiProvider,
  type AiProviderConfig
} from "./provider-contract.ts";

export type OpenAiCompatiblePayload = {
  model: string;
  temperature?: number;
  messages: {
    role: string;
    content: string;
  }[];
};

export type OpenAiCompatibleRawResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export type OpenAiCompatibleTransport = (input: {
  provider: AiProviderConfig;
  payload: OpenAiCompatiblePayload;
}) => Promise<OpenAiCompatibleRawResponse>;

function createAiProviderError(input: AiProviderError): AiProviderError {
  return {
    ...input
  };
}

export class AiProviderFailure extends Error {
  readonly details: AiProviderError;

  constructor(details: AiProviderError) {
    super(details.message);
    this.name = "AiProviderFailure";
    this.details = details;
  }
}

export function buildOpenAiCompatiblePayload(request: AiCompletionRequest): OpenAiCompatiblePayload {
  const normalized = createAiCompletionRequest(request);

  return {
    model: normalized.model,
    temperature: normalized.temperature,
    messages: normalized.messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  };
}

export function mapOpenAiCompatibleResponse(
  request: AiCompletionRequest,
  raw: OpenAiCompatibleRawResponse
): AiCompletionResponse {
  const outputText = raw.choices?.[0]?.message?.content;

  if (typeof outputText !== "string") {
    throw new AiProviderFailure(
      createAiProviderError({
        providerId: request.provider.id,
        code: "response",
        message: "Provider response did not contain assistant text.",
        cause: raw
      })
    );
  }

  return {
    providerId: request.provider.id,
    model: request.model,
    outputText,
    raw
  };
}

export async function withProviderTimeout<T>(
  action: Promise<T>,
  timeoutMs: number,
  providerId: string
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      action,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(
            new AiProviderFailure(
              createAiProviderError({
                providerId,
                code: "timeout",
                message: `Provider request timed out after ${timeoutMs}ms.`
              })
            )
          );
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export function createOpenAiCompatibleProvider(input: {
  config: AiProviderConfig;
  transport: OpenAiCompatibleTransport;
  timeoutMs?: number;
}): AiProvider {
  return {
    config: { ...input.config },
    async complete(request) {
      const normalized = createAiCompletionRequest({
        ...request,
        provider: input.config
      });
      const payload = buildOpenAiCompatiblePayload(normalized);
      let raw: OpenAiCompatibleRawResponse;

      try {
        raw = await withProviderTimeout(
          input.transport({
            provider: { ...input.config },
            payload
          }),
          input.timeoutMs ?? 30_000,
          input.config.id
        );
      } catch (error) {
        if (error instanceof AiProviderFailure) {
          throw error;
        }

        throw new AiProviderFailure(
          createAiProviderError({
            providerId: input.config.id,
            code: "transport",
            message: "Provider transport request failed.",
            cause: error
          })
        );
      }

      return mapOpenAiCompatibleResponse(normalized, raw);
    }
  };
}
