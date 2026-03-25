import assert from "node:assert/strict";
import { test } from "node:test";

import { createTerminalExecutionPolicy } from "../../packages/core/src/index.ts";
import { createLocalTerminalSkill, SkillRegistryStore } from "../../packages/skills/src/index.ts";

test("local terminal skill executes allowed node command through the registry", async () => {
  const registry = new SkillRegistryStore();
  registry.seed(
    createLocalTerminalSkill({
      policy: createTerminalExecutionPolicy({
        allowedCommands: ["node"],
        allowedWorkingDirectories: [process.cwd()]
      })
    })
  );

  const handler = registry.load("local-terminal-skill");
  assert.ok(handler);

  const result = await handler({
    agentId: "ops-agent",
    triggerKind: "telegram",
    runId: "run-local-terminal-1",
    input: {
      command: "node",
      args: ["-e", "console.log('local-terminal-skill-ok')"],
      cwd: process.cwd()
    }
  });

  assert.equal(result.ok, true);
  assert.equal(
    (
      result.output as {
        checkedBy?: string;
        result?: { stdout?: string; ok?: boolean; exitCode?: number };
      }
    ).checkedBy,
    "local-terminal-skill"
  );
  assert.equal(
    (
      result.output as {
        result?: { stdout?: string; ok?: boolean; exitCode?: number };
      }
    ).result?.ok,
    true
  );
  assert.equal(
    (
      result.output as {
        result?: { stdout?: string; ok?: boolean; exitCode?: number };
      }
    ).result?.exitCode,
    0
  );
});

test("local terminal skill returns policy failure for blocked commands", async () => {
  const skill = createLocalTerminalSkill({
    policy: createTerminalExecutionPolicy({
      allowedCommands: ["node"]
    })
  });

  const result = await skill.handler({
    input: {
      command: "sudo",
      args: ["ls"]
    }
  });

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /blocked/);
});
