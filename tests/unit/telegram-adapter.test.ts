import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TELEGRAM_ADAPTER_KIND,
  createTelegramAdapter,
  createTelegramDeliveryConfig,
  normalizeIncomingTelegramUpdate
} from "../../packages/integrations/src/index.ts";

test("normalizeIncomingTelegramUpdate extracts a minimal incoming message shape", () => {
  const result = normalizeIncomingTelegramUpdate({
    update_id: 123,
    message: {
      message_id: 456,
      text: "check cursor",
      chat: { id: 789 },
      from: { username: "arafat" }
    }
  });

  assert.deepEqual(result, {
    messageId: 456,
    chatId: 789,
    text: "check cursor",
    username: "arafat"
  });
});

test("normalizeIncomingTelegramUpdate returns null for unsupported update shapes", () => {
  const result = normalizeIncomingTelegramUpdate({
    callback_query: {
      id: "ignored"
    }
  });

  assert.equal(result, null);
});

test("createTelegramAdapter exposes receive and createReply skeleton methods", () => {
  const adapter = createTelegramAdapter();

  assert.equal(adapter.kind, TELEGRAM_ADAPTER_KIND);
  assert.deepEqual(adapter.delivery, {
    mode: "polling",
    pollingIntervalMs: 2000
  });

  const incoming = adapter.receive({
    message: {
      message_id: 11,
      text: "hello",
      chat: { id: 22 }
    }
  });

  assert.deepEqual(incoming, {
    messageId: 11,
    chatId: 22,
    text: "hello",
    username: undefined
  });

  if (!incoming) {
    return;
  }

  const reply = adapter.createReply(incoming, "Walkie-Talkie ready.");

  assert.deepEqual(reply, {
    chatId: 22,
    text: "Walkie-Talkie ready.",
    replyToMessageId: 11
  });
});

test("createTelegramDeliveryConfig applies mode-specific defaults", () => {
  const webhookConfig = createTelegramDeliveryConfig({
    mode: "webhook"
  });
  const pollingConfig = createTelegramDeliveryConfig();

  assert.deepEqual(webhookConfig, {
    mode: "webhook",
    webhookPath: "/telegram/webhook"
  });
  assert.deepEqual(pollingConfig, {
    mode: "polling",
    pollingIntervalMs: 2000
  });
});

test("createTelegramAdapter accepts explicit delivery mode configuration", () => {
  const adapter = createTelegramAdapter({
    delivery: {
      mode: "webhook",
      webhookPath: "/bot/walkie"
    }
  });

  assert.deepEqual(adapter.delivery, {
    mode: "webhook",
    webhookPath: "/bot/walkie"
  });
});
