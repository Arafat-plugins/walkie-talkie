import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveCommand, runCli } from "../../apps/cli/src/index.ts";

test("runCli returns 1 for unsupported commands", async () => {
  const exitCode = await runCli(["node", "walkie-talkie", "unknown"]);
  assert.equal(exitCode, 1);
});

test("runCli install command prints dependency check header", async () => {
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

test("resolveCommand supports onboard command", () => {
  assert.equal(resolveCommand(["node", "walkie-talkie", "onboard"]), "onboard");
});
