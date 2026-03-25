import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

import { runHostedInstallerContractCheck } from "../../scripts/install/hosted-installer-contract.ts";

test("hosted installer boundary script and package commands are wired", () => {
  const projectRoot = resolve(process.cwd());
  const packageJsonPath = resolve(projectRoot, "package.json");
  const scriptPath = resolve(projectRoot, "scripts/install/hosted-installer-contract.ts");

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(existsSync(scriptPath), true);
  assert.equal(
    packageJson.scripts?.["install:hosted:plan"],
    "node --experimental-strip-types scripts/install/hosted-installer-contract.ts"
  );
  assert.equal(
    packageJson.scripts?.["install:hosted:check"],
    "node --experimental-strip-types scripts/install/hosted-installer-contract.ts --check"
  );
});

test("hosted installer boundary script prints contract guidance in check mode", () => {
  const output = runHostedInstallerContractCheck(["--check"]).lines.join("\n");

  assert.match(output, /Hosted installer contract version: 1/);
  assert.match(output, /Repository: <github-owner>\/walkie-talkie/);
  assert.match(output, /Linux\/macOS install\.sh implementation remains planned under M21-S2/);
  assert.match(output, /Check mode: hosted installer assumptions and manifest shape are defined\./);
});
