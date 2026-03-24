import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import {
  createFetchOpenAiCompatibleTransport,
  createOpenAiCompatibleProvider
} from "../../packages/integrations/src/index.ts";
import { createRuntimeDefaultAiProvider } from "../../packages/runtime/src/index.ts";

function readFixture<T>(name: string): T {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/ai", name);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as T;
}

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-ai-live",
      primaryTrigger: "cli"
    },
    runtime: {
      environment: "server"
    },
    providers: {
      defaultAi: {
        apiKey: "sk-live-demo",
        baseUrl: "https://api.example.com/v1",
        model: "gpt-4.1-mini"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("AI live transport smoke: runtime default provider completes through fixture-backed fetch transport", async () => {
  const request = readFixture<{
    provider: {
      id: string;
      kind: "openai-compatible";
      baseUrl: string;
      apiKey: string;
    };
    model: string;
    temperature: number;
    messages: Array<{ role: "system" | "user"; content: string }>;
  }>("openai-compatible-request.json");
  const rawResponse = readFixture<{
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }>("openai-compatible-response.json");

  const calls: Array<{
    url: string;
    init: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    };
  }> = [];
  const binding = createRuntimeDefaultAiProvider({
    config: createConfig(),
    timeoutMs: 4321,
    fetchImpl: async (url, init) => {
      calls.push({
        url: String(url),
        init: {
          method: init?.method,
          headers: init?.headers as Record<string, string>,
          body: init?.body as string
        }
      });

      return new Response(JSON.stringify(rawResponse), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    }
  });

  const response = await binding.provider.complete({
    ...request,
    provider: {
      id: "ignored",
      kind: "openai-compatible"
    },
    model: binding.defaultModel
  });

  assert.equal(binding.defaultModel, "gpt-4.1-mini");
  assert.deepEqual(calls, [
    {
      url: "https://api.example.com/v1/chat/completions",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer sk-live-demo"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: request.temperature,
          messages: request.messages
        })
      }
    }
  ]);
  assert.deepEqual(response, {
    providerId: "default-ai",
    model: "gpt-4.1-mini",
    outputText: "Cursor is installed on the server.",
    raw: rawResponse
  });
});

test("AI live transport smoke: retryable fetch failure recovers on second attempt", async () => {
  const request = readFixture<{
    provider: {
      id: string;
      kind: "openai-compatible";
      baseUrl: string;
      apiKey: string;
    };
    model: string;
    temperature: number;
    messages: Array<{ role: "system" | "user"; content: string }>;
  }>("openai-compatible-request.json");
  const rawResponse = readFixture<{
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }>("openai-compatible-response.json");

  const delays: number[] = [];
  let attempts = 0;
  const provider = createOpenAiCompatibleProvider({
    config: request.provider,
    transport: createFetchOpenAiCompatibleTransport({
      timeoutMs: 987,
      fetchImpl: async () => {
        attempts += 1;

        if (attempts === 1) {
          throw new Error("temporary upstream reset");
        }

        return new Response(JSON.stringify(rawResponse), {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        });
      }
    }),
    timeoutMs: 987,
    retryPolicy: {
      maxAttempts: 2,
      baseDelayMs: 15,
      retryableSources: ["provider"],
      retryableCodes: ["transport", "timeout"]
    },
    onDelay: async (delayMs) => {
      delays.push(delayMs);
    }
  });

  const response = await provider.complete(request);

  assert.equal(attempts, 2);
  assert.deepEqual(delays, [15]);
  assert.deepEqual(response, {
    providerId: "primary-openai",
    model: "gpt-4o-mini",
    outputText: "Cursor is installed on the server.",
    raw: rawResponse
  });
});
