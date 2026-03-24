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
    publicBaseUrl: input?.publicBaseUrl,
    webhookSecretToken: input?.webhookSecretToken
  };
}
