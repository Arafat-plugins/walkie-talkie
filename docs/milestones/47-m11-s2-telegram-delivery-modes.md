# M11-S2: Telegram Delivery Modes

## Goal

Telegram adapter parsing/reply logic-এর সাথে transport strategy mix না করে webhook/polling mode abstraction add করা।

## Changed Files

- `packages/integrations/src/telegram/telegram-delivery-mode.ts`
- `packages/integrations/src/telegram/telegram-adapter.ts`
- `packages/integrations/src/telegram/index.ts`
- `tests/unit/telegram-adapter.test.ts`

## What Was Added

### `packages/integrations/src/telegram/telegram-delivery-mode.ts`

Purpose:
- Telegram transport mode contract define করা
- mode-specific defaults deterministicভাবে apply করা

Constants:
- `TELEGRAM_DELIVERY_MODES`

Main types:
- `TelegramDeliveryMode`
- `TelegramDeliveryConfig`

Function-by-Function Why:
- `createTelegramDeliveryConfig(input?)`
  - explicit mode না দিলে `polling` default দেয়
  - `webhook` mode হলে default webhook path set করে
  - `polling` mode হলে default polling interval set করে

### `packages/integrations/src/telegram/telegram-adapter.ts`

Purpose:
- adapter skeleton-এ delivery config attach করা

Function-by-Function Why:
- `createTelegramAdapter(input?)`
  - adapter create করার সময় delivery config normalize করে
  - transport choice adapter boundary-তে expose করে
  - receive/reply behavior unchanged রাখে

### `packages/integrations/src/telegram/index.ts`

Purpose:
- delivery mode helpers package API-তে expose করা

### `tests/unit/telegram-adapter.test.ts`

Purpose:
- adapter default delivery config verify করা
- mode-specific defaults verify করা
- explicit webhook config verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-adapter.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `1` test file passed
- typecheck clean

## Next Safe Step

`M11-S3`: incoming Telegram message কে trigger contract-এ map করা।
