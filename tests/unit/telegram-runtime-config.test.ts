import assert from "node:assert/strict";
import { test } from "node:test";

import { createTelegramRuntimeConfig } from "../../packages/integrations/src/index.ts";

test("createTelegramRuntimeConfig applies polling defaults for live mode", () => {
  const config = createTelegramRuntimeConfig();

  assert.deepEqual(config, {
    enabled: true,
    delivery: {
      mode: "polling",
      pollingIntervalMs: 2000
    },
    publicBaseUrl: undefined,
    webhookSecretToken: undefined
  });
});

test("createTelegramRuntimeConfig keeps webhook-specific settings", () => {
  const config = createTelegramRuntimeConfig({
    enabled: true,
    delivery: {
      mode: "webhook",
      webhookPath: "/telegram/live"
    },
    publicBaseUrl: "https://walkie-talkie.local",
    webhookSecretToken: "secret"
  });

  assert.deepEqual(config, {
    enabled: true,
    delivery: {
      mode: "webhook",
      webhookPath: "/telegram/live"
    },
    publicBaseUrl: "https://walkie-talkie.local",
    webhookSecretToken: "secret"
  });
});
