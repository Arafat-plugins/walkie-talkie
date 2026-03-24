# Telegram Webhook Runtime Patch

## Goal

Local HTTP webhook receiver এবং Telegram `setWebhook` registration boundary add করা, যাতে real Telegram webhook test-এর জন্য missing runtime pieces clear থাকে.

## Changed Files

- `packages/integrations/src/telegram/telegram-runtime-config.ts`
- `packages/integrations/src/telegram/telegram-bot-api.ts`
- `packages/integrations/src/telegram/telegram-webhook-server.ts`
- `packages/integrations/src/telegram/index.ts`
- `tests/unit/telegram-runtime-config.test.ts`
- `tests/unit/telegram-bot-api.test.ts`
- `tests/unit/telegram-webhook-server.test.ts`

## What Was Added

### Runtime URL helper
- `buildTelegramRuntimeWebhookUrl(config)`
- runtime `publicBaseUrl` + webhook path থেকে canonical webhook URL build করে

### Bot API webhook registration
- `setWebhook()` added to Telegram Bot API client
- request/response helpers:
  - `buildTelegramSetWebhookPayload(...)`
  - `mapTelegramSetWebhookResponse(...)`

### Local HTTP webhook server boundary
- `createTelegramWebhookHttpServer(...)`
  - local Node HTTP server create করতে পারে
  - request body parse করে webhook handler-এ forward করে
  - response status/body return করে
- `registerTelegramRuntimeWebhook(...)`
  - runtime config থেকে current server webhook URL resolve করে
  - `setWebhook()` call করে auto-registration করতে পারে

## Important Note

This patch adds the server/runtime capability, but sandboxed test execution cannot bind a real local TCP port here. For that reason, auto-registration logic is covered in unit tests instead of an actual listen-based integration test.

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-bot-api.test.ts tests/unit/telegram-runtime-config.test.ts tests/unit/telegram-webhook-server.test.ts tests/integration/telegram-webhook-handler.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` Telegram test files passed
- root typecheck clean
