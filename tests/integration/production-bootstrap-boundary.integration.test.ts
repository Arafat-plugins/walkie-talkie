import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

import { runProductionBootstrapBoundary } from "../../scripts/install/production-bootstrap.ts";

test("production bootstrap boundary script and package commands are wired", () => {
  const projectRoot = resolve(process.cwd());
  const packageJsonPath = resolve(projectRoot, "package.json");
  const scriptPath = resolve(projectRoot, "scripts/install/production-bootstrap.ts");

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(existsSync(scriptPath), true);
  assert.equal(
    packageJson.scripts?.["install:production:plan"],
    "node --experimental-strip-types scripts/install/production-bootstrap.ts"
  );
  assert.equal(
    packageJson.scripts?.["install:production:check"],
    "node --experimental-strip-types scripts/install/production-bootstrap.ts --check"
  );
});

test("production bootstrap boundary script prints boundary guidance in check mode", () => {
  const output = runProductionBootstrapBoundary(["--check"]).lines.join("\n");

  assert.match(output, /Production bootstrap plan version: 1/);
  assert.match(output, /Local entry: npm run install:local/);
  assert.match(output, /Hosted one-line install remains planned under milestone M21/);
  assert.match(output, /Check mode: boundary is present and ready for future hosted installer wiring\./);
});
