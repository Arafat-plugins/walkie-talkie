import assert from "node:assert/strict";
import { test } from "node:test";

import { SkillRegistryStore, createSystemToolCheckSkill } from "../../packages/skills/src/index.ts";

test("system tool check skill can be registered and executed through the registry", async () => {
  const registry = new SkillRegistryStore();
  const skill = createSystemToolCheckSkill();

  registry.seed(skill);

  const handler = registry.load(skill.id);
  assert.ok(handler);

  const result = await handler({
    agentId: "ops-agent",
    triggerKind: "telegram",
    runId: "run-system-check-1",
    input: {
      tool: "node"
    }
  });

  assert.equal(result.ok, true);
  assert.equal(
    (result.output as { checkedBy?: string; installed?: boolean }).checkedBy,
    "system-tool-check-skill"
  );
  assert.equal((result.output as { installed?: boolean }).installed, true);
});
