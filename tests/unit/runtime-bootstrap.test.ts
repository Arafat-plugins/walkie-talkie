import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { writeConfigFile } from "../../packages/config/src/index.ts";
import {
  bootstrapRuntime,
  buildRuntimeBootstrapSummary,
  verifyRuntimeReadiness
} from "../../packages/runtime/src/index.ts";

function createValidConfig() {
  return {
    version: "1" as const,
    project: {
      name: "demo-app",
      primaryTrigger: "cli" as const
    },
    runtime: {
      environment: "local" as const,
      logLevel: "info" as const
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

test("verifyRuntimeReadiness returns ready for CLI-trigger config", () => {
  const result = verifyRuntimeReadiness(createValidConfig());

  assert.equal(result.ready, true);
  assert.deepEqual(result.issues, []);
});

test("verifyRuntimeReadiness allows codex auth mode without direct api key", () => {
  const result = verifyRuntimeReadiness({
    ...createValidConfig(),
    providers: {
      defaultAi: {
        authMode: "codex",
        model: "gpt-5"
      }
    }
  });

  assert.equal(result.ready, true);
  assert.deepEqual(result.issues, []);
});

test("verifyRuntimeReadiness requires telegram botToken for telegram trigger", () => {
  const result = verifyRuntimeReadiness({
    ...createValidConfig(),
    project: {
      name: "demo-app",
      primaryTrigger: "telegram"
    }
  });

  assert.equal(result.ready, false);
  if (result.ready) {
    return;
  }

  assert.equal(result.issues[0]?.path, "providers.telegram.botToken");
});

test("verifyRuntimeReadiness requires telegram publicBaseUrl for webhook delivery mode", () => {
  const result = verifyRuntimeReadiness({
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
    },
    bootstrap: {
      createExamplePipeline: true
    }
  });

  assert.equal(result.ready, false);
  if (result.ready) {
    return;
  }

  assert.deepEqual(result.issues.map((issue) => issue.path), ["runtime.telegram.publicBaseUrl"]);
});

test("bootstrapRuntime returns config when config file is valid", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createValidConfig());

    const result = await bootstrapRuntime(tempDir);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.config.project.name, "demo-app");
    assert.equal(result.configPath, join(tempDir, "walkie-talkie.config.json"));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("buildRuntimeBootstrapSummary returns ready lines for successful bootstrap", () => {
  const lines = buildRuntimeBootstrapSummary({
    ok: true,
    configPath: "/tmp/walkie-talkie.config.json",
    config: createValidConfig()
  });

  assert.deepEqual(lines, [
    "Runtime bootstrap config path: /tmp/walkie-talkie.config.json",
    "Runtime readiness: ready",
    "- project: demo-app",
    "- trigger: cli",
    "- environment: local"
  ]);
});

test("bootstrapRuntime returns issues when config file cannot be loaded", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-"));

  try {
    const result = await bootstrapRuntime(tempDir);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }

    assert.equal(result.configPath, join(tempDir, "walkie-talkie.config.json"));
    assert.equal(result.issues[0]?.path, "$file");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("buildRuntimeBootstrapSummary returns blocked lines for failed bootstrap", () => {
  const lines = buildRuntimeBootstrapSummary({
    ok: false,
    configPath: "/tmp/walkie-talkie.config.json",
    issues: [
      {
        path: "providers.telegram.botToken",
        message: 'Runtime requires Telegram botToken when primaryTrigger is "telegram".'
      }
    ]
  });

  assert.deepEqual(lines, [
    "Runtime bootstrap config path: /tmp/walkie-talkie.config.json",
    "Runtime readiness: blocked",
    '- providers.telegram.botToken: Runtime requires Telegram botToken when primaryTrigger is "telegram".'
  ]);
});

test("bootstrapRuntime returns readiness issue when trigger-specific secret is missing", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), {
      ...createValidConfig(),
      project: {
        name: "demo-app",
        primaryTrigger: "telegram"
      }
    });

    const result = await bootstrapRuntime(tempDir);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }

    assert.equal(result.issues[0]?.path, "providers.telegram.botToken");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("bootstrapRuntime resolves env-backed secrets before readiness checks", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), {
      ...createValidConfig(),
      providers: {
        defaultAi: {
          apiKey: "env:WALKIE_DEFAULT_AI_API_KEY"
        }
      }
    });

    const result = await bootstrapRuntime(tempDir, undefined, {
      WALKIE_DEFAULT_AI_API_KEY: "sk-env-runtime"
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.config.providers.defaultAi.apiKey, "sk-env-runtime");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
