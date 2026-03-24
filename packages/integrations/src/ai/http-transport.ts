import type { AiProviderConfig } from "./provider-contract.ts";

export type AiHttpTransportMethod = "POST";

export type AiHttpTransportRequest = {
  provider: AiProviderConfig;
  url: string;
  method: AiHttpTransportMethod;
  headers: Record<string, string>;
  body: string;
  timeoutMs: number;
};

export type AiHttpTransportResponse = {
  status: number;
  headers?: Record<string, string>;
  bodyText: string;
};

export type AiHttpTransport = (
  request: AiHttpTransportRequest
) => Promise<AiHttpTransportResponse>;

export type AiFetchLike = typeof fetch;

export function buildAiHttpTransportUrl(provider: AiProviderConfig, pathName: string): string {
  const baseUrl = (provider.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const normalizedPath = pathName.startsWith("/") ? pathName : `/${pathName}`;

  return `${baseUrl}${normalizedPath}`;
}

export function buildAiHttpTransportHeaders(provider: AiProviderConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (provider.apiKey) {
    headers.authorization = `Bearer ${provider.apiKey}`;
  }

  return headers;
}

export function createAiHttpTransportRequest(input: {
  provider: AiProviderConfig;
  pathName: string;
  payload: unknown;
  timeoutMs?: number;
}): AiHttpTransportRequest {
  return {
    provider: { ...input.provider },
    url: buildAiHttpTransportUrl(input.provider, input.pathName),
    method: "POST",
    headers: buildAiHttpTransportHeaders(input.provider),
    body: JSON.stringify(input.payload),
    timeoutMs: input.timeoutMs ?? 30_000
  };
}

export function createFetchAiHttpTransport(input?: {
  fetchImpl?: AiFetchLike;
}): AiHttpTransport {
  return async (request) => {
    const fetchImpl = input?.fetchImpl ?? fetch;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, request.timeoutMs);

    try {
      const response = await fetchImpl(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal
      });

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        bodyText: await response.text()
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  };
}
