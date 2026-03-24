export const TELEGRAM_DELIVERY_MODES = ["webhook", "polling"] as const;

export type TelegramDeliveryMode = (typeof TELEGRAM_DELIVERY_MODES)[number];

export type TelegramDeliveryConfig = {
  mode: TelegramDeliveryMode;
  webhookPath?: string;
  pollingIntervalMs?: number;
};

export function createTelegramDeliveryConfig(
  input?: Partial<TelegramDeliveryConfig>
): TelegramDeliveryConfig {
  const mode = input?.mode ?? "polling";

  if (mode === "webhook") {
    return {
      mode,
      webhookPath: input?.webhookPath ?? "/telegram/webhook"
    };
  }

  return {
    mode,
    pollingIntervalMs: input?.pollingIntervalMs ?? 2_000
  };
}
