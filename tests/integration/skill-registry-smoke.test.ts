import assert from "node:assert/strict";
import { test } from "node:test";

import { SkillRegistryStore } from "../../packages/skills/src/index.ts";

test("skill registry smoke: register -> load -> execute returns expected output", async () => {
  const registry = new SkillRegistryStore();

  registry.register({
    id: "telegram-send",
    name: "Telegram Send",
    handler: async ({ input, agentId, runId }) => ({
      ok: true,
      output: {
        deliveredBy: "telegram-send",
        agentId,
        runId,
        message: input.message
      }
    }),
    parameters: [
      {
        name: "message",
        type: "string",
        required: true
      }
    ],
    tags: ["telegram", "smoke"]
  });

  const handler = registry.load("telegram-send");
  assert.ok(handler);

  const result = await handler?.({
    agentId: "daily-reminder-agent",
    triggerKind: "telegram",
    runId: "run-smoke-1",
    input: {
      message: "hello from smoke test"
    }
  });

  assert.deepEqual(result, {
    ok: true,
    output: {
      deliveredBy: "telegram-send",
      agentId: "daily-reminder-agent",
      runId: "run-smoke-1",
      message: "hello from smoke test"
    }
  });
});
