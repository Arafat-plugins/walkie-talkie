import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

test("install-local script is wired through package.json", () => {
  const directProjectRoot = resolve(process.cwd());
  const projectRoot = existsSync(resolve(directProjectRoot, "package.json"))
    ? directProjectRoot
    : resolve(directProjectRoot, "walkie-talkie");
  const packageJsonPath = resolve(projectRoot, "package.json");
  const scriptPath = resolve(projectRoot, "scripts/install-local.mjs");

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(existsSync(scriptPath), true);
  assert.equal(packageJson.scripts?.["install:local"], "node scripts/install-local.mjs");
});

test("install-local script resolves project root and runs source install command", () => {
  const directProjectRoot = resolve(process.cwd());
  const projectRoot = existsSync(resolve(directProjectRoot, "scripts/install-local.mjs"))
    ? directProjectRoot
    : resolve(directProjectRoot, "walkie-talkie");
  const scriptPath = resolve(projectRoot, "scripts/install-local.mjs");
  const scriptContent = readFileSync(scriptPath, "utf8");

  assert.match(scriptContent, /Walkie-Talkie local install root:/);
  assert.match(scriptContent, /const projectRoot = resolve\(scriptsDirectory, "\.\."\)/);
  assert.match(scriptContent, /run\("npm", \["install"\]\)/);
  assert.match(scriptContent, /run\("npm", \["run", "cli:link"\]\)/);
  assert.match(scriptContent, /"--experimental-strip-types", "apps\/cli\/src\/index\.ts", "install"/);
  assert.match(scriptContent, /WALKIE_SKIP_BOOTSTRAP: "1"/);
});
