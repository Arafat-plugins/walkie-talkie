import type { TelegramOutgoingMessage } from "./telegram-adapter.ts";

export const TELEGRAM_BOT_API_METHODS = ["getUpdates", "sendMessage", "setWebhook"] as const;

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

export type TelegramSetWebhookRequest = {
  url: string;
  secretToken?: string;
  allowedUpdates?: string[];
  dropPendingUpdates?: boolean;
};

export type TelegramWebhookRegistration = {
  url: string;
  secretTokenEnabled: boolean;
  allowedUpdates: string[];
  dropPendingUpdates: boolean;
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
  setWebhook(request: TelegramSetWebhookRequest): Promise<TelegramWebhookRegistration>;
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

export function buildTelegramSetWebhookPayload(
  request: TelegramSetWebhookRequest
): Record<string, unknown> {
  return {
    url: request.url,
    ...(request.secretToken !== undefined ? { secret_token: request.secretToken } : {}),
    ...(request.allowedUpdates !== undefined
      ? { allowed_updates: [...request.allowedUpdates] }
      : {}),
    ...(request.dropPendingUpdates !== undefined
      ? { drop_pending_updates: request.dropPendingUpdates }
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

export function mapTelegramSetWebhookResponse(
  raw: TelegramBotApiEnvelope<unknown>,
  request: TelegramSetWebhookRequest
): TelegramWebhookRegistration {
  if (raw.ok !== true || raw.result !== true) {
    throw new TelegramBotApiFailure(
      createTelegramBotApiError({
        method: "setWebhook",
        code: "response",
        message: raw.description ?? "Telegram setWebhook response did not confirm registration.",
        cause: raw
      })
    );
  }

  return {
    url: request.url,
    secretTokenEnabled: request.secretToken !== undefined,
    allowedUpdates: [...(request.allowedUpdates ?? [])],
    dropPendingUpdates: request.dropPendingUpdates ?? false
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
    },
    async setWebhook(request) {
      const payload = buildTelegramSetWebhookPayload(request);

      try {
        const raw = await input.transport({
          config: { ...input.config },
          method: "setWebhook",
          url: buildTelegramBotApiUrl(input.config, "setWebhook"),
          payload
        });

        return mapTelegramSetWebhookResponse(raw, request);
      } catch (error) {
        if (error instanceof TelegramBotApiFailure) {
          throw error;
        }

        throw new TelegramBotApiFailure(
          createTelegramBotApiError({
            method: "setWebhook",
            code: "transport",
            message: "Telegram setWebhook transport request failed.",
            cause: error
          })
        );
      }
    }
  };
}
