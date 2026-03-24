# M11-S3: Telegram Trigger Mapping

## Goal

Incoming Telegram message কে orchestration-friendly shared trigger event contract-এ map করা।

## Changed Files

- `packages/core/src/trigger-event.contract.ts`
- `packages/core/src/index.ts`
- `packages/integrations/src/telegram/telegram-trigger.ts`
- `packages/integrations/src/telegram/index.ts`
- `tests/unit/telegram-trigger.test.ts`

## What Was Added

### `packages/core/src/trigger-event.contract.ts`

Purpose:
- integrations থেকে orchestration layer-এ যাওয়ার জন্য shared trigger event shape define করা

Constants:
- `TRIGGER_EVENT_KINDS`

Main types:
- `TriggerEventKind`
- `TriggerEvent`

Function-by-Function Why:
- `createTriggerEvent(input)`
  - shared trigger event immutable-ish clone contract দেয়
  - payload copy করে caller mutation leak কমায়

### `packages/integrations/src/telegram/telegram-trigger.ts`

Purpose:
- normalized Telegram incoming message কে shared trigger event-এ map করা

Constants:
- `TELEGRAM_MESSAGE_RECEIVED_EVENT`

Function-by-Function Why:
- `createTelegramTriggerEvent(message, now?)`
  - Telegram message metadata থেকে trigger event build করে
  - `kind = telegram`
  - `eventName = telegram.message.received`
  - `sourceId = chatId`
  - payload-এ chat/message/text/user fields দেয়

### `packages/core/src/index.ts`

Purpose:
- shared trigger contract core package API-তে expose করা

### `packages/integrations/src/telegram/index.ts`

Purpose:
- Telegram trigger mapper integration API-তে expose করা

### `tests/unit/telegram-trigger.test.ts`

Purpose:
- Telegram message shared trigger contract-এ ঠিকমতো map হচ্ছে কিনা verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-adapter.test.ts tests/unit/telegram-trigger.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `2` test files passed
- typecheck clean

## Next Safe Step

`M11-S4`: connector tests with fixtures add করা।
