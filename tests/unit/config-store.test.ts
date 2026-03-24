import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import {
  loadConfigFile,
  resolveConfigPath,
  serializeConfig,
  writeConfigFile
} from "../../packages/config/src/index.ts";

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

test("serializeConfig returns deterministic json output", () => {
  const serialized = serializeConfig(createValidConfig());

  assert.match(serialized, /"version": "1"/);
  assert.match(serialized, /"project"/);
  assert.ok(serialized.endsWith("\n"));
});

test("writeConfigFile persists config and loadConfigFile returns validated result", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-config-store-"));
  const configPath = resolveConfigPath(tempDir);

  try {
    await writeConfigFile(configPath, createValidConfig());
    const onDisk = await readFile(configPath, "utf8");
    assert.match(onDisk, /"project"/);

    const loaded = await loadConfigFile(configPath);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) {
      return;
    }

    assert.equal(loaded.config.project.name, "demo-app");
    assert.equal(loaded.path, configPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("loadConfigFile returns issues for invalid config content", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-config-store-"));
  const configPath = join(tempDir, "broken.config.json");

  try {
    await writeConfigFile(
      configPath,
      {
        ...createValidConfig(),
        version: "2"
      } as never
    );

    const loaded = await loadConfigFile(configPath);
    assert.equal(loaded.ok, false);
    if (loaded.ok) {
      return;
    }

    assert.equal(loaded.issues[0]?.path, "version");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("loadConfigFile returns parse issue for malformed json file", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-config-store-"));
  const configPath = join(tempDir, "malformed.config.json");

  try {
    await writeFile(configPath, "{ invalid json", "utf8");

    const loaded = await loadConfigFile(configPath);
    assert.equal(loaded.ok, false);
    if (loaded.ok) {
      return;
    }

    assert.equal(loaded.issues[0]?.path, "$");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("loadConfigFile returns file-level issue when file is missing", async () => {
  const missingPath = join(tmpdir(), "walkie-talkie-config-store-missing.json");
  const loaded = await loadConfigFile(missingPath);

  assert.equal(loaded.ok, false);
  if (loaded.ok) {
    return;
  }

  assert.equal(loaded.issues[0]?.path, "$file");
});
