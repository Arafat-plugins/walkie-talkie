import assert from "node:assert/strict";
import { test } from "node:test";

import type { WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { SkillRegistryStore, rebindBuiltinSkills } from "../../packages/skills/src/index.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-builtin-rebind",
      primaryTrigger: "telegram"
    },
    runtime: {
      environment: "server",
      telegram: {
        enabled: true,
        delivery: {
          mode: "polling",
          pollingIntervalMs: 2000
        }
      }
    },
    providers: {
      defaultAi: {
        apiKey: "sk-demo",
        model: "gpt-4o-mini"
      },
      telegram: {
        botToken: "telegram-demo-token"
      }
    },
    bootstrap: {
      createExamplePipeline: true
    }
  };
}

test("rebindBuiltinSkills restores runnable handlers for persisted built-in skills", async () => {
  const registry = new SkillRegistryStore();
  registry.seed({
    version: "1",
    id: "telegram-machine-assistant-skill",
    name: "Telegram Machine Assistant",
    status: "active",
    executionMode: "async",
    parameters: [],
    tags: ["builtin"],
    handler: async () => ({
      ok: false,
      error: "placeholder"
    })
  });

  const rebound = rebindBuiltinSkills({
    skillRegistry: registry,
    config: createConfig(),
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "হ্যাঁ, node তোমার machine-এ installed আছে।"
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
  });

  assert.equal(rebound, 1);
  const result = await registry.get("telegram-machine-assistant-skill")?.handler({
    input: {
      text: "node ache?"
    }
  });

  assert.equal(result?.ok, true);
  assert.equal(
    (result?.output as { replyText?: string }).replyText,
    "হ্যাঁ, node তোমার machine-এ installed আছে।"
  );
});
