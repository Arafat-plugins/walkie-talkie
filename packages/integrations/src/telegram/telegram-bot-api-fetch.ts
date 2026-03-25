import {
  createTelegramBotApiClient,
  type TelegramBotApiClient,
  type TelegramBotApiConfig,
  type TelegramBotApiTransport
} from "./telegram-bot-api.ts";

export type TelegramFetchLike = typeof fetch;

export function createFetchTelegramBotApiTransport(input?: {
  fetchImpl?: TelegramFetchLike;
}): TelegramBotApiTransport {
  return async ({ config, method, url, payload }) => {
    const fetchImpl = input?.fetchImpl ?? fetch;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const bodyText = await response.text();

    try {
      return JSON.parse(bodyText) as { ok?: boolean; result?: unknown; description?: string };
    } catch (error) {
      throw new Error(
        `Telegram ${method} HTTP response could not be parsed as JSON for bot token ${config.botToken.slice(0, 4)}...`,
        { cause: error }
      );
    }
  };
}

export function createFetchTelegramBotApiClient(input: {
  config: TelegramBotApiConfig;
  fetchImpl?: TelegramFetchLike;
}): TelegramBotApiClient {
  return createTelegramBotApiClient({
    config: input.config,
    transport: createFetchTelegramBotApiTransport({
      fetchImpl: input.fetchImpl
    })
  });
}
