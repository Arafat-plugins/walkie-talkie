import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildTerminalExecutionSummary,
  createTerminalExecutionPolicy,
  evaluateTerminalExecutionRequest,
  executeLocalTerminalCommand
} from "../../packages/core/src/index.ts";

test("evaluateTerminalExecutionRequest blocks disallowed commands and paths", () => {
  const policy = createTerminalExecutionPolicy({
    allowedCommands: ["node", "pwd"],
    allowedWorkingDirectories: [process.cwd()]
  });

  const blockedCommand = evaluateTerminalExecutionRequest(
    {
      command: "rm",
      args: ["-rf", "/tmp/demo"]
    },
    policy
  );
  const blockedDirectory = evaluateTerminalExecutionRequest(
    {
      command: "node",
      cwd: "/tmp/not-allowed"
    },
    policy
  );

  assert.equal(blockedCommand.allowed, false);
  assert.match(blockedCommand.reasons.join(" "), /blocked/);
  assert.equal(blockedDirectory.allowed, false);
  assert.match(blockedDirectory.reasons.join(" "), /Working directory/);
});

test("executeLocalTerminalCommand runs allowed commands without shell access", async () => {
  const policy = createTerminalExecutionPolicy({
    allowedCommands: ["node"],
    allowedWorkingDirectories: [process.cwd()]
  });

  const result = await executeLocalTerminalCommand(
    {
      command: "node",
      args: ["-e", "console.log('walkie-terminal-ok')"],
      cwd: process.cwd()
    },
    policy
  );

  assert.equal(result.ok, true);
  assert.equal(result.blocked, false);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, "");
  assert.equal(typeof result.stdout, "string");
});

test("executeLocalTerminalCommand returns blocked result without spawning command", async () => {
  const policy = createTerminalExecutionPolicy({
    allowedCommands: ["node"]
  });

  const result = await executeLocalTerminalCommand(
    {
      command: "sudo",
      args: ["ls"]
    },
    policy
  );

  assert.equal(result.ok, false);
  assert.equal(result.blocked, true);
  assert.equal(result.exitCode, null);
  assert.match(result.error ?? "", /blocked/);
});

test("buildTerminalExecutionSummary returns readable lines", () => {
  const lines = buildTerminalExecutionSummary({
    ok: true,
    blocked: false,
    command: "node",
    args: ["-v"],
    cwd: process.cwd(),
    exitCode: 0,
    stdout: "v24",
    stderr: "",
    runtimeMs: 10,
    timedOut: false
  });

  assert.deepEqual(lines, [
    "Terminal command: node -v",
    "Allowed: yes",
    "Succeeded: yes",
    "Timed out: no",
    "Exit code: 0"
  ]);
});
