import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AI_MESSAGE_ROLES,
  AI_PROVIDER_KINDS,
  createAiCompletionRequest
} from "../../packages/integrations/src/index.ts";

test("AI provider contract exposes supported provider kinds and roles", () => {
  assert.deepEqual(AI_PROVIDER_KINDS, ["openai-compatible"]);
  assert.deepEqual(AI_MESSAGE_ROLES, ["system", "user", "assistant", "tool"]);
});

test("createAiCompletionRequest clones provider and message structures", () => {
  const request = createAiCompletionRequest({
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Check cursor." }
    ]
  });

  assert.deepEqual(request, {
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Check cursor." }
    ]
  });
});
