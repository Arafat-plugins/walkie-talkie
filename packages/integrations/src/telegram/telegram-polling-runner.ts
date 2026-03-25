import type { AgentRegistryStore } from "../../../agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../../config/src/index.ts";
import type { PipelineDefinition } from "../../../pipeline/src/index.ts";
import {
  executeConfiguredTriggerPipelineWithHistory,
  InMemoryRunHistoryStore,
  type RuntimeOrchestrationResult
} from "../../../runtime/src/index.ts";
import type { SkillRegistryStore } from "../../../skills/src/index.ts";
import { createTelegramAdapter, type TelegramAdapter } from "./telegram-adapter.ts";
import type { TelegramBotApiClient, TelegramDeliveredMessage } from "./telegram-bot-api.ts";
import { createTelegramTriggerEvent } from "./telegram-trigger.ts";
import { createTelegramRuntimeConfig } from "./telegram-runtime-config.ts";

type TimestampFactory = () => string;

export type TelegramPollingCursor = {
  nextOffset?: number;
};

export type TelegramPollingCycleResult = {
  skipped: boolean;
  reason?: string;
  requestedOffset?: number;
  nextOffset?: number;
  processedUpdates: number;
  ignoredUpdates: number;
  executedRuns: number;
  deliveredReplies: number;
  processedUpdateIds: number[];
  deliveredMessages: TelegramDeliveredMessage[];
  results: RuntimeOrchestrationResult[];
};

export type TelegramPollingRunner = {
  pollOnce(cursor?: TelegramPollingCursor): Promise<TelegramPollingCycleResult>;
};

export type TelegramPollingRunnerInput = {
  config: WalkieTalkieConfig;
  pipelines: PipelineDefinition[];
  agentRegistry: AgentRegistryStore;
  skillRegistry: SkillRegistryStore;
  historyStore: InMemoryRunHistoryStore;
  client: TelegramBotApiClient;
  adapter?: TelegramAdapter;
  now?: TimestampFactory;
};

function readUpdateId(update: unknown): number | undefined {
  if (!update || typeof update !== "object") {
    return undefined;
  }

  const candidate = update as { update_id?: unknown };
  return typeof candidate.update_id === "number" ? candidate.update_id : undefined;
}

function buildPollingRequestTimeoutSeconds(config: WalkieTalkieConfig): number {
  const runtimeConfig = createTelegramRuntimeConfig(config.runtime.telegram);
  const pollingIntervalMs = runtimeConfig.delivery.mode === "polling" ? runtimeConfig.delivery.pollingIntervalMs ?? 2_000 : 2_000;
  return Math.max(1, Math.floor(pollingIntervalMs / 1000));
}

function extractReplyText(output: unknown): string | undefined {
  if (!output || typeof output !== "object") {
    return undefined;
  }

  const candidate = output as { replyText?: unknown; text?: unknown };

  if (typeof candidate.replyText === "string" && candidate.replyText.trim().length > 0) {
    return candidate.replyText.trim();
  }

  if (typeof candidate.text === "string" && candidate.text.trim().length > 0) {
    return candidate.text.trim();
  }

  return undefined;
}

export function createTelegramPollingRunner(input: TelegramPollingRunnerInput): TelegramPollingRunner {
  const adapter = input.adapter ?? createTelegramAdapter({ delivery: { mode: "polling" } });
  const now = input.now ?? (() => new Date().toISOString());

  return {
    async pollOnce(cursor = {}) {
      const runtimeConfig = createTelegramRuntimeConfig(input.config.runtime.telegram);

      if (!runtimeConfig.enabled) {
        return {
          skipped: true,
          reason: "Telegram polling is disabled in runtime.telegram.enabled.",
          requestedOffset: cursor.nextOffset,
          nextOffset: cursor.nextOffset,
          processedUpdates: 0,
          ignoredUpdates: 0,
          executedRuns: 0,
          deliveredReplies: 0,
          processedUpdateIds: [],
          deliveredMessages: [],
          results: []
        };
      }

      if (runtimeConfig.delivery.mode !== "polling") {
        return {
          skipped: true,
          reason: `Telegram polling runner requires polling mode, received "${runtimeConfig.delivery.mode}".`,
          requestedOffset: cursor.nextOffset,
          nextOffset: cursor.nextOffset,
          processedUpdates: 0,
          ignoredUpdates: 0,
          executedRuns: 0,
          deliveredReplies: 0,
          processedUpdateIds: [],
          deliveredMessages: [],
          results: []
        };
      }

      const updates = await input.client.getUpdates({
        offset: cursor.nextOffset,
        timeoutSeconds: buildPollingRequestTimeoutSeconds(input.config)
      });
      const results: RuntimeOrchestrationResult[] = [];
      const processedUpdateIds: number[] = [];
      const deliveredMessages: TelegramDeliveredMessage[] = [];
      let ignoredUpdates = 0;

      for (const update of updates) {
        const updateId = readUpdateId(update);

        if (typeof updateId === "number") {
          processedUpdateIds.push(updateId);
        }

        const message = adapter.receive(update);

        if (!message) {
          ignoredUpdates += 1;
          continue;
        }

        const trigger = createTelegramTriggerEvent(message, now);
        const result = await executeConfiguredTriggerPipelineWithHistory({
          config: input.config,
          pipelines: input.pipelines,
          trigger,
          agentRegistry: input.agentRegistry,
          skillRegistry: input.skillRegistry,
          historyStore: input.historyStore,
          now
        });

        results.push(result);

        const replyText = result.ok ? extractReplyText(result.finalOutput) : undefined;

        if (replyText) {
          const delivered = await input.client.sendMessage({
            chatId: message.chatId,
            text: replyText,
            replyToMessageId: message.messageId
          });

          deliveredMessages.push(delivered);
        }
      }

      const highestUpdateId = processedUpdateIds.reduce<number | undefined>(
        (current, updateId) => (current === undefined || updateId > current ? updateId : current),
        undefined
      );

      return {
        skipped: false,
        requestedOffset: cursor.nextOffset,
        nextOffset: highestUpdateId !== undefined ? highestUpdateId + 1 : cursor.nextOffset,
        processedUpdates: updates.length,
        ignoredUpdates,
        executedRuns: results.length,
        deliveredReplies: deliveredMessages.length,
        processedUpdateIds,
        deliveredMessages,
        results
      };
    }
  };
}
