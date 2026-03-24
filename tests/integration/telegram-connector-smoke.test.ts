import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  TELEGRAM_MESSAGE_RECEIVED_EVENT,
  createTelegramAdapter,
  createTelegramTriggerEvent
} from "../../packages/integrations/src/index.ts";

function readFixture(name: string): unknown {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/telegram", name);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as unknown;
}

test("telegram connector smoke: webhook fixture flows through adapter to trigger and reply", () => {
  const adapter = createTelegramAdapter({
    delivery: {
      mode: "webhook"
    }
  });

  const incoming = adapter.receive(readFixture("message-update.json"));
  assert.notEqual(incoming, null);

  if (!incoming) {
    return;
  }

  const trigger = createTelegramTriggerEvent(incoming, () => "2026-03-21T12:30:00.000Z");
  const reply = adapter.createReply(incoming, "Cursor check queued.");

  assert.deepEqual(adapter.delivery, {
    mode: "webhook",
    webhookPath: "/telegram/webhook"
  });
  assert.deepEqual(trigger, {
    kind: "telegram",
    eventName: TELEGRAM_MESSAGE_RECEIVED_EVENT,
    sourceId: "998877",
    occurredAt: "2026-03-21T12:30:00.000Z",
    payload: {
      chatId: 998877,
      messageId: 73,
      text: "check cursor on my server",
      username: "arafat"
    }
  });
  assert.deepEqual(reply, {
    chatId: 998877,
    text: "Cursor check queued.",
    replyToMessageId: 73
  });
});

test("telegram connector smoke: unsupported fixture is safely ignored", () => {
  const adapter = createTelegramAdapter({
    delivery: {
      mode: "polling",
      pollingIntervalMs: 5000
    }
  });

  const incoming = adapter.receive(readFixture("callback-update.json"));

  assert.deepEqual(adapter.delivery, {
    mode: "polling",
    pollingIntervalMs: 5000
  });
  assert.equal(incoming, null);
});
