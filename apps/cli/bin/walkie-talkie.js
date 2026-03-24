#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const currentFile = fileURLToPath(import.meta.url);
const cliRoot = resolve(dirname(currentFile), "..");
const workspaceRoot = resolve(cliRoot, "../..");
const distEntry = resolve(cliRoot, "dist/apps/cli/src/index.js");

function runCommand(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    stdio: "inherit"
  });
}

function ensureBuild() {
  const build = runCommand("npm", ["run", "cli:build"], workspaceRoot);
  return build.status ?? 1;
}

function runDistCli(args) {
  const run = runCommand("node", [distEntry, ...args], workspaceRoot);
  return run.status ?? 1;
}

if (!existsSync(distEntry)) {
  process.exitCode = ensureBuild();
} else {
  const buildStatus = ensureBuild();
  if (buildStatus !== 0) {
    process.exitCode = buildStatus;
  } else {
    process.exitCode = runDistCli(process.argv.slice(2));
  }
}

