import type { AiProvider } from "../../integrations/src/index.ts";
import {
  createTerminalExecutionPolicy,
  executeLocalTerminalCommand,
  type TerminalExecutionPolicy
} from "../../core/src/index.ts";
import { createSkillDefinition, type SkillDefinition, type SkillExecutionContext } from "./skill-contract.ts";
import { findSystemToolExecutablePath } from "./system-tool-check-skill.ts";

export const TELEGRAM_MACHINE_ASSISTANT_SKILL_ID = "telegram-machine-assistant-skill" as const;

type VersionProbe = {
  args: string[];
};

type MachineAssistantFacts = {
  originalText: string;
  tool?: string;
  installed: boolean;
  executablePath?: string;
  versionText?: string;
  requestedVersion: boolean;
  platform: NodeJS.Platform;
};

const VERSION_PROBES: VersionProbe[] = [{ args: ["--version"] }, { args: ["-v"] }, { args: ["version"] }];

const STOP_WORDS = new Set([
  "is",
  "are",
  "the",
  "a",
  "an",
  "please",
  "check",
  "installed",
  "install",
  "version",
  "ache",
  "naki",
  "ki",
  "amar",
  "machine",
  "server",
  "e",
  "on",
  "my",
  "whether",
  "bolo",
  "ektu",
  "dekho"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/gi, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function extractRequestedTool(context: SkillExecutionContext): string | undefined {
  const explicitTool = context.input.tool;
  if (typeof explicitTool === "string" && explicitTool.trim().length > 0) {
    return explicitTool.trim();
  }

  const text = typeof context.input.text === "string" ? context.input.text : "";
  const tokens = tokenize(text);

  const preferred = tokens.find((token) => !STOP_WORDS.has(token));
  return preferred;
}

function isVersionRequest(context: SkillExecutionContext): boolean {
  if (context.input.includeVersion === true) {
    return true;
  }

  const text = typeof context.input.text === "string" ? context.input.text.toLowerCase() : "";
  return /\b(version|--version|-v|koto|kon version)\b/i.test(text);
}

async function resolveVersionText(tool: string, policy: TerminalExecutionPolicy): Promise<string | undefined> {
  for (const probe of VERSION_PROBES) {
    const result = await executeLocalTerminalCommand(
      {
        command: tool,
        args: probe.args
      },
      policy
    );

    if (result.ok) {
      const combined = `${result.stdout}\n${result.stderr}`.trim();
      if (combined.length > 0) {
        return combined.split(/\r?\n/)[0]?.trim();
      }
    }
  }

  return undefined;
}

function buildFallbackReply(facts: MachineAssistantFacts): string {
  if (!facts.tool) {
    return "I could not clearly identify which tool you want me to check on this machine yet. Try something like: `node ache?` or `npm version koto?`";
  }

  if (!facts.installed) {
    return `I checked your machine and ${facts.tool} does not seem to be installed right now.${facts.requestedVersion ? " So there is no version to report yet." : ""}`;
  }

  if (facts.requestedVersion && facts.versionText) {
    return `${facts.tool} is installed on your machine, and the version looks like: ${facts.versionText}`;
  }

  if (facts.requestedVersion) {
    return `${facts.tool} is installed on your machine. I found it at ${facts.executablePath ?? "a local executable path"}, but I could not read a version string from it yet.`;
  }

  return `${facts.tool} is installed on your machine.${facts.executablePath ? ` I found it at ${facts.executablePath}.` : ""}`;
}

async function buildHumanReply(input: {
  provider?: AiProvider;
  defaultModel?: string;
  facts: MachineAssistantFacts;
}): Promise<string> {
  const fallback = buildFallbackReply(input.facts);

  if (!input.provider || !input.defaultModel) {
    return fallback;
  }

  try {
    const completion = await input.provider.complete({
      provider: input.provider.config,
      model: input.defaultModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are Walkie-Talkie's machine assistant. Reply naturally in the user's likely language. Use only the provided facts. Be concise, helpful, and honest."
        },
        {
          role: "user",
          content: `Original user message: ${input.facts.originalText}\nFacts: ${JSON.stringify(input.facts)}`
        }
      ]
    });

    const output = completion.outputText.trim();
    return output.length > 0 ? output : fallback;
  } catch {
    return fallback;
  }
}

export function createTelegramMachineAssistantSkill(input?: {
  provider?: AiProvider;
  defaultModel?: string;
  terminalPolicy?: TerminalExecutionPolicy;
}): SkillDefinition {
  return createSkillDefinition({
    id: TELEGRAM_MACHINE_ASSISTANT_SKILL_ID,
    name: "Telegram Machine Assistant",
    description: "Checks local machine tools and replies with a natural Telegram-friendly answer.",
    parameters: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "Original Telegram message text."
      }
    ],
    tags: ["builtin", "telegram", "machine", "assistant"],
    handler: async (context) => {
      const originalText = typeof context.input.text === "string" ? context.input.text : "";
      const tool = extractRequestedTool(context);

      if (!tool) {
        return {
          ok: true,
          output: {
            replyText: buildFallbackReply({
              originalText,
              installed: false,
              requestedVersion: false,
              platform: process.platform
            })
          }
        };
      }

      const executablePath = findSystemToolExecutablePath(tool);
      const installed = typeof executablePath === "string";
      const requestedVersion = isVersionRequest(context);
      const terminalPolicy =
        input?.terminalPolicy ??
        createTerminalExecutionPolicy({
          allowedCommands: [tool]
        });
      const versionText =
        installed && requestedVersion ? await resolveVersionText(tool, terminalPolicy) : undefined;

      const facts: MachineAssistantFacts = {
        originalText,
        tool,
        installed,
        executablePath,
        versionText,
        requestedVersion,
        platform: process.platform
      };

      const replyText = await buildHumanReply({
        provider: input?.provider,
        defaultModel: input?.defaultModel,
        facts
      });

      return {
        ok: true,
        output: {
          replyText,
          facts
        }
      };
    }
  });
}
