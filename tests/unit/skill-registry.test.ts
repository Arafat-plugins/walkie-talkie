import assert from "node:assert/strict";
import { test } from "node:test";

import { SkillRegistryStore } from "../../packages/skills/src/index.ts";

function createSkillInput(id: string, name: string) {
  return {
    id,
    name,
    handler: async ({ input }: { input: Record<string, unknown> }) => ({
      ok: true,
      output: { id, echoedInput: input }
    }),
    parameters: [
      {
        name: "message",
        type: "string" as const,
        required: true
      }
    ],
    tags: ["demo"]
  };
}

test("SkillRegistryStore register/list/get/load work for in-memory skills", async () => {
  const registry = new SkillRegistryStore();

  const registered = registry.register(createSkillInput("telegram-send", "Telegram Send"));

  assert.equal(registered.id, "telegram-send");
  assert.equal(registry.list().length, 1);
  assert.equal(registry.get("telegram-send")?.name, "Telegram Send");

  const handler = registry.load("telegram-send");
  assert.ok(handler);
  const result = await handler?.({
    agentId: "agent-1",
    triggerKind: "telegram",
    runId: "run-1",
    input: { message: "hello" }
  });

  assert.deepEqual(result, {
    ok: true,
    output: {
      id: "telegram-send",
      echoedInput: { message: "hello" }
    }
  });
});

test("SkillRegistryStore blocks duplicate ids and returns cloned snapshots", () => {
  const registry = new SkillRegistryStore();

  registry.register(createSkillInput("email-draft", "Email Draft"));

  assert.throws(() => registry.register(createSkillInput("email-draft", "Email Draft Duplicate")), /already exists/);

  const listed = registry.list();
  listed[0].parameters[0].name = "mutated";
  listed[0].tags.push("changed");

  const freshRead = registry.get("email-draft");
  assert.equal(freshRead?.parameters[0]?.name, "message");
  assert.deepEqual(freshRead?.tags, ["demo"]);
});

test("SkillRegistryStore rejects invalid skill interfaces", () => {
  const registry = new SkillRegistryStore();

  assert.throws(
    () =>
      registry.register({
        id: "",
        name: "",
        handler: undefined as never
      }),
    /Skill id must be a non-empty string\./
  );
});
