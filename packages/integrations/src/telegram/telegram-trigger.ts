import { createTriggerEvent, type TriggerEvent } from "../../../core/src/index.ts";
import type { TelegramIncomingMessage } from "./telegram-adapter.ts";

export const TELEGRAM_MESSAGE_RECEIVED_EVENT = "telegram.message.received" as const;

export function createTelegramTriggerEvent(
  message: TelegramIncomingMessage,
  now: () => string = () => new Date().toISOString()
): TriggerEvent {
  return createTriggerEvent({
    kind: "telegram",
    eventName: TELEGRAM_MESSAGE_RECEIVED_EVENT,
    sourceId: String(message.chatId),
    occurredAt: now(),
    payload: {
      chatId: message.chatId,
      messageId: message.messageId,
      text: message.text,
      username: message.username
    }
  });
}
