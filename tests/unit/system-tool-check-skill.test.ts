import assert from "node:assert/strict";
import { test } from "node:test";

import {
  SYSTEM_TOOL_CHECK_SKILL_ID,
  createSystemToolCheckSkill,
  findSystemToolExecutablePath
} from "../../packages/skills/src/index.ts";

test("findSystemToolExecutablePath returns a path for node", () => {
  const result = findSystemToolExecutablePath("node");

  assert.equal(typeof result, "string");
  assert.ok((result?.length ?? 0) > 0);
});

test("findSystemToolExecutablePath returns undefined for a missing tool", () => {
  const result = findSystemToolExecutablePath("walkie-tool-definitely-missing-12345");

  assert.equal(result, undefined);
});

test("createSystemToolCheckSkill validates required input", async () => {
  const skill = createSystemToolCheckSkill();
  const result = await skill.handler({
    input: {}
  });

  assert.equal(skill.id, SYSTEM_TOOL_CHECK_SKILL_ID);
  assert.deepEqual(result, {
    ok: false,
    error: "System Tool Check requires input.tool as a non-empty string."
  });
});

test("createSystemToolCheckSkill reports installed tools", async () => {
  const skill = createSystemToolCheckSkill();
  const result = await skill.handler({
    runId: "run-1",
    input: {
      tool: "node"
    }
  });

  assert.equal(result.ok, true);
  assert.equal(typeof result.output, "object");

  const output = result.output as {
    tool?: string;
    installed?: boolean;
    executablePath?: string;
    checkedBy?: string;
    platform?: NodeJS.Platform;
  };

  assert.equal(output.tool, "node");
  assert.equal(output.installed, true);
  assert.equal(output.checkedBy, SYSTEM_TOOL_CHECK_SKILL_ID);
  assert.equal(output.platform, process.platform);
  assert.equal(typeof output.executablePath, "string");
});
