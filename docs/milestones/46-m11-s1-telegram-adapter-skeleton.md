# M11-S1: Telegram Adapter Skeleton

## Goal

Telegram integration milestone শুরু করার smallest useful step ছিল incoming update normalize করা আর outgoing reply contract build করা।

## Changed Files

- `packages/integrations/src/telegram/telegram-adapter.ts`
- `packages/integrations/src/telegram/index.ts`
- `packages/integrations/src/index.ts`
- `tests/unit/telegram-adapter.test.ts`

## What Was Added

### `packages/integrations/src/telegram/telegram-adapter.ts`

Purpose:
- Telegram update payload থেকে minimal incoming message shape বের করা
- outgoing reply message contract build করা

Constants:
- `TELEGRAM_ADAPTER_KIND`

Main types:
- `TelegramIncomingMessage`
- `TelegramOutgoingMessage`
- `TelegramAdapter`

Function-by-Function Why:
- `normalizeIncomingTelegramUpdate(update)`
  - raw Telegram payload inspect করে
  - current system-এর জন্য দরকারি minimum fields বের করে
  - unsupported update হলে `null` দেয়
- `createTelegramAdapter()`
  - package-level adapter skeleton দেয়
  - `receive()` দিয়ে incoming update normalize করে
  - `createReply()` দিয়ে reply payload বানায়

Current boundary:
- webhook/polling logic এখনো নেই
- trigger contract mapping এখনো নেই
- real HTTP transport এখনো নেই

### `packages/integrations/src/telegram/index.ts`

Purpose:
- Telegram integration API re-export করা

### `packages/integrations/src/index.ts`

Purpose:
- integrations package root API expose করা

### `tests/unit/telegram-adapter.test.ts`

Purpose:
- valid update normalize verify করা
- unsupported update reject verify করা
- adapter receive/reply skeleton methods verify করা

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

`M11-S2`: webhook/polling mode abstraction add করা।
