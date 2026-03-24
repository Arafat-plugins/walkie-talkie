import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildSecretPresenceSummary,
  isSecretConfigPath,
  maskSecretValue,
  redactConfigSecrets,
  type WalkieTalkieConfig
} from "../../packages/config/src/index.ts";

function createValidConfig(): WalkieTalkieConfig {
  return {
    version: "1" as const,
    project: {
      name: "demo-app",
      primaryTrigger: "telegram" as const
    },
    runtime: {
      environment: "local" as const,
      logLevel: "info" as const
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

test("isSecretConfigPath returns true only for registered secret fields", () => {
  assert.equal(isSecretConfigPath("providers.defaultAi.apiKey"), true);
  assert.equal(isSecretConfigPath("providers.telegram.botToken"), true);
  assert.equal(isSecretConfigPath("project.name"), false);
});

test("maskSecretValue hides secret body while keeping stable display output", () => {
  assert.equal(maskSecretValue("sk-demo-secret"), "**********cret");
  assert.equal(maskSecretValue("abc"), "***");
  assert.equal(maskSecretValue(""), "[not-set]");
});

test("redactConfigSecrets returns masked secret fields without mutating original config", () => {
  const config = createValidConfig();
  const redacted = redactConfigSecrets(config);

  assert.equal(redacted.providers.defaultAi.apiKey, "**********cret");
  assert.equal(redacted.providers.telegram?.botToken, "******************cret");
  assert.equal(config.providers.defaultAi.apiKey, "sk-demo-secret");
});

test("buildSecretPresenceSummary reports whether known secret fields are set", () => {
  const config = createValidConfig();
  const summary = buildSecretPresenceSummary(config);

  assert.deepEqual(summary, {
    "providers.defaultAi.apiKey": true,
    "providers.telegram.botToken": true
  });
});

test("buildSecretPresenceSummary reports false when optional secret is absent", () => {
  const config = createValidConfig();
  delete config.providers.telegram;

  const summary = buildSecretPresenceSummary(config);

  assert.deepEqual(summary, {
    "providers.defaultAi.apiKey": true,
    "providers.telegram.botToken": false
  });
});
