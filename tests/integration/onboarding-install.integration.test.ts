import assert from "node:assert/strict";
import { test } from "node:test";

import { executeInstallCommand } from "../../apps/cli/src/commands/install.ts";

test("executeInstallCommand succeeds when bootstrap and onboarding are skipped", async () => {
  const logs: string[] = [];
  const originalLog = console.log;
  const originalSkipBootstrap = process.env.WALKIE_SKIP_BOOTSTRAP;
  const originalSkipOnboarding = process.env.WALKIE_SKIP_ONBOARDING;

  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  process.env.WALKIE_SKIP_BOOTSTRAP = "1";
  process.env.WALKIE_SKIP_ONBOARDING = "1";

  try {
    const result = await executeInstallCommand();
    assert.equal(result.exitCode, 0);
    assert.ok(logs.some((line) => line.includes("Dependency check results:")));
    assert.ok(logs.some((line) => line.includes("Onboarding skipped via WALKIE_SKIP_ONBOARDING=1.")));
    assert.ok(logs.some((line) => line.includes("Next step: run `walkie-talkie onboard`")));
  } finally {
    console.log = originalLog;
    if (originalSkipBootstrap === undefined) {
      delete process.env.WALKIE_SKIP_BOOTSTRAP;
    } else {
      process.env.WALKIE_SKIP_BOOTSTRAP = originalSkipBootstrap;
    }
    if (originalSkipOnboarding === undefined) {
      delete process.env.WALKIE_SKIP_ONBOARDING;
    } else {
      process.env.WALKIE_SKIP_ONBOARDING = originalSkipOnboarding;
    }
  }
});
