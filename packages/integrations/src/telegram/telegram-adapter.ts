export const TELEGRAM_ADAPTER_KIND = "telegram" as const;

import type { TelegramDeliveryConfig } from "./telegram-delivery-mode.ts";
import { createTelegramDeliveryConfig } from "./telegram-delivery-mode.ts";

export type TelegramIncomingMessage = {
  messageId: number;
  chatId: number;
  text: string;
  username?: string;
};

export type TelegramOutgoingMessage = {
  chatId: number;
  text: string;
  replyToMessageId?: number;
};

export type TelegramAdapter = {
  kind: typeof TELEGRAM_ADAPTER_KIND;
  delivery: TelegramDeliveryConfig;
  receive(update: unknown): TelegramIncomingMessage | null;
  createReply(message: TelegramIncomingMessage, text: string): TelegramOutgoingMessage;
};

export function normalizeIncomingTelegramUpdate(update: unknown): TelegramIncomingMessage | null {
  if (!update || typeof update !== "object") {
    return null;
  }

  const candidate = update as {
    message?: {
      message_id?: unknown;
      chat?: { id?: unknown };
      text?: unknown;
      from?: { username?: unknown };
    };
  };

  const messageId = candidate.message?.message_id;
  const chatId = candidate.message?.chat?.id;
  const text = candidate.message?.text;

  if (typeof messageId !== "number" || typeof chatId !== "number" || typeof text !== "string") {
    return null;
  }

  const username = candidate.message?.from?.username;

  return {
    messageId,
    chatId,
    text,
    username: typeof username === "string" ? username : undefined
  };
}

export function createTelegramAdapter(input?: {
  delivery?: Partial<TelegramDeliveryConfig>;
}): TelegramAdapter {
  return {
    kind: TELEGRAM_ADAPTER_KIND,
    delivery: createTelegramDeliveryConfig(input?.delivery),
    receive(update) {
      return normalizeIncomingTelegramUpdate(update);
    },
    createReply(message, text) {
      return {
        chatId: message.chatId,
        text,
        replyToMessageId: message.messageId
      };
    }
  };
}
