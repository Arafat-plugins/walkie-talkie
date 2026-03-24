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
import { createTelegramTriggerEvent } from "./telegram-trigger.ts";
import { createTelegramRuntimeConfig } from "./telegram-runtime-config.ts";

type TimestampFactory = () => string;

export type TelegramWebhookRequest = {
  path: string;
  headers?: Record<string, string | undefined>;
  body: unknown;
};

export type TelegramWebhookResult = {
  accepted: boolean;
  ignored: boolean;
  statusCode: number;
  body: string;
  reason?: string;
  result?: RuntimeOrchestrationResult;
};

export type TelegramWebhookHandler = {
  handle(request: TelegramWebhookRequest): Promise<TelegramWebhookResult>;
};

export type TelegramWebhookHandlerInput = {
  config: WalkieTalkieConfig;
  pipelines: PipelineDefinition[];
  agentRegistry: AgentRegistryStore;
  skillRegistry: SkillRegistryStore;
  historyStore: InMemoryRunHistoryStore;
  adapter?: TelegramAdapter;
  now?: TimestampFactory;
};

function readHeader(headers: Record<string, string | undefined> | undefined, name: string): string | undefined {
  if (!headers) {
    return undefined;
  }

  const target = name.toLowerCase();

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerName.toLowerCase() === target) {
      return headerValue;
    }
  }

  return undefined;
}

export function createTelegramWebhookHandler(input: TelegramWebhookHandlerInput): TelegramWebhookHandler {
  const adapter = input.adapter ?? createTelegramAdapter({ delivery: { mode: "webhook" } });
  const now = input.now ?? (() => new Date().toISOString());

  return {
    async handle(request) {
      const runtimeConfig = createTelegramRuntimeConfig(input.config.runtime.telegram);

      if (!runtimeConfig.enabled) {
        return {
          accepted: false,
          ignored: true,
          statusCode: 503,
          body: "Telegram webhook is disabled.",
          reason: "Telegram webhook is disabled in runtime.telegram.enabled."
        };
      }

      if (runtimeConfig.delivery.mode !== "webhook") {
        return {
          accepted: false,
          ignored: true,
          statusCode: 409,
          body: "Telegram webhook requires webhook delivery mode.",
          reason: `Telegram webhook handler requires webhook mode, received "${runtimeConfig.delivery.mode}".`
        };
      }

      const expectedPath = runtimeConfig.delivery.webhookPath ?? "/telegram/webhook";

      if (request.path !== expectedPath) {
        return {
          accepted: false,
          ignored: true,
          statusCode: 404,
          body: "Telegram webhook path not found.",
          reason: `Telegram webhook request path "${request.path}" did not match "${expectedPath}".`
        };
      }

      if (runtimeConfig.webhookSecretToken) {
        const providedToken = readHeader(request.headers, "x-telegram-bot-api-secret-token");

        if (providedToken !== runtimeConfig.webhookSecretToken) {
          return {
            accepted: false,
            ignored: true,
            statusCode: 401,
            body: "Telegram webhook secret token is invalid.",
            reason: "Telegram webhook secret token did not match runtime config."
          };
        }
      }

      const message = adapter.receive(request.body);

      if (!message) {
        return {
          accepted: true,
          ignored: true,
          statusCode: 200,
          body: "Telegram webhook update ignored.",
          reason: "Telegram webhook payload did not contain a supported message update."
        };
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

      return {
        accepted: true,
        ignored: false,
        statusCode: 200,
        body: "Telegram webhook processed.",
        result
      };
    }
  };
}
