import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { writeConfigFile, type WalkieTalkieConfig } from "../../packages/config/src/index.ts";
import { bootstrapPersistentRuntime } from "../../packages/runtime/src/index.ts";
import { rebindBuiltinSkills } from "../../packages/skills/src/index.ts";
import { executeTelegramSeedLocalMachineCommand } from "../../apps/cli/src/commands/telegram-seed-local-machine.ts";

function createConfig(): WalkieTalkieConfig {
  return {
    version: "1",
    project: {
      name: "walkie-seed-demo",
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
      },
      flowBindings: [
        {
          triggerKind: "telegram",
          eventName: "telegram.message.received",
          pipelineId: "telegram-local-machine-pipeline"
        }
      ]
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

test("telegram seed local machine command persists Telegram-ready agent, skill, and pipeline", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "walkie-telegram-seed-"));

  try {
    await writeConfigFile(join(tempDir, "walkie-talkie.config.json"), createConfig());

    const result = await executeTelegramSeedLocalMachineCommand({
      baseDirectory: tempDir,
      now: () => "2026-03-25T12:00:00.000Z",
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

    assert.equal(result.exitCode, 0);

    const restored = await bootstrapPersistentRuntime(tempDir);
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }

    assert.equal(restored.state.agentRegistry.contains("telegram-local-machine-agent"), true);
    assert.equal(restored.state.skillRegistry.contains("telegram-machine-assistant-skill"), true);
    assert.equal(
      restored.state.pipelines.some((pipeline) => pipeline.id === "telegram-local-machine-pipeline"),
      true
    );

    rebindBuiltinSkills({
      skillRegistry: restored.state.skillRegistry,
      config: restored.state.config,
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

    const skillResult = await restored.state.skillRegistry.get("telegram-machine-assistant-skill")?.handler({
      input: {
        text: "node ache?"
      }
    });
    assert.equal(skillResult?.ok, true);
    assert.equal(
      (skillResult?.output as { replyText?: string }).replyText,
      "হ্যাঁ, node তোমার machine-এ installed আছে।"
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
