import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TELEGRAM_MESSAGE_RECEIVED_EVENT,
  createTelegramTriggerEvent
} from "../../packages/integrations/src/index.ts";

test("createTelegramTriggerEvent maps an incoming Telegram message to shared trigger contract", () => {
  const event = createTelegramTriggerEvent(
    {
      messageId: 44,
      chatId: 99,
      text: "check cursor on server",
      username: "arafat"
    },
    () => "2026-03-21T12:00:00.000Z"
  );

  assert.deepEqual(event, {
    kind: "telegram",
    eventName: TELEGRAM_MESSAGE_RECEIVED_EVENT,
    sourceId: "99",
    occurredAt: "2026-03-21T12:00:00.000Z",
    payload: {
      chatId: 99,
      messageId: 44,
      text: "check cursor on server",
      username: "arafat"
    }
  });
});
