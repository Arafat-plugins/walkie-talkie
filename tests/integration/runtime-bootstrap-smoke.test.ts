import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { writeConfigFile } from "../../packages/config/src/index.ts";
import { bootstrapRuntime, buildRuntimeBootstrapSummary } from "../../packages/runtime/src/index.ts";

function createValidConfig() {
  return {
    version: "1" as const,
    project: {
      name: "smoke-demo",
      primaryTrigger: "cli" as const
    },
    runtime: {
      environment: "local" as const,
      logLevel: "info" as const
    },
    providers: {
      defaultAi: {
        apiKey: "sk-smoke"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("runtime bootstrap smoke: valid config returns ready summary", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-smoke-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createValidConfig());

    const result = await bootstrapRuntime(tempDir);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    const lines = buildRuntimeBootstrapSummary(result);
    assert.deepEqual(lines, [
      `Runtime bootstrap config path: ${join(tempDir, "walkie-talkie.config.json")}`,
      "Runtime readiness: ready",
      "- project: smoke-demo",
      "- trigger: cli",
      "- environment: local"
    ]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("runtime bootstrap smoke: missing config returns blocked summary", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-smoke-"));

  try {
    const result = await bootstrapRuntime(tempDir);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }

    const lines = buildRuntimeBootstrapSummary(result);
    assert.equal(lines[0], `Runtime bootstrap config path: ${join(tempDir, "walkie-talkie.config.json")}`);
    assert.equal(lines[1], "Runtime readiness: blocked");
    assert.match(lines[2] ?? "", /^\- \$file:/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
