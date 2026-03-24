import assert from "node:assert/strict";
import { test } from "node:test";

import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import {
  createTelegramBotApiClient,
  registerTelegramRuntimeWebhook
} from "../../packages/integrations/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-telegram-webhook-server",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "server",
      telegram: {
        enabled: true,
        delivery: {
          mode: "webhook",
          webhookPath: "/telegram/live"
        },
        publicBaseUrl: "https://walkie-talkie.example.com",
        webhookSecretToken: "telegram-secret"
      }
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo"
      },
      telegram: {
        botToken: "telegram-demo-token"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("registerTelegramRuntimeWebhook uses runtime config to register current server webhook", async () => {
  const calls: Array<{ method: string; payload: Record<string, unknown> }> = [];
  const client = createTelegramBotApiClient({
    config: {
      botToken: "telegram-demo-token"
    },
    transport: async ({ method, payload }) => {
      calls.push({ method, payload });
      return {
        ok: true,
        result: true
      };
    }
  });

  const registration = await registerTelegramRuntimeWebhook({
    config: createConfig(),
    client,
    allowedUpdates: ["message"],
    dropPendingUpdates: true
  });

  assert.deepEqual(registration, {
    url: "https://walkie-talkie.example.com/telegram/live",
    secretTokenEnabled: true,
    allowedUpdates: ["message"],
    dropPendingUpdates: true
  });
  assert.deepEqual(calls, [
    {
      method: "setWebhook",
      payload: {
        url: "https://walkie-talkie.example.com/telegram/live",
        secret_token: "telegram-secret",
        allowed_updates: ["message"],
        drop_pending_updates: true
      }
    }
  ]);
});

test("registerTelegramRuntimeWebhook skips non-webhook runtime config", async () => {
  let called = false;
  const client = createTelegramBotApiClient({
    config: {
      botToken: "telegram-demo-token"
    },
    transport: async () => {
      called = true;
      return {
        ok: true,
        result: true
      };
    }
  });

  const registration = await registerTelegramRuntimeWebhook({
    config: {
      ...createConfig(),
      runtime: {
        environment: "server",
        telegram: {
          enabled: true,
          delivery: {
            mode: "polling"
          }
        }
      }
    },
    client
  });

  assert.equal(registration, undefined);
  assert.equal(called, false);
});
