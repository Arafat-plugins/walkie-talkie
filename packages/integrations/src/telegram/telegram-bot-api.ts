import type { TelegramOutgoingMessage } from "./telegram-adapter.ts";

export const TELEGRAM_BOT_API_METHODS = ["getUpdates", "sendMessage"] as const;

export type TelegramBotApiMethod = (typeof TELEGRAM_BOT_API_METHODS)[number];

export type TelegramBotApiConfig = {
  botToken: string;
  baseUrl?: string;
};

export type TelegramBotApiEnvelope<Result> = {
  ok?: boolean;
  result?: Result;
  description?: string;
};

export type TelegramGetUpdatesRequest = {
  offset?: number;
  limit?: number;
  timeoutSeconds?: number;
  allowedUpdates?: string[];
};

export type TelegramDeliveredMessage = {
  messageId: number;
  chatId: number;
  text?: string;
};

export type TelegramBotApiError = {
  method: TelegramBotApiMethod;
  code: "transport" | "response";
  message: string;
  cause?: unknown;
};

export type TelegramBotApiTransport = (input: {
  config: TelegramBotApiConfig;
  method: TelegramBotApiMethod;
  url: string;
  payload: Record<string, unknown>;
}) => Promise<TelegramBotApiEnvelope<unknown>>;

export type TelegramBotApiClient = {
  config: TelegramBotApiConfig;
  getUpdates(request?: TelegramGetUpdatesRequest): Promise<unknown[]>;
  sendMessage(message: TelegramOutgoingMessage): Promise<TelegramDeliveredMessage>;
};

function createTelegramBotApiError(input: TelegramBotApiError): TelegramBotApiError {
  return {
    ...input
  };
}

export class TelegramBotApiFailure extends Error {
  readonly details: TelegramBotApiError;

  constructor(details: TelegramBotApiError) {
    super(details.message);
    this.name = "TelegramBotApiFailure";
    this.details = details;
  }
}

export function buildTelegramBotApiUrl(
  config: TelegramBotApiConfig,
  method: TelegramBotApiMethod
): string {
  const baseUrl = (config.baseUrl ?? "https://api.telegram.org").replace(/\/+$/, "");
  return `${baseUrl}/bot${config.botToken}/${method}`;
}

export function buildTelegramGetUpdatesPayload(
  request: TelegramGetUpdatesRequest = {}
): Record<string, unknown> {
  return {
    ...(request.offset !== undefined ? { offset: request.offset } : {}),
    ...(request.limit !== undefined ? { limit: request.limit } : {}),
    ...(request.timeoutSeconds !== undefined ? { timeout: request.timeoutSeconds } : {}),
    ...(request.allowedUpdates !== undefined ? { allowed_updates: [...request.allowedUpdates] } : {})
  };
}

export function buildTelegramSendMessagePayload(
  message: TelegramOutgoingMessage
): Record<string, unknown> {
  return {
    chat_id: message.chatId,
    text: message.text,
    ...(message.replyToMessageId !== undefined
      ? { reply_to_message_id: message.replyToMessageId }
      : {})
  };
}

export function mapTelegramGetUpdatesResponse(
  raw: TelegramBotApiEnvelope<unknown>
): unknown[] {
  if (raw.ok !== true || !Array.isArray(raw.result)) {
    throw new TelegramBotApiFailure(
      createTelegramBotApiError({
        method: "getUpdates",
        code: "response",
        message: raw.description ?? "Telegram getUpdates response did not contain an update array.",
        cause: raw
      })
    );
  }

  return [...raw.result];
}

export function mapTelegramSendMessageResponse(
  raw: TelegramBotApiEnvelope<unknown>
): TelegramDeliveredMessage {
  const result = raw.result as
    | {
        message_id?: unknown;
        text?: unknown;
        chat?: { id?: unknown };
      }
    | undefined;

  if (
    raw.ok !== true ||
    typeof result?.message_id !== "number" ||
    typeof result.chat?.id !== "number"
  ) {
    throw new TelegramBotApiFailure(
      createTelegramBotApiError({
        method: "sendMessage",
        code: "response",
        message: raw.description ?? "Telegram sendMessage response did not contain a delivered message.",
        cause: raw
      })
    );
  }

  return {
    messageId: result.message_id,
    chatId: result.chat.id,
    text: typeof result.text === "string" ? result.text : undefined
  };
}

export function createTelegramBotApiClient(input: {
  config: TelegramBotApiConfig;
  transport: TelegramBotApiTransport;
}): TelegramBotApiClient {
  return {
    config: { ...input.config },
    async getUpdates(request = {}) {
      const payload = buildTelegramGetUpdatesPayload(request);

      try {
        const raw = await input.transport({
          config: { ...input.config },
          method: "getUpdates",
          url: buildTelegramBotApiUrl(input.config, "getUpdates"),
          payload
        });

        return mapTelegramGetUpdatesResponse(raw);
      } catch (error) {
        if (error instanceof TelegramBotApiFailure) {
          throw error;
        }

        throw new TelegramBotApiFailure(
          createTelegramBotApiError({
            method: "getUpdates",
            code: "transport",
            message: "Telegram getUpdates transport request failed.",
            cause: error
          })
        );
      }
    },
    async sendMessage(message) {
      const payload = buildTelegramSendMessagePayload(message);

      try {
        const raw = await input.transport({
          config: { ...input.config },
          method: "sendMessage",
          url: buildTelegramBotApiUrl(input.config, "sendMessage"),
          payload
        });

        return mapTelegramSendMessageResponse(raw);
      } catch (error) {
        if (error instanceof TelegramBotApiFailure) {
          throw error;
        }

        throw new TelegramBotApiFailure(
          createTelegramBotApiError({
            method: "sendMessage",
            code: "transport",
            message: "Telegram sendMessage transport request failed.",
            cause: error
          })
        );
      }
    }
  };
}
