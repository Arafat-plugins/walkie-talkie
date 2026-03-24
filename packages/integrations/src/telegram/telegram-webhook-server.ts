import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from "node:http";

import type { AgentRegistryStore } from "../../../agents/src/index.ts";
import type { WalkieTalkieConfig } from "../../../config/src/index.ts";
import type { PipelineDefinition } from "../../../pipeline/src/index.ts";
import { InMemoryRunHistoryStore } from "../../../runtime/src/index.ts";
import type { SkillRegistryStore } from "../../../skills/src/index.ts";
import type { TelegramBotApiClient, TelegramWebhookRegistration } from "./telegram-bot-api.ts";
import { createTelegramWebhookHandler, type TelegramWebhookHandler } from "./telegram-webhook-handler.ts";
import {
  buildTelegramRuntimeWebhookUrl,
  createTelegramRuntimeConfig
} from "./telegram-runtime-config.ts";

type TimestampFactory = () => string;

export type TelegramWebhookHttpServerStartOptions = {
  port?: number;
  host?: string;
  registerOnStart?: boolean;
  allowedUpdates?: string[];
  dropPendingUpdates?: boolean;
};

export type TelegramWebhookHttpServerStartResult = {
  host: string;
  port: number;
  path: string;
  localUrl: string;
  webhookUrl?: string;
  webhookRegistration?: TelegramWebhookRegistration;
};

export type TelegramWebhookHttpServer = {
  start(options?: TelegramWebhookHttpServerStartOptions): Promise<TelegramWebhookHttpServerStartResult>;
  stop(): Promise<void>;
  isRunning(): boolean;
};

export type TelegramWebhookHttpServerInput = {
  config: WalkieTalkieConfig;
  pipelines: PipelineDefinition[];
  agentRegistry: AgentRegistryStore;
  skillRegistry: SkillRegistryStore;
  historyStore: InMemoryRunHistoryStore;
  client?: TelegramBotApiClient;
  handler?: TelegramWebhookHandler;
  now?: TimestampFactory;
};

export async function registerTelegramRuntimeWebhook(input: {
  config: WalkieTalkieConfig;
  client: TelegramBotApiClient;
  allowedUpdates?: string[];
  dropPendingUpdates?: boolean;
}): Promise<TelegramWebhookRegistration | undefined> {
  const runtimeConfig = createTelegramRuntimeConfig(input.config.runtime.telegram);
  const webhookUrl = buildTelegramRuntimeWebhookUrl(runtimeConfig);

  if (runtimeConfig.delivery.mode !== "webhook" || !webhookUrl) {
    return undefined;
  }

  return input.client.setWebhook({
    url: webhookUrl,
    secretToken: runtimeConfig.webhookSecretToken,
    allowedUpdates: input.allowedUpdates,
    dropPendingUpdates: input.dropPendingUpdates
  });
}

function normalizeHeaders(headers: IncomingMessage["headers"]): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};

  for (const [name, value] of Object.entries(headers)) {
    normalized[name] = Array.isArray(value) ? value.join(", ") : value;
  }

  return normalized;
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const bodyText = Buffer.concat(chunks).toString("utf8").trim();

  if (!bodyText) {
    return {};
  }

  return JSON.parse(bodyText);
}

function writeResponse(response: ServerResponse, input: { statusCode: number; body: string }): void {
  response.writeHead(input.statusCode, {
    "content-type": "text/plain; charset=utf-8"
  });
  response.end(input.body);
}

export function createTelegramWebhookHttpServer(
  input: TelegramWebhookHttpServerInput
): TelegramWebhookHttpServer {
  const handler =
    input.handler ??
    createTelegramWebhookHandler({
      config: input.config,
      pipelines: input.pipelines,
      agentRegistry: input.agentRegistry,
      skillRegistry: input.skillRegistry,
      historyStore: input.historyStore,
      now: input.now
    });

  let server: HttpServer | undefined;

  return {
    async start(options = {}) {
      if (server?.listening) {
        const address = server.address();
        if (!address || typeof address === "string") {
          throw new Error("Telegram webhook server is running with an unsupported address.");
        }

        return {
          host: options.host ?? "127.0.0.1",
          port: address.port,
          path: createTelegramRuntimeConfig(input.config.runtime.telegram).delivery.webhookPath ?? "/telegram/webhook",
          localUrl: `http://${options.host ?? "127.0.0.1"}:${address.port}${createTelegramRuntimeConfig(input.config.runtime.telegram).delivery.webhookPath ?? "/telegram/webhook"}`,
          webhookUrl: buildTelegramRuntimeWebhookUrl(createTelegramRuntimeConfig(input.config.runtime.telegram))
        };
      }

      const runtimeConfig = createTelegramRuntimeConfig(input.config.runtime.telegram);
      const host = options.host ?? "127.0.0.1";
      const port = options.port ?? 0;
      const path = runtimeConfig.delivery.webhookPath ?? "/telegram/webhook";
      const webhookUrl = buildTelegramRuntimeWebhookUrl(runtimeConfig);

      server = createServer(async (request, response) => {
        try {
          const requestUrl = new URL(request.url ?? "/", `http://${host}:${port || 80}`);

          if (request.method !== "POST") {
            writeResponse(response, {
              statusCode: 405,
              body: "Telegram webhook requires POST."
            });
            return;
          }

          const body = await readJsonBody(request);
          const result = await handler.handle({
            path: requestUrl.pathname,
            headers: normalizeHeaders(request.headers),
            body
          });

          writeResponse(response, {
            statusCode: result.statusCode,
            body: result.body
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Telegram webhook server failed.";

          writeResponse(response, {
            statusCode: 400,
            body: message
          });
        }
      });

      const startResult = await new Promise<TelegramWebhookHttpServerStartResult>((resolve, reject) => {
        server?.once("error", reject);
        server?.listen(port, host, async () => {
          try {
            const address = server?.address();
            if (!address || typeof address === "string") {
              throw new Error("Telegram webhook server did not expose a TCP address.");
            }

            const webhookRegistration =
              options.registerOnStart && input.client
                ? await registerTelegramRuntimeWebhook({
                    config: input.config,
                    client: input.client,
                    allowedUpdates: options.allowedUpdates,
                    dropPendingUpdates: options.dropPendingUpdates
                  })
                : undefined;

            resolve({
              host,
              port: address.port,
              path,
              localUrl: `http://${host}:${address.port}${path}`,
              webhookUrl,
              webhookRegistration
            });
          } catch (error) {
            reject(error);
          }
        });
      });

      return startResult;
    },
    async stop() {
      if (!server) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      server = undefined;
    },
    isRunning() {
      return server?.listening ?? false;
    }
  };
}
