import { createTelegramRuntimeConfig } from "../../../../packages/integrations/src/index.ts";
import { bootstrapPersistentRuntime } from "../../../../packages/runtime/src/index.ts";
import { executeTelegramPollOnceCommand } from "./telegram-poll-once.ts";

type CommandResult = {
  exitCode: number;
};

async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function executeTelegramPollLoopCommand(input?: {
  baseDirectory?: string;
  now?: () => string;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  maxCycles?: number;
}): Promise<CommandResult> {
  const baseDirectory = input?.baseDirectory ?? process.cwd();
  const runtime = await bootstrapPersistentRuntime(baseDirectory, {
    env: input?.env
  });
  if (!runtime.ok) {
    return { exitCode: 1 };
  }

  const telegramRuntime = createTelegramRuntimeConfig(runtime.state.config.runtime.telegram);
  const pollIntervalMs =
    telegramRuntime.delivery.mode === "polling" ? telegramRuntime.delivery.pollingIntervalMs ?? 2000 : 2000;
  let cycles = 0;
  let requestedOffset: number | undefined;
  let keepRunning = true;

  process.once("SIGINT", () => {
    keepRunning = false;
  });

  while (keepRunning) {
    const result = await executeTelegramPollOnceCommand({
      baseDirectory,
      requestedOffset,
      now: input?.now,
      fetchImpl: input?.fetchImpl,
      env: input?.env
    });

    cycles += 1;
    requestedOffset = result.nextOffset;

    if (input?.maxCycles !== undefined && cycles >= input.maxCycles) {
      return { exitCode: result.exitCode };
    }
    await delay(pollIntervalMs);
  }

  return { exitCode: 0 };
}
