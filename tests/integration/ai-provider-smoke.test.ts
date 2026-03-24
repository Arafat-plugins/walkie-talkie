import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  AiProviderFailure,
  buildOpenAiCompatiblePayload,
  createOpenAiCompatibleProvider
} from "../../packages/integrations/src/index.ts";

function readFixture<T>(name: string): T {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/ai", name);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as T;
}

test("AI provider smoke: fixture request flows through provider transport and returns normalized response", async () => {
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

  const calls: unknown[] = [];
  const provider = createOpenAiCompatibleProvider({
    config: request.provider,
    transport: async (input) => {
      calls.push(input);
      return rawResponse;
    },
    timeoutMs: 50
  });

  const response = await provider.complete(request);

  assert.deepEqual(calls, [
    {
      provider: request.provider,
      payload: buildOpenAiCompatiblePayload(request)
    }
  ]);
  assert.deepEqual(response, {
    providerId: "primary-openai",
    model: "gpt-4o-mini",
    outputText: "Cursor is installed on the server.",
    raw: rawResponse
  });
});

test("AI provider smoke: invalid fixture-like response returns normalized response failure", async () => {
  const request = readFixture<{
    provider: {
      id: string;
      kind: "openai-compatible";
    };
    model: string;
    messages: Array<{ role: "system" | "user"; content: string }>;
  }>("openai-compatible-request.json");

  const provider = createOpenAiCompatibleProvider({
    config: request.provider,
    transport: async () => ({
      choices: []
    }),
    timeoutMs: 50
  });

  await assert.rejects(
    () => provider.complete(request),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderFailure);
      assert.equal(error.details.providerId, "primary-openai");
      assert.equal(error.details.code, "response");
      assert.equal(error.details.message, "Provider response did not contain assistant text.");

      return true;
    }
  );
});
