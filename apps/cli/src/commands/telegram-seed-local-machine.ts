import {
  bootstrapPersistentRuntime,
  buildPersistentRuntimeBootstrapSummary,
  createPersistentEntitySnapshot,
  createPersistentRuntimeSnapshot
} from "../../../../packages/runtime/src/index.ts";
import { createRuntimeDefaultAiProvider } from "../../../../packages/runtime/src/provider-wiring.ts";
import { resolveConfigPath, writeConfigFile } from "../../../../packages/config/src/index.ts";
import { createAuditEvent } from "../../../../packages/logging/src/index.ts";
import { createAgentDefinition } from "../../../../packages/agents/src/index.ts";
import { createPipelineDefinition } from "../../../../packages/pipeline/src/index.ts";
import {
  createTelegramMachineAssistantSkill,
  TELEGRAM_MACHINE_ASSISTANT_SKILL_ID
} from "../../../../packages/skills/src/index.ts";
import {
  resolveEntityStoragePath,
  resolveRuntimeStoragePath,
  writeEntityStorageFile,
  writeRuntimeStorageFile
} from "../../../../packages/shared/src/index.ts";

type CommandResult = {
  exitCode: number;
};

const TELEGRAM_LOCAL_AGENT_ID = "telegram-local-machine-agent" as const;
const TELEGRAM_LOCAL_PIPELINE_ID = "telegram-local-machine-pipeline" as const;

export async function executeTelegramSeedLocalMachineCommand(input?: {
  baseDirectory?: string;
  now?: () => string;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
}): Promise<CommandResult> {
  const baseDirectory = input?.baseDirectory ?? process.cwd();
  const now = input?.now ?? (() => new Date().toISOString());
  const runtime = await bootstrapPersistentRuntime(baseDirectory, {
    env: input?.env
  });

  for (const line of buildPersistentRuntimeBootstrapSummary(runtime)) {
    console.log(line);
  }

  if (!runtime.ok) {
    return { exitCode: 1 };
  }

  const providerBinding = createRuntimeDefaultAiProvider({
    config: runtime.state.config,
    env: input?.env,
    fetchImpl: input?.fetchImpl
  });

  const existingFlowBindings = runtime.state.config.runtime.flowBindings ?? [];
  const nextFlowBindings = [
    ...existingFlowBindings.filter((binding) => binding.pipelineId !== TELEGRAM_LOCAL_PIPELINE_ID),
    {
      triggerKind: "telegram" as const,
      eventName: "telegram.message.received",
      pipelineId: TELEGRAM_LOCAL_PIPELINE_ID
    }
  ];
  const nextConfig = {
    ...runtime.state.config,
    runtime: {
      ...runtime.state.config.runtime,
      flowBindings: nextFlowBindings
    }
  };
  await writeConfigFile(resolveConfigPath(baseDirectory), nextConfig);
  runtime.state.config = nextConfig;

  const builtInSkill = createTelegramMachineAssistantSkill({
    provider: providerBinding.provider,
    defaultModel: providerBinding.defaultModel
  });

  runtime.state.skillRegistry.seed(builtInSkill);

  runtime.state.agentRegistry.seed(
    createAgentDefinition({
      id: TELEGRAM_LOCAL_AGENT_ID,
      name: "Telegram Local Machine Agent",
      description: "Handles Telegram machine-status questions against the local machine.",
      prompt: "Answer Telegram machine questions by checking the real local machine and replying naturally.",
      model: {
        provider: "default-ai",
        model: runtime.state.config.providers.defaultAi.model ?? "gpt-4o-mini"
      },
      skills: [
        {
          skillId: TELEGRAM_MACHINE_ASSISTANT_SKILL_ID,
          required: true
        }
      ],
      triggers: [
        {
          kind: "telegram",
          event: "telegram.message.received"
        }
      ],
      tags: ["builtin", "telegram", "machine"]
    })
  );

  const pipeline = createPipelineDefinition({
    id: TELEGRAM_LOCAL_PIPELINE_ID,
    name: "Telegram Local Machine Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      {
        id: "agent-1",
        type: "agent",
        label: "Telegram Local Machine Agent",
        config: { refId: TELEGRAM_LOCAL_AGENT_ID }
      },
      {
        id: "skill-1",
        type: "skill",
        label: "Telegram Machine Assistant Skill",
        config: { refId: TELEGRAM_MACHINE_ASSISTANT_SKILL_ID }
      },
      { id: "response-1", type: "response", label: "Telegram Reply" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ],
    tags: ["builtin", "telegram", "machine"]
  });

  const otherPipelines = runtime.state.pipelines.filter((entry) => entry.id !== TELEGRAM_LOCAL_PIPELINE_ID);
  runtime.state.pipelines = [...otherPipelines, pipeline];

  runtime.state.auditStore.append(
    createAuditEvent({
      id: `audit-telegram-seed-${Date.now()}`,
      category: "setup",
      action: "telegram.seed.local-machine",
      target: {
        kind: "pipeline",
        id: TELEGRAM_LOCAL_PIPELINE_ID,
        name: "Telegram Local Machine Pipeline"
      },
      metadata: {
        skillId: TELEGRAM_MACHINE_ASSISTANT_SKILL_ID,
        agentId: TELEGRAM_LOCAL_AGENT_ID
      },
      now
    })
  );

  await writeEntityStorageFile(
    resolveEntityStoragePath(baseDirectory),
    createPersistentEntitySnapshot({
      agents: runtime.state.agentRegistry,
      skills: runtime.state.skillRegistry,
      mcpServers: runtime.state.mcpRegistry,
      pipelines: runtime.state.pipelines,
      now
    })
  );

  await writeRuntimeStorageFile(
    resolveRuntimeStoragePath(baseDirectory),
    createPersistentRuntimeSnapshot({
      historyStore: runtime.state.historyStore,
      auditStore: runtime.state.auditStore,
      now
    })
  );

  console.log("Telegram local machine seed completed.");
  console.log(`- agent: ${TELEGRAM_LOCAL_AGENT_ID}`);
  console.log(`- skill: ${TELEGRAM_MACHINE_ASSISTANT_SKILL_ID}`);
  console.log(`- pipeline: ${TELEGRAM_LOCAL_PIPELINE_ID}`);

  return { exitCode: 0 };
}
