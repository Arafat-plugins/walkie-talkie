import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

import {
  parseAndValidateConfig,
  validateConfig
} from "../../packages/config/src/index.ts";

function createValidConfig() {
  return {
    version: "1",
    project: {
      name: "demo-app",
      primaryTrigger: "cli"
    },
    runtime: {
      environment: "local",
      logLevel: "info",
      telegram: {
        enabled: true,
        delivery: {
          mode: "polling",
          pollingIntervalMs: 2000
        }
      },
      flowBindings: [
        {
          triggerKind: "cli",
          eventName: "cli.command.received",
          pipelineId: "demo-pipeline"
        }
      ]
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("validateConfig accepts a valid config object", () => {
  const result = validateConfig(createValidConfig());

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("validateConfig reports missing required sections and fields", () => {
  const result = validateConfig({
    version: "1",
    project: {
      name: "",
      primaryTrigger: "cli"
    }
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(
    result.issues.map((issue) => issue.path),
    ["project.name", "runtime", "providers", "bootstrap"]
  );
});

test("validateConfig reports enum violations for trigger and environment", () => {
  const result = validateConfig({
    ...createValidConfig(),
    project: {
      name: "demo-app",
      primaryTrigger: "webhook"
    },
    runtime: {
      environment: "cloud",
      logLevel: "verbose"
    }
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(
    result.issues.map((issue) => issue.path),
    ["project.primaryTrigger", "runtime.environment", "runtime.logLevel"]
  );
});

test("validateConfig reports invalid flow binding fields", () => {
  const result = validateConfig({
    ...createValidConfig(),
    runtime: {
      environment: "local",
      flowBindings: [
        {
          triggerKind: "smtp",
          eventName: "",
          pipelineId: ""
        }
      ]
    }
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(
    result.issues.map((issue) => issue.path),
    [
      "runtime.flowBindings[0].triggerKind",
      "runtime.flowBindings[0].eventName",
      "runtime.flowBindings[0].pipelineId"
    ]
  );
});

test("validateConfig accepts telegram runtime settings for polling mode", () => {
  const result = validateConfig({
    ...createValidConfig(),
    project: {
      name: "demo-app",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "server",
      telegram: {
        enabled: true,
        delivery: {
          mode: "polling",
          pollingIntervalMs: 5000
        }
      }
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo"
      },
      telegram: {
        botToken: "tg-demo"
      }
    }
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("validateConfig reports invalid telegram runtime settings", () => {
  const result = validateConfig({
    ...createValidConfig(),
    runtime: {
      environment: "server",
      telegram: {
        enabled: "yes",
        delivery: {
          mode: "socket",
          webhookPath: "",
          pollingIntervalMs: 0
        },
        publicBaseUrl: "",
        webhookSecretToken: ""
      }
    }
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(
    result.issues.map((issue) => issue.path),
    [
      "runtime.telegram.enabled",
      "runtime.telegram.delivery.mode",
      "runtime.telegram.delivery.webhookPath",
      "runtime.telegram.delivery.pollingIntervalMs",
      "runtime.telegram.publicBaseUrl",
      "runtime.telegram.webhookSecretToken"
    ]
  );
});

test("validateConfig requires telegram publicBaseUrl when webhook mode is used", () => {
  const result = validateConfig({
    ...createValidConfig(),
    project: {
      name: "demo-app",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "server",
      telegram: {
        delivery: {
          mode: "webhook",
          webhookPath: "/telegram/live"
        }
      }
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo"
      },
      telegram: {
        botToken: "tg-demo"
      }
    }
  });

  assert.equal(result.valid, false);
  if (result.valid) {
    return;
  }

  assert.deepEqual(result.issues.map((issue) => issue.path), ["runtime.telegram.publicBaseUrl"]);
});

test("parseAndValidateConfig returns issues for malformed json", () => {
  const result = parseAndValidateConfig("{ invalid json");

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.equal(result.issues[0]?.path, "$");
});

test("parseAndValidateConfig returns validated config for valid json input", () => {
  const result = parseAndValidateConfig(JSON.stringify(createValidConfig()));

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.config.project.name, "demo-app");
  assert.equal(result.config.providers.defaultAi.apiKey, "sk-demo");
});

test("config schema file remains valid json", () => {
  const schemaPath = resolve("config/schema/walkie-talkie.config.schema.json");
  const raw = readFileSync(schemaPath, "utf8");

  assert.doesNotThrow(() => JSON.parse(raw));
});
