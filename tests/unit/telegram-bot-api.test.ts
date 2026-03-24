import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TelegramBotApiFailure,
  buildTelegramBotApiUrl,
  buildTelegramGetUpdatesPayload,
  buildTelegramSendMessagePayload,
  createTelegramBotApiClient
} from "../../packages/integrations/src/index.ts";

test("buildTelegramBotApiUrl creates default Telegram API method URL", () => {
  const url = buildTelegramBotApiUrl(
    {
      botToken: "123:abc"
    },
    "getUpdates"
  );

  assert.equal(url, "https://api.telegram.org/bot123:abc/getUpdates");
});

test("buildTelegramGetUpdatesPayload and buildTelegramSendMessagePayload normalize request fields", () => {
  const getUpdatesPayload = buildTelegramGetUpdatesPayload({
    offset: 10,
    limit: 25,
    timeoutSeconds: 30,
    allowedUpdates: ["message", "callback_query"]
  });
  const sendMessagePayload = buildTelegramSendMessagePayload({
    chatId: 7788,
    text: "Walkie-Talkie ready.",
    replyToMessageId: 55
  });

  assert.deepEqual(getUpdatesPayload, {
    offset: 10,
    limit: 25,
    timeout: 30,
    allowed_updates: ["message", "callback_query"]
  });
  assert.deepEqual(sendMessagePayload, {
    chat_id: 7788,
    text: "Walkie-Talkie ready.",
    reply_to_message_id: 55
  });
});

test("createTelegramBotApiClient delegates getUpdates and sendMessage through transport", async () => {
  const transportCalls: Array<{ method: string; url: string; payload: Record<string, unknown> }> = [];
  const client = createTelegramBotApiClient({
    config: {
      botToken: "123:abc"
    },
    transport: async ({ method, url, payload }) => {
      transportCalls.push({ method, url, payload });

      if (method === "getUpdates") {
        return {
          ok: true,
          result: [
            {
              update_id: 1000
            }
          ]
        };
      }

      return {
        ok: true,
        result: {
          message_id: 998,
          text: "Walkie-Talkie ready.",
          chat: {
            id: 7788
          }
        }
      };
    }
  });

  const updates = await client.getUpdates({
    offset: 1000
  });
  const delivered = await client.sendMessage({
    chatId: 7788,
    text: "Walkie-Talkie ready."
  });

  assert.deepEqual(updates, [{ update_id: 1000 }]);
  assert.deepEqual(delivered, {
    messageId: 998,
    chatId: 7788,
    text: "Walkie-Talkie ready."
  });
  assert.deepEqual(transportCalls, [
    {
      method: "getUpdates",
      url: "https://api.telegram.org/bot123:abc/getUpdates",
      payload: {
        offset: 1000
      }
    },
    {
      method: "sendMessage",
      url: "https://api.telegram.org/bot123:abc/sendMessage",
      payload: {
        chat_id: 7788,
        text: "Walkie-Talkie ready."
      }
    }
  ]);
});

test("createTelegramBotApiClient normalizes invalid API response and transport failures", async () => {
  const badResponseClient = createTelegramBotApiClient({
    config: {
      botToken: "123:abc"
    },
    transport: async () => ({
      ok: true,
      result: {
        invalid: true
      }
    })
  });
  const transportFailureClient = createTelegramBotApiClient({
    config: {
      botToken: "123:abc"
    },
    transport: async () => {
      throw new Error("network down");
    }
  });

  await assert.rejects(
    badResponseClient.sendMessage({
      chatId: 1,
      text: "hello"
    }),
    (error: unknown) =>
      error instanceof TelegramBotApiFailure &&
      error.details.code === "response" &&
      error.details.method === "sendMessage"
  );

  await assert.rejects(
    transportFailureClient.getUpdates(),
    (error: unknown) =>
      error instanceof TelegramBotApiFailure &&
      error.details.code === "transport" &&
      error.details.method === "getUpdates"
  );
});
