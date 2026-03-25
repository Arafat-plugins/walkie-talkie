#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDirectory = dirname(currentFile);
const projectRoot = resolve(scriptsDirectory, "..");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, ...options.env }
  });

  return result.status ?? 1;
}

function main() {
  console.log(`Walkie-Talkie local install root: ${projectRoot}`);

  let exitCode = run("npm", ["install"]);
  if (exitCode !== 0) {
    process.exitCode = exitCode;
    return;
  }

  exitCode = run("npm", ["run", "cli:link"]);
  if (exitCode !== 0) {
    process.exitCode = exitCode;
    return;
  }

  exitCode = run(
    "node",
    ["--experimental-strip-types", "apps/cli/src/index.ts", "install"],
    {
      env: {
        WALKIE_SKIP_BOOTSTRAP: "1"
      }
    }
  );

  process.exitCode = exitCode;
}

main();
