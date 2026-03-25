import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createFetchTelegramBotApiClient,
  createFetchTelegramBotApiTransport
} from "../../packages/integrations/src/index.ts";

test("createFetchTelegramBotApiTransport sends POST JSON through fetch", async () => {
  const calls: Array<{
    url: string;
    init: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    };
  }> = [];

  const transport = createFetchTelegramBotApiTransport({
    fetchImpl: async (url, init) => {
      calls.push({
        url: String(url),
        init: {
          method: init?.method,
          headers: init?.headers as Record<string, string>,
          body: init?.body as string
        }
      });

      return new Response('{"ok":true,"result":[]}', {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
  });

  const response = await transport({
    config: {
      botToken: "123:abc"
    },
    method: "getUpdates",
    url: "https://api.telegram.org/bot123:abc/getUpdates",
    payload: {
      offset: 100
    }
  });

  assert.deepEqual(calls, [
    {
      url: "https://api.telegram.org/bot123:abc/getUpdates",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: '{"offset":100}'
      }
    }
  ]);
  assert.deepEqual(response, {
    ok: true,
    result: []
  });
});

test("createFetchTelegramBotApiClient wires fetch transport into bot client", async () => {
  const client = createFetchTelegramBotApiClient({
    config: {
      botToken: "123:abc"
    },
    fetchImpl: async () =>
      new Response('{"ok":true,"result":[{"update_id":99}]}', {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
  });

  const updates = await client.getUpdates({
    offset: 99
  });

  assert.deepEqual(updates, [{ update_id: 99 }]);
});
