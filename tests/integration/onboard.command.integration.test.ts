import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { chdir, cwd } from "node:process";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import {
  executeOnboardFlowWithIo,
  type CommandResult
} from "../../apps/cli/src/commands/onboard.ts";
import { loadConfigFile } from "../../packages/config/src/index.ts";
import type { OnboardingPromptIO } from "../../packages/onboarding/src/index.ts";

test("executeOnboardFlowWithIo writes terminal onboarding config for telegram polling", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-onboard-"));
  const originalCwd = cwd();
  const logs: string[] = [];

  try {
    chdir(tempDir);
    await writeFile(join(tempDir, "package.json"), '{"name":"temp-onboard-test"}\n', "utf8");

    const responses = [
      "demo-app",
      "yes",
      "gpt-4o-mini",
      "api-key",
      "sk-live",
      "no",
      "local",
      "telegram",
      "123:telegram",
      "",
      "2500",
      "",
      "yes"
    ];
    let askCount = 0;

    const io: OnboardingPromptIO = {
      writeLine(line) {
        logs.push(line);
      },
      async ask() {
        const response = responses[askCount];
        askCount += 1;
        return response ?? "";
      }
    };

    const result: CommandResult = await executeOnboardFlowWithIo(io, tempDir);
    assert.equal(result.exitCode, 0);

    const configResult = await loadConfigFile(join(tempDir, "walkie-talkie.config.json"));
    assert.equal(configResult.ok, true);
    if (!configResult.ok) {
      return;
    }

    assert.equal(configResult.config.project.primaryTrigger, "telegram");
    assert.equal(configResult.config.project.preferredChannel, "telegram");
    assert.equal(configResult.config.runtime.telegram?.delivery?.mode, "polling");
    assert.equal(configResult.config.runtime.telegram?.delivery?.pollingIntervalMs, 2500);
    assert.equal(configResult.config.providers.telegram?.botToken, "123:telegram");
    assert.equal(configResult.config.providers.defaultAi.model, "gpt-4o-mini");
    assert.equal(configResult.config.runtime.access?.fullMachineAccess, true);
    assert.ok(logs.includes("Project name *"));
  } finally {
    chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
});
