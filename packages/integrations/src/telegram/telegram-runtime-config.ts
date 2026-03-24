import {
  createTelegramDeliveryConfig,
  type TelegramDeliveryConfig
} from "./telegram-delivery-mode.ts";

export type TelegramRuntimeConfig = {
  enabled: boolean;
  delivery: TelegramDeliveryConfig;
  publicBaseUrl?: string;
  webhookSecretToken?: string;
};

export function createTelegramRuntimeConfig(
  input?: Partial<TelegramRuntimeConfig> & {
    delivery?: Partial<TelegramDeliveryConfig>;
  }
): TelegramRuntimeConfig {
  const delivery = createTelegramDeliveryConfig(input?.delivery);

  return {
    enabled: input?.enabled ?? true,
    delivery,
    publicBaseUrl: input?.publicBaseUrl?.replace(/\/+$/, ""),
    webhookSecretToken: input?.webhookSecretToken
  };
}

export function buildTelegramRuntimeWebhookUrl(config: TelegramRuntimeConfig): string | undefined {
  if (config.delivery.mode !== "webhook" || !config.publicBaseUrl) {
    return undefined;
  }

  const webhookPath = config.delivery.webhookPath ?? "/telegram/webhook";
  const normalizedPath = webhookPath.startsWith("/") ? webhookPath : `/${webhookPath}`;

  return `${config.publicBaseUrl}${normalizedPath}`;
}
