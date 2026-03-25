import type { WalkieTalkieConfig } from "../../config/src/index.ts";
import {
  createRuntimeDefaultAiProvider,
  type RuntimeDefaultAiProviderBinding
} from "../../runtime/src/provider-wiring.ts";
import type { SkillDefinition } from "./skill-contract.ts";
import { SkillRegistryStore } from "./skill-registry.ts";
import { createLocalTerminalSkill, LOCAL_TERMINAL_SKILL_ID } from "./local-terminal-skill.ts";
import { createSystemToolCheckSkill, SYSTEM_TOOL_CHECK_SKILL_ID } from "./system-tool-check-skill.ts";
import {
  createTelegramMachineAssistantSkill,
  TELEGRAM_MACHINE_ASSISTANT_SKILL_ID
} from "./telegram-machine-assistant-skill.ts";

export type BuiltinSkillId =
  | typeof LOCAL_TERMINAL_SKILL_ID
  | typeof SYSTEM_TOOL_CHECK_SKILL_ID
  | typeof TELEGRAM_MACHINE_ASSISTANT_SKILL_ID;

function createProviderBinding(
  config: WalkieTalkieConfig,
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
  fetchImpl?: typeof fetch
): RuntimeDefaultAiProviderBinding | undefined {
  if (config.providers.defaultAi.authMode === "codex") {
    return undefined;
  }

  if (
    typeof config.providers.defaultAi.apiKey !== "string" ||
    config.providers.defaultAi.apiKey.trim().length === 0
  ) {
    return undefined;
  }

  return createRuntimeDefaultAiProvider({
    config,
    env,
    fetchImpl
  });
}

export function createBuiltinSkillById(input: {
  skillId: string;
  config: WalkieTalkieConfig;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
}): SkillDefinition | undefined {
  if (input.skillId === LOCAL_TERMINAL_SKILL_ID) {
    return createLocalTerminalSkill();
  }

  if (input.skillId === SYSTEM_TOOL_CHECK_SKILL_ID) {
    return createSystemToolCheckSkill();
  }

  if (input.skillId === TELEGRAM_MACHINE_ASSISTANT_SKILL_ID) {
    const binding = createProviderBinding(input.config, input.env, input.fetchImpl);
    return createTelegramMachineAssistantSkill({
      provider: binding?.provider,
      defaultModel: binding?.defaultModel
    });
  }

  return undefined;
}

export function rebindBuiltinSkills(input: {
  skillRegistry: SkillRegistryStore;
  config: WalkieTalkieConfig;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
}): number {
  let rebound = 0;

  for (const skill of input.skillRegistry.snapshot()) {
    const builtin = createBuiltinSkillById({
      skillId: skill.id,
      config: input.config,
      env: input.env,
      fetchImpl: input.fetchImpl
    });

    if (!builtin) {
      continue;
    }

    input.skillRegistry.seed({
      ...skill,
      handler: builtin.handler
    });
    rebound += 1;
  }

  return rebound;
}
