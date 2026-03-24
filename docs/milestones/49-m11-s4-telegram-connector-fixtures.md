# M11-S4: Telegram Connector Fixtures

## Goal

Telegram connector chain realistic fixture payload দিয়ে verify করা, যাতে integration milestone close করার আগে parser + mode + trigger mapping একসাথে green থাকে।

## Changed Files

- `tests/fixtures/telegram/message-update.json`
- `tests/fixtures/telegram/callback-update.json`
- `tests/integration/telegram-connector-smoke.test.ts`

## What Was Added

### `tests/fixtures/telegram/message-update.json`

Purpose:
- normal Telegram message update payload fixture

### `tests/fixtures/telegram/callback-update.json`

Purpose:
- unsupported update shape fixture
- adapter ignore path verify করার জন্য

### `tests/integration/telegram-connector-smoke.test.ts`

Purpose:
- raw JSON fixture load করে adapter + trigger mapper + reply builder একসাথে verify করা

Covered scenarios:
- webhook mode:
  - fixture load
  - `adapter.receive()`
  - `createTelegramTriggerEvent()`
  - `adapter.createReply()`
- polling mode:
  - unsupported fixture ignored
  - delivery config preserved

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-adapter.test.ts tests/unit/telegram-trigger.test.ts tests/integration/telegram-connector-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` test files passed
- typecheck clean

## Next Safe Step

`M12-S1`: provider interface define করা।
