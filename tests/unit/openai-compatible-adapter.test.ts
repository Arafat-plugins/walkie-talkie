import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AiProviderFailure,
  buildOpenAiCompatiblePayload,
  createOpenAiCompatibleProvider,
  mapOpenAiCompatibleResponse,
  withProviderRetry,
  withProviderTimeout
} from "../../packages/integrations/src/index.ts";

test("buildOpenAiCompatiblePayload converts completion request to provider payload", () => {
  const payload = buildOpenAiCompatiblePayload({
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Check cursor." }
    ]
  });

  assert.deepEqual(payload, {
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Check cursor." }
    ]
  });
});

test("mapOpenAiCompatibleResponse extracts first assistant message text", () => {
  const response = mapOpenAiCompatibleResponse(
    {
      provider: {
        id: "primary-openai",
        kind: "openai-compatible"
      },
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }]
    },
    {
      choices: [
        {
          message: {
            content: "Walkie-Talkie ready."
          }
        }
      ]
    }
  );

  assert.deepEqual(response, {
    providerId: "primary-openai",
    model: "gpt-4o-mini",
    outputText: "Walkie-Talkie ready.",
    raw: {
      choices: [
        {
          message: {
            content: "Walkie-Talkie ready."
          }
        }
      ]
    }
  });
});

test("mapOpenAiCompatibleResponse throws normalized response error for missing assistant text", () => {
  assert.throws(
    () =>
      mapOpenAiCompatibleResponse(
        {
          provider: {
            id: "primary-openai",
            kind: "openai-compatible"
          },
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Hello" }]
        },
        {
          choices: []
        }
      ),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderFailure);
      assert.deepEqual(error.details, {
        providerId: "primary-openai",
        code: "response",
        message: "Provider response did not contain assistant text.",
        cause: {
          choices: []
        }
      });

      return true;
    }
  );
});

test("createOpenAiCompatibleProvider delegates to transport and returns normalized response", async () => {
  const calls: unknown[] = [];
  const provider = createOpenAiCompatibleProvider({
    config: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    transport: async (input) => {
      calls.push(input);
      return {
        choices: [
          {
            message: {
              content: "Cursor is installed."
            }
          }
        ]
      };
    }
  });

  const response = await provider.complete({
    provider: {
      id: "ignored",
      kind: "openai-compatible"
    },
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [{ role: "user", content: "Check cursor." }]
  });

  assert.deepEqual(calls, [
    {
      provider: {
        id: "primary-openai",
        kind: "openai-compatible",
        baseUrl: "https://api.example.com/v1",
        apiKey: "sk-test-123"
      },
      payload: {
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [{ role: "user", content: "Check cursor." }]
      }
    }
  ]);
  assert.deepEqual(response, {
    providerId: "primary-openai",
    model: "gpt-4o-mini",
    outputText: "Cursor is installed.",
    raw: {
      choices: [
        {
          message: {
            content: "Cursor is installed."
          }
        }
      ]
    }
  });
});

test("withProviderTimeout throws normalized timeout failure", async () => {
  await assert.rejects(
    () =>
      withProviderTimeout(
        new Promise<string>((resolve) => {
          setTimeout(() => resolve("late"), 20);
        }),
        1,
        "primary-openai"
      ),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderFailure);
      assert.equal(error.details.providerId, "primary-openai");
      assert.equal(error.details.code, "timeout");
      assert.match(error.details.message, /timed out/);

      return true;
    }
  );
});

test("createOpenAiCompatibleProvider normalizes transport failures", async () => {
  const provider = createOpenAiCompatibleProvider({
    config: {
      id: "primary-openai",
      kind: "openai-compatible"
    },
    transport: async () => {
      throw new Error("socket hang up");
    },
    timeoutMs: 10
  });

  await assert.rejects(
    () =>
      provider.complete({
        provider: {
          id: "ignored",
          kind: "openai-compatible"
        },
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }]
      }),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderFailure);
      assert.equal(error.details.providerId, "primary-openai");
      assert.equal(error.details.code, "transport");
      assert.equal(error.details.message, "Provider transport request failed.");

      return true;
    }
  );
});

test("withProviderRetry retries retryable provider failures and eventually succeeds", async () => {
  const delays: number[] = [];
  let attempts = 0;

  const result = await withProviderRetry({
    providerId: "primary-openai",
    retryPolicy: {
      maxAttempts: 3,
      baseDelayMs: 25,
      retryableSources: ["provider"],
      retryableCodes: ["transport"]
    },
    onDelay: async (delayMs) => {
      delays.push(delayMs);
    },
    execute: async () => {
      attempts += 1;

      if (attempts < 2) {
        throw new AiProviderFailure({
          providerId: "primary-openai",
          code: "transport",
          message: "Temporary upstream socket issue."
        });
      }

      return "success";
    }
  });

  assert.equal(result, "success");
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [25]);
});

test("createOpenAiCompatibleProvider does not retry non-retryable response failures", async () => {
  let attempts = 0;
  const provider = createOpenAiCompatibleProvider({
    config: {
      id: "primary-openai",
      kind: "openai-compatible"
    },
    transport: async () => {
      attempts += 1;
      return {
        choices: []
      };
    },
    retryPolicy: {
      maxAttempts: 3,
      baseDelayMs: 10
    },
    onDelay: async () => {}
  });

  await assert.rejects(
    () =>
      provider.complete({
        provider: {
          id: "ignored",
          kind: "openai-compatible"
        },
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }]
      }),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderFailure);
      assert.equal(error.details.code, "response");
      return true;
    }
  );

  assert.equal(attempts, 1);
});
