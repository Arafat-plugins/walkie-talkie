import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

test("install.sh boundary script and package commands are wired", () => {
  const projectRoot = resolve(process.cwd());
  const packageJsonPath = resolve(projectRoot, "package.json");
  const scriptPath = resolve(projectRoot, "scripts/install.sh");

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(existsSync(scriptPath), true);
  assert.equal(
    packageJson.scripts?.["install:hosted:shell:plan"],
    "bash scripts/install.sh --print-plan"
  );
  assert.equal(
    packageJson.scripts?.["install:hosted:shell:check"],
    "bash scripts/install.sh --check"
  );
});

test("install.sh boundary script documents repo bootstrap and hosted fallback", () => {
  const projectRoot = resolve(process.cwd());
  const scriptPath = resolve(projectRoot, "scripts/install.sh");
  const scriptContent = readFileSync(scriptPath, "utf8");

  assert.match(scriptContent, /Walkie-Talkie install\.sh boundary/);
  assert.match(scriptContent, /Running npm install/);
  assert.match(scriptContent, /Running local install flow/);
  assert.match(scriptContent, /Hosted download\/bootstrap is not wired yet in this step\./);
  assert.match(scriptContent, /--check/);
  assert.match(scriptContent, /--print-plan/);
});
