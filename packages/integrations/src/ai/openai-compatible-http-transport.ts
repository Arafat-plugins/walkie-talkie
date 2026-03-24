import {
  createAiHttpTransportRequest,
  createFetchAiHttpTransport,
  type AiFetchLike,
  type AiHttpTransportResponse
} from "./http-transport.ts";
import type {
  OpenAiCompatiblePayload,
  OpenAiCompatibleRawResponse,
  OpenAiCompatibleTransport
} from "./openai-compatible-adapter.ts";

export function parseOpenAiCompatibleHttpTransportResponse(
  response: AiHttpTransportResponse
): OpenAiCompatibleRawResponse {
  return JSON.parse(response.bodyText) as OpenAiCompatibleRawResponse;
}

export function createFetchOpenAiCompatibleTransport(input?: {
  fetchImpl?: AiFetchLike;
  timeoutMs?: number;
}): OpenAiCompatibleTransport {
  const httpTransport = createFetchAiHttpTransport({
    fetchImpl: input?.fetchImpl
  });

  return async ({ provider, payload }) => {
    const response = await httpTransport(
      createAiHttpTransportRequest({
        provider,
        pathName: "/chat/completions",
        payload,
        timeoutMs: input?.timeoutMs
      })
    );

    return parseOpenAiCompatibleHttpTransportResponse(response);
  };
}
