import { test } from "node:test";
import assert from "node:assert/strict";

import { runCli } from "../../apps/cli/src/index.ts";

test("walkie-talkie install returns exit code 0 with ready dependencies", async () => {
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
    const exitCode = await runCli(["node", "walkie-talkie", "install"]);
    assert.equal(exitCode, 0);
    assert.equal(logs[0], "Dependency check results:");
    assert.ok(logs.some((line) => line.includes("[info] node is ready")));
    assert.ok(logs.some((line) => line.includes("[info] npm is ready")));
    assert.ok(logs.some((line) => line.includes("Dependency bootstrap skipped via WALKIE_SKIP_BOOTSTRAP=1.")));
    assert.ok(logs.some((line) => line.includes("Onboarding skipped via WALKIE_SKIP_ONBOARDING=1.")));
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
