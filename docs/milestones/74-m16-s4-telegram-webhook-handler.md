# M16-S4: Telegram Webhook Handler Boundary

## Goal

Webhook delivery mode-এর জন্য server-agnostic handler boundary add করা, যাতে later HTTP framework plug করলেই live request process করা যায়।

## Changed Files

- `packages/integrations/src/telegram/telegram-webhook-handler.ts`
- `packages/integrations/src/telegram/index.ts`
- `tests/integration/telegram-webhook-handler.integration.test.ts`

## What Was Added

### `packages/integrations/src/telegram/telegram-webhook-handler.ts`

Purpose:
- incoming webhook request কে Telegram message trigger-এ turn করে runtime orchestration-এ handoff করা

Main types:
- `TelegramWebhookRequest`
- `TelegramWebhookResult`
- `TelegramWebhookHandler`
- `TelegramWebhookHandlerInput`

Main behavior:
- `createTelegramWebhookHandler(input)`
  - webhook-mode handler returns
- `handle(request)`
  - runtime config normalize করে
  - disabled হলে `503`
  - non-webhook mode হলে `409`
  - path mismatch হলে `404`
  - secret token mismatch হলে `401`
  - supported Telegram message হলে trigger event create করে
  - `executeConfiguredTriggerPipelineWithHistory(...)` call করে
  - unsupported payload হলে safe ignore করে `200`

Why this matters:
- live webhook mode এখন শুধু config contract না
- path/auth/update-processing boundary now exists without coupling to Express/Fastify/Node internals

### `packages/integrations/src/telegram/index.ts`

Purpose:
- webhook handler integration root-এ expose করা

### `tests/integration/telegram-webhook-handler.integration.test.ts`

Purpose:
- webhook happy path and rejection paths verify করা

Covered:
- matching webhook path + secret
- orchestration execution + run history
- wrong path
- wrong secret
- unsupported callback-style payload ignore

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-bot-api.test.ts tests/unit/telegram-adapter.test.ts tests/unit/telegram-runtime-config.test.ts tests/integration/telegram-polling-runner.integration.test.ts tests/integration/telegram-webhook-handler.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `5` Telegram tests passed
- root typecheck clean

## Next Safe Step

`M16-S5`: live transport smoke tests with mocked network fixtures add করা।
