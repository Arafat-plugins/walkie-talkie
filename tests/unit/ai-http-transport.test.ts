import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildAiHttpTransportHeaders,
  buildAiHttpTransportUrl,
  createAiHttpTransportRequest
} from "../../packages/integrations/src/index.ts";

test("buildAiHttpTransportUrl builds provider endpoint path against base URL", () => {
  const customUrl = buildAiHttpTransportUrl(
    {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1/"
    },
    "/chat/completions"
  );
  const defaultUrl = buildAiHttpTransportUrl(
    {
      id: "primary-openai",
      kind: "openai-compatible"
    },
    "chat/completions"
  );

  assert.equal(customUrl, "https://api.example.com/v1/chat/completions");
  assert.equal(defaultUrl, "https://api.openai.com/v1/chat/completions");
});

test("buildAiHttpTransportHeaders includes JSON content type and optional bearer auth", () => {
  const withAuth = buildAiHttpTransportHeaders({
    id: "primary-openai",
    kind: "openai-compatible",
    apiKey: "sk-test-123"
  });
  const withoutAuth = buildAiHttpTransportHeaders({
    id: "primary-openai",
    kind: "openai-compatible"
  });

  assert.deepEqual(withAuth, {
    "content-type": "application/json",
    authorization: "Bearer sk-test-123"
  });
  assert.deepEqual(withoutAuth, {
    "content-type": "application/json"
  });
});

test("createAiHttpTransportRequest normalizes POST request contract", () => {
  const request = createAiHttpTransportRequest({
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    pathName: "/chat/completions",
    payload: {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }]
    },
    timeoutMs: 15000
  });

  assert.deepEqual(request, {
    provider: {
      id: "primary-openai",
      kind: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test-123"
    },
    url: "https://api.example.com/v1/chat/completions",
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer sk-test-123"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }]
    }),
    timeoutMs: 15000
  });
});
