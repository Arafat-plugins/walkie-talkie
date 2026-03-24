# M16-S2: Telegram Bot API Client

## Goal

Live Telegram transport-এর second step হিসেবে send/poll operations-এর জন্য transport-injected Bot API client boundary add করা।

## Changed Files

- `packages/integrations/src/telegram/telegram-bot-api.ts`
- `packages/integrations/src/telegram/index.ts`
- `tests/unit/telegram-bot-api.test.ts`

## What Was Added

### `packages/integrations/src/telegram/telegram-bot-api.ts`

Purpose:
- Telegram Bot API operationsকে stable client boundary-তে আনা
- real network later plug করার আগে request/response normalization settle করা

Main types:
- `TelegramBotApiConfig`
- `TelegramGetUpdatesRequest`
- `TelegramDeliveredMessage`
- `TelegramBotApiTransport`
- `TelegramBotApiClient`
- `TelegramBotApiError`

Main helpers:
- `buildTelegramBotApiUrl(config, method)`
  - method-specific API URL বানায়
- `buildTelegramGetUpdatesPayload(request)`
  - Telegram polling payload normalize করে
- `buildTelegramSendMessagePayload(message)`
  - outgoing reply payload Telegram API format-এ map করে
- `mapTelegramGetUpdatesResponse(raw)`
  - raw envelope থেকে update array বের করে
- `mapTelegramSendMessageResponse(raw)`
  - delivered message metadata normalize করে

Error behavior:
- `TelegramBotApiFailure`
  - response-shape failures and transport failures same family-তে wrap করে

Main constructor:
- `createTelegramBotApiClient({ config, transport })`
  - `getUpdates()`
  - `sendMessage()`
  - both methods transport-injected, so no real fetch coupling yet

Why this matters:
- next step-এ polling runner শুধু client call করে updates নিতে পারবে
- later real HTTP transport wire করলেও orchestration-facing shape change করতে হবে না

### `packages/integrations/src/telegram/index.ts`

Purpose:
- new Bot API client exports integration root-এ expose করা

### `tests/unit/telegram-bot-api.test.ts`

Purpose:
- URL/payload builders verify করা
- transport delegation verify করা
- response and transport failure normalization verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-bot-api.test.ts tests/unit/telegram-adapter.test.ts tests/unit/telegram-runtime-config.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` Telegram unit test files passed
- root typecheck clean

## Next Safe Step

`M16-S3`: polling runner with trigger event handoff into runtime orchestration add করা।
