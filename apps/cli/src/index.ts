#!/usr/bin/env node

import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { executeInstallCommand, type CommandResult } from "./commands/install.ts";
import { executeTelegramPollOnceCommand } from "./commands/telegram-poll-once.ts";

export type CliScaffoldMetadata = {
  appName: string;
  stage: string;
};

export type SupportedCommand = "install" | "telegram:poll-once";

type CommandHandler = () => Promise<CommandResult>;

/**
 * Single source of command-to-handler mapping.
 * This keeps command registration explicit and test-friendly.
 */
const commandRegistry: Record<SupportedCommand, CommandHandler> = {
  install: executeInstallCommand,
  "telegram:poll-once": executeTelegramPollOnceCommand
};

export function getCliScaffoldMetadata(): CliScaffoldMetadata {
  return {
    appName: "walkie-talkie",
    stage: "m2-s2-command-registration"
  };
}

/**
 * Parses argv and returns a registered command or null.
 */
export function resolveCommand(argv: string[]): SupportedCommand | null {
  const candidate = argv[2];
  if (candidate === "install" || candidate === "telegram:poll-once") {
    return candidate;
  }
  return null;
}

/**
 * Runs a resolved command handler and returns process exit code.
 */
export async function runCli(argv: string[]): Promise<number> {
  const command = resolveCommand(argv);
  if (!command) {
    return 1;
  }

  const result = await commandRegistry[command]();
  return result.exitCode;
}

function isMainModule(): boolean {
  if (!process.argv[1]) {
    return false;
  }

  const argvPathUrl = pathToFileURL(process.argv[1]).href;
  if (argvPathUrl === import.meta.url) {
    return true;
  }

  try {
    const resolvedPathUrl = pathToFileURL(realpathSync(process.argv[1])).href;
    return resolvedPathUrl === import.meta.url;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  runCli(process.argv)
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown CLI failure.";
      console.error(message);
      process.exitCode = 1;
    });
}
