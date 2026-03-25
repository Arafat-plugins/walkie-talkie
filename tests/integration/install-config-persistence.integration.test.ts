import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { chdir, cwd } from "node:process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { buildConfigFromOnboardingAnswers } from "../../apps/cli/src/commands/onboard.ts";
import { writeConfigFile } from "../../packages/config/src/index.ts";
import { bootstrapRuntime, buildRuntimeBootstrapSummary } from "../../packages/runtime/src/index.ts";

test("buildConfigFromOnboardingAnswers maps onboarding answers to persisted config shape", () => {
  const config = buildConfigFromOnboardingAnswers({
    projectName: "my-walkie-talkie-app",
    fullMachineAccess: true,
    providerModel: "gpt-4o-mini",
    aiAuthMode: "api-key",
    providerApiKey: "sk-test-123",
    connectCodexNow: false,
    runtimeEnvironment: "local",
    communicationChannel: "telegram",
    channelCredential: "123:telegram",
    telegramDeliveryMode: "polling",
    telegramPollingIntervalMs: "2000",
    telegramPublicBaseUrl: "",
    confirmExamplePipeline: true
  });

  assert.deepEqual(config, {
    version: "1",
    project: {
      name: "my-walkie-talkie-app",
      primaryTrigger: "telegram",
      preferredChannel: "telegram"
    },
    runtime: {
      environment: "local",
      logLevel: "info",
      access: {
        fullMachineAccess: true
      },
      telegram: {
        enabled: true,
        delivery: {
          mode: "polling",
          pollingIntervalMs: 2000
        }
      }
    },
    providers: {
      defaultAi: {
        apiKey: "sk-test-123",
        model: "gpt-4o-mini",
        authMode: "api-key"
      },
      telegram: {
        botToken: "123:telegram"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  });
});

test("persisted install config can be bootstrapped by runtime", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-install-config-"));
  const originalCwd = cwd();

  try {
    chdir(tempDir);
    await writeFile(join(tempDir, "package.json"), '{"name":"temp-install-test"}\n', "utf8");

    const config = buildConfigFromOnboardingAnswers({
      projectName: "my-walkie-talkie-app",
      fullMachineAccess: true,
      providerModel: "gpt-4o-mini",
      aiAuthMode: "api-key",
      providerApiKey: "sk-test-123",
      connectCodexNow: false,
      runtimeEnvironment: "local",
      communicationChannel: "telegram",
      channelCredential: "123:telegram",
      telegramDeliveryMode: "polling",
      telegramPollingIntervalMs: "2000",
      telegramPublicBaseUrl: "",
      confirmExamplePipeline: true
    });

    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), config);

    const rawConfig = await readFile(join(tempDir, "walkie-talkie.config.json"), "utf8");
    assert.match(rawConfig, /"project"/);
    assert.match(rawConfig, /"sk-test-123"/);

    const runtimeResult = await bootstrapRuntime(tempDir);
    assert.equal(runtimeResult.ok, true);
    if (!runtimeResult.ok) {
      return;
    }

    const lines = buildRuntimeBootstrapSummary(runtimeResult);
    assert.ok(lines.some((line) => line.includes("Runtime readiness: ready")));
    assert.ok(lines.some((line) => line.includes("- project: my-walkie-talkie-app")));
  } finally {
    chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});
