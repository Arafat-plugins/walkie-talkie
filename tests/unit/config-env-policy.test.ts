import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildEnvLoadingPolicySummary,
  buildEnvTemplateLines,
  buildSecretValueResolutionSummary,
  createEnvSecretReference,
  resolveConfigSecretsFromEnv,
  type WalkieTalkieConfig
} from "../../packages/config/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "demo-app",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "local",
      logLevel: "info"
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo-secret"
      },
      telegram: {
        botToken: "123456:telegram-secret"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("resolveConfigSecretsFromEnv applies standard env overrides without mutating original config", () => {
  const config = createConfig();
  const resolved = resolveConfigSecretsFromEnv(config, {
    WALKIE_DEFAULT_AI_API_KEY: "sk-env-override",
    WALKIE_TELEGRAM_BOT_TOKEN: "tg-env-override"
  });

  assert.equal(resolved.providers.defaultAi.apiKey, "sk-env-override");
  assert.equal(resolved.providers.telegram?.botToken, "tg-env-override");
  assert.equal(config.providers.defaultAi.apiKey, "sk-demo-secret");
  assert.equal(config.providers.telegram?.botToken, "123456:telegram-secret");
});

test("resolveConfigSecretsFromEnv resolves explicit env references", () => {
  const config = createConfig();
  config.providers.defaultAi.apiKey = createEnvSecretReference("OPENAI_API_KEY");
  config.providers.telegram!.botToken = createEnvSecretReference("TELEGRAM_BOT_TOKEN");

  const resolved = resolveConfigSecretsFromEnv(config, {
    OPENAI_API_KEY: "sk-explicit-ref",
    TELEGRAM_BOT_TOKEN: "tg-explicit-ref"
  });

  assert.equal(resolved.providers.defaultAi.apiKey, "sk-explicit-ref");
  assert.equal(resolved.providers.telegram?.botToken, "tg-explicit-ref");
});

test("buildSecretValueResolutionSummary explains whether each secret comes from config or env", () => {
  const config = createConfig();
  config.providers.defaultAi.apiKey = createEnvSecretReference("OPENAI_API_KEY");

  const summary = buildSecretValueResolutionSummary(config, {
    OPENAI_API_KEY: "sk-explicit-ref",
    WALKIE_TELEGRAM_BOT_TOKEN: "tg-env-override"
  });

  assert.deepEqual(summary, [
    {
      path: "providers.defaultAi.apiKey",
      envName: "WALKIE_DEFAULT_AI_API_KEY",
      source: "env-reference",
      resolved: true
    },
    {
      path: "providers.telegram.botToken",
      envName: "WALKIE_TELEGRAM_BOT_TOKEN",
      source: "env-binding",
      resolved: true
    }
  ]);
});

test("buildEnvTemplateLines and buildEnvLoadingPolicySummary expose tracked env boundaries", () => {
  assert.deepEqual(buildEnvTemplateLines(), [
    "# Walkie-Talkie secret env template",
    "WALKIE_DEFAULT_AI_API_KEY=",
    "WALKIE_TELEGRAM_BOT_TOKEN="
  ]);

  assert.deepEqual(buildEnvLoadingPolicySummary(), [
    "Env loading policy: env overrides known secret fields, while config stays authoritative for non-secret fields.",
    "- # Walkie-Talkie secret env template",
    "- WALKIE_DEFAULT_AI_API_KEY=",
    "- WALKIE_TELEGRAM_BOT_TOKEN="
  ]);
});
