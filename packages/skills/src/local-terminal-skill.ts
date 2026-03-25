import {
  createTerminalExecutionPolicy,
  executeLocalTerminalCommand,
  type TerminalExecutionPolicy,
  type TerminalExecutionResult
} from "../../core/src/index.ts";
import { createSkillDefinition, type SkillDefinition, type SkillExecutionContext } from "./skill-contract.ts";

export const LOCAL_TERMINAL_SKILL_ID = "local-terminal-skill" as const;

export type LocalTerminalSkillOutput = {
  checkedBy: typeof LOCAL_TERMINAL_SKILL_ID;
  result: TerminalExecutionResult;
};

function resolveCommand(context: SkillExecutionContext): string | undefined {
  const value = context.input.command;
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function resolveArgs(context: SkillExecutionContext): string[] {
  const value = context.input.args;
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => `${entry}`);
}

function resolveCwd(context: SkillExecutionContext): string | undefined {
  const value = context.input.cwd;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function resolveTimeoutMs(context: SkillExecutionContext): number | undefined {
  const value = context.input.timeoutMs;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function createLocalTerminalSkill(input?: {
  policy?: TerminalExecutionPolicy;
}): SkillDefinition {
  const policy = input?.policy ?? createTerminalExecutionPolicy();

  return createSkillDefinition({
    id: LOCAL_TERMINAL_SKILL_ID,
    name: "Local Terminal",
    description: "Runs a policy-controlled local terminal command with explicit command and args.",
    parameters: [
      {
        name: "command",
        type: "string",
        required: true,
        description: "Executable name to run, for example node, npm, pwd, or df."
      },
      {
        name: "args",
        type: "json",
        required: false,
        description: "Optional argument array for the command."
      },
      {
        name: "cwd",
        type: "string",
        required: false,
        description: "Optional working directory."
      },
      {
        name: "timeoutMs",
        type: "number",
        required: false,
        description: "Optional execution timeout in milliseconds."
      }
    ],
    tags: ["builtin", "terminal", "system", "controlled"],
    handler: async (context) => {
      const command = resolveCommand(context);
      if (!command) {
        return {
          ok: false,
          error: 'Local Terminal requires input.command as a non-empty string.'
        };
      }

      const result = await executeLocalTerminalCommand(
        {
          command,
          args: resolveArgs(context),
          cwd: resolveCwd(context),
          timeoutMs: resolveTimeoutMs(context)
        },
        policy
      );

      if (!result.ok) {
        return {
          ok: false,
          error: result.error ?? `Terminal command "${command}" failed.`,
          output: {
            checkedBy: LOCAL_TERMINAL_SKILL_ID,
            result
          } as LocalTerminalSkillOutput
        };
      }

      return {
        ok: true,
        output: {
          checkedBy: LOCAL_TERMINAL_SKILL_ID,
          result
        } satisfies LocalTerminalSkillOutput
      };
    }
  });
}
