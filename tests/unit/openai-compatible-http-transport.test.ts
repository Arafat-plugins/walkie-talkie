import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildOpenAiCompatiblePayload,
  createFetchAiHttpTransport,
  createFetchOpenAiCompatibleTransport,
  parseOpenAiCompatibleHttpTransportResponse
} from "../../packages/integrations/src/index.ts";

test("createFetchAiHttpTransport delegates normalized HTTP request into fetch", async () => {
  const calls: Array<{
    url: string;
    init: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
      signal?: AbortSignal;
    };
  }> = [];
  const transport = createFetchAiHttpTransport({
    fetchImpl: async (url, init) => {
      calls.push({
        url: String(url),
        init: {
          method: init?.method,
          headers: init?.headers as Record<string, string>,
          body: init?.body as string,
          signal: init?.signal as AbortSignal
        }
      });

      return new Response('{"ok":true}', {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
  });

  const response = await transport({
    provider: {
      id: "primary-openai",
      kind: "openai-compatible"
    },
    url: "https://api.example.com/v1/chat/completions",
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer sk-test-123"
    },
    body: '{"model":"gpt-4o-mini"}',
    timeoutMs: 1234
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "https://api.example.com/v1/chat/completions");
  assert.equal(calls[0]?.init.method, "POST");
  assert.deepEqual(calls[0]?.init.headers, {
    "content-type": "application/json",
    authorization: "Bearer sk-test-123"
  });
  assert.equal(calls[0]?.init.body, '{"model":"gpt-4o-mini"}');
  assert.ok(calls[0]?.init.signal instanceof AbortSignal);
  assert.deepEqual(response, {
    status: 200,
    headers: {
      "content-type": "application/json"
    },
    bodyText: '{"ok":true}'
  });
});

test("createFetchOpenAiCompatibleTransport sends chat completions request and parses JSON response", async () => {
  const calls: Array<{
    url: string;
    init: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    };
  }> = [];
  const transport = createFetchOpenAiCompatibleTransport({
    fetchImpl: async (url, init) => {
      calls.push({
        url: String(url),
        init: {
          method: init?.method,
          headers: init?.headers as Record<string, string>,
          body: init?.body as string
        }
      });

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Cursor is installed."
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    },
    timeoutMs: 4321
  });
  const payload = buildOpenAiCompatiblePayload({
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [{ role: "user", content: "Check cursor." }]
  });

  const raw = await transport({
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    payload
  });

  assert.deepEqual(calls, [
    {
      url: "https://api.example.com/v1/chat/completions",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer sk-test-123"
        },
        body: JSON.stringify(payload)
      }
    }
  ]);
  assert.deepEqual(raw, {
    choices: [
      {
        message: {
          content: "Cursor is installed."
        }
      }
    ]
  });
});

test("parseOpenAiCompatibleHttpTransportResponse parses bodyText JSON", () => {
  const raw = parseOpenAiCompatibleHttpTransportResponse({
    status: 200,
    headers: {
      "content-type": "application/json"
    },
    bodyText: '{"choices":[{"message":{"content":"hello"}}]}'
  });

  assert.deepEqual(raw, {
    choices: [
      {
        message: {
          content: "hello"
        }
      }
    ]
  });
});
