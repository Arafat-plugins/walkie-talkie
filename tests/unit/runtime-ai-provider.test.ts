import assert from "node:assert/strict";
import { test } from "node:test";

import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import {
  createRuntimeDefaultAiProvider,
  resolveDefaultAiModel,
  resolveDefaultAiProviderConfig
} from "../../packages/runtime/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-demo",
      primaryTrigger: "cli"
    },
    runtime: {
      environment: "local"
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo",
        baseUrl: "https://api.example.com/v1",
        model: "gpt-4.1-mini"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("resolveDefaultAiProviderConfig and resolveDefaultAiModel map config into runtime defaults", () => {
  const config = createConfig();

  assert.deepEqual(resolveDefaultAiProviderConfig(config), {
    id: "default-ai",
    kind: "openai-compatible",
    baseUrl: "https://api.example.com/v1",
    apiKey: "sk-demo"
  });
  assert.equal(resolveDefaultAiModel(config), "gpt-4.1-mini");
  assert.equal(
    resolveDefaultAiModel({
      ...config,
      providers: {
        defaultAi: {
          apiKey: "sk-demo"
        }
      }
    }),
    "gpt-4o-mini"
  );
});

test("createRuntimeDefaultAiProvider wires config secrets into a callable provider", async () => {
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
    timeoutMs: 1234,
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
    }
  });

  const response = await binding.provider.complete({
    provider: {
      id: "ignored",
      kind: "openai-compatible"
    },
    model: binding.defaultModel,
    messages: [{ role: "user", content: "Check cursor." }]
  });

  assert.equal(binding.defaultModel, "gpt-4.1-mini");
  assert.deepEqual(binding.provider.config, {
    id: "default-ai",
    kind: "openai-compatible",
    baseUrl: "https://api.example.com/v1",
    apiKey: "sk-demo"
  });
  assert.deepEqual(calls, [
    {
      url: "https://api.example.com/v1/chat/completions",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer sk-demo"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: "Check cursor." }]
        })
      }
    }
  ]);
  assert.deepEqual(response, {
    providerId: "default-ai",
    model: "gpt-4.1-mini",
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
