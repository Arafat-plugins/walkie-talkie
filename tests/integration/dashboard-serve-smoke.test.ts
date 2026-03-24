import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

test("dashboard serve smoke: local run command and entry wiring are present", () => {
  const projectRoot = resolve(process.cwd());
  const packageJsonPath = resolve(projectRoot, "package.json");
  const indexHtmlPath = resolve(projectRoot, "apps/dashboard/index.html");
  const serveScriptPath = resolve(projectRoot, "apps/dashboard/scripts/serve.mjs");

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };
  const indexHtml = readFileSync(indexHtmlPath, "utf8");

  assert.equal(
    packageJson.scripts?.["dashboard:serve"],
    "npm run dashboard:build && node apps/dashboard/scripts/serve.mjs"
  );
  assert.equal(
    packageJson.scripts?.["dashboard:serve:check"],
    "npm run dashboard:build && node apps/dashboard/scripts/serve.mjs --check"
  );
  assert.equal(existsSync(serveScriptPath), true);
  assert.match(indexHtml, /<script type="module" src="\.\/dist\/apps\/dashboard\/src\/main\.js"><\/script>/);
});
