import { accessSync, constants } from "node:fs";
import { delimiter, join } from "node:path";

import { createSkillDefinition, type SkillDefinition, type SkillExecutionContext } from "./skill-contract.ts";

export const SYSTEM_TOOL_CHECK_SKILL_ID = "system-tool-check-skill" as const;

export type SystemToolCheckOutput = {
  tool: string;
  installed: boolean;
  executablePath?: string;
  checkedBy: typeof SYSTEM_TOOL_CHECK_SKILL_ID;
  platform: NodeJS.Platform;
};

function resolveRequestedToolName(context: SkillExecutionContext): string | undefined {
  const candidate = context.input.tool ?? context.input.command;

  if (typeof candidate !== "string") {
    return undefined;
  }

  const normalized = candidate.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function findSystemToolExecutablePath(
  tool: string,
  platform: NodeJS.Platform = process.platform
): string | undefined {
  const rawPath = process.env.PATH ?? "";
  const directories = rawPath
    .split(delimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const extensions =
    platform === "win32"
      ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM")
          .split(";")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0)
      : [""];

  for (const directory of directories) {
    for (const extension of extensions) {
      const candidate = join(directory, platform === "win32" ? `${tool}${extension}` : tool);

      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {
        continue;
      }
    }
  }

  return undefined;
}

export function createSystemToolCheckSkill(): SkillDefinition {
  return createSkillDefinition({
    id: SYSTEM_TOOL_CHECK_SKILL_ID,
    name: "System Tool Check",
    description: "Checks whether a requested executable is installed on the current machine.",
    parameters: [
      {
        name: "tool",
        type: "string",
        required: true,
        description: "Executable name to check, for example node, npm, or cursor."
      }
    ],
    tags: ["builtin", "system", "utility"],
    handler: async (context) => {
      const tool = resolveRequestedToolName(context);

      if (!tool) {
        return {
          ok: false,
          error: 'System Tool Check requires input.tool as a non-empty string.'
        };
      }

      const executablePath = findSystemToolExecutablePath(tool);
      const output: SystemToolCheckOutput = {
        tool,
        installed: typeof executablePath === "string",
        executablePath,
        checkedBy: SYSTEM_TOOL_CHECK_SKILL_ID,
        platform: process.platform
      };

      return {
        ok: true,
        output
      };
    }
  });
}
