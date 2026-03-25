import {
  buildPersistentRuntimeBootstrapSummary,
  bootstrapPersistentRuntime,
  createPersistentRuntimeSnapshot
} from "../../../../packages/runtime/src/index.ts";
import {
  createFetchTelegramBotApiClient,
  createTelegramPollingRunner,
  type TelegramBotApiClient
} from "../../../../packages/integrations/src/index.ts";
import { resolveRuntimeStoragePath, writeRuntimeStorageFile } from "../../../../packages/shared/src/index.ts";

type PersistentBootstrap = typeof bootstrapPersistentRuntime;
type CommandResult = {
  exitCode: number;
};

export function buildTelegramPollOnceSummary(input: {
  requestedOffset?: number;
  skipped: boolean;
  reason?: string;
  nextOffset?: number;
  processedUpdates: number;
  ignoredUpdates: number;
  executedRuns: number;
  successfulRuns: number;
  failedRuns: number;
  runtimeStoragePath?: string;
}): string[] {
  const lines = ["Telegram poll-once summary:"];

  if (input.requestedOffset !== undefined) {
    lines.push(`- requested offset: ${input.requestedOffset}`);
  }

  lines.push(`- skipped: ${String(input.skipped)}`);

  if (input.reason) {
    lines.push(`- reason: ${input.reason}`);
  }

  if (input.nextOffset !== undefined) {
    lines.push(`- next offset: ${input.nextOffset}`);
  }

  lines.push(`- processed updates: ${input.processedUpdates}`);
  lines.push(`- ignored updates: ${input.ignoredUpdates}`);
  lines.push(`- executed runs: ${input.executedRuns}`);
  lines.push(`- successful runs: ${input.successfulRuns}`);
  lines.push(`- failed runs: ${input.failedRuns}`);

  if (input.runtimeStoragePath) {
    lines.push(`- runtime storage updated: ${input.runtimeStoragePath}`);
  }

  return lines;
}

export async function executeTelegramPollOnceCommand(input?: {
  baseDirectory?: string;
  requestedOffset?: number;
  bootstrap?: PersistentBootstrap;
  createClient?: (botToken: string) => TelegramBotApiClient;
  now?: () => string;
}): Promise<CommandResult> {
  const baseDirectory = input?.baseDirectory ?? process.cwd();
  const bootstrap = input?.bootstrap ?? bootstrapPersistentRuntime;
  const runtime = await bootstrap(baseDirectory);

  for (const line of buildPersistentRuntimeBootstrapSummary(runtime)) {
    console.log(line);
  }

  if (!runtime.ok) {
    return { exitCode: 1 };
  }

  const botToken = runtime.state.config.providers.telegram?.botToken;
  if (typeof botToken !== "string" || botToken.trim().length === 0) {
    console.log("Telegram poll-once blocked: providers.telegram.botToken is required.");
    return { exitCode: 1 };
  }

  const client =
    input?.createClient?.(botToken) ??
    createFetchTelegramBotApiClient({
      config: {
        botToken
      }
    });

  const runner = createTelegramPollingRunner({
    config: runtime.state.config,
    pipelines: runtime.state.pipelines,
    agentRegistry: runtime.state.agentRegistry,
    skillRegistry: runtime.state.skillRegistry,
    historyStore: runtime.state.historyStore,
    client,
    now: input?.now
  });

  const result = await runner.pollOnce({
    nextOffset: input?.requestedOffset
  });

  const successfulRuns = result.results.filter((entry) => entry.ok).length;
  const failedRuns = result.results.length - successfulRuns;
  const runtimeStoragePath = resolveRuntimeStoragePath(baseDirectory);

  await writeRuntimeStorageFile(
    runtimeStoragePath,
    createPersistentRuntimeSnapshot({
      historyStore: runtime.state.historyStore,
      auditStore: runtime.state.auditStore,
      now: input?.now
    })
  );

  for (const line of buildTelegramPollOnceSummary({
    requestedOffset: result.requestedOffset,
    skipped: result.skipped,
    reason: result.reason,
    nextOffset: result.nextOffset,
    processedUpdates: result.processedUpdates,
    ignoredUpdates: result.ignoredUpdates,
    executedRuns: result.executedRuns,
    successfulRuns,
    failedRuns,
    runtimeStoragePath
  })) {
    console.log(line);
  }

  return {
    exitCode: result.skipped || failedRuns > 0 ? 1 : 0
  };
}
