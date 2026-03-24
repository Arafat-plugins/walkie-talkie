# M16-S3: Telegram Polling Runner

## Goal

Real `getUpdates()` output কে Telegram message trigger-এ map করে configured runtime orchestration-এ handoff করা।

## Changed Files

- `packages/integrations/src/telegram/telegram-polling-runner.ts`
- `packages/integrations/src/telegram/index.ts`
- `tests/integration/telegram-polling-runner.integration.test.ts`

## What Was Added

### `packages/integrations/src/telegram/telegram-polling-runner.ts`

Purpose:
- live Telegram polling cycle-এর first end-to-end runner boundary add করা

Main types:
- `TelegramPollingCursor`
- `TelegramPollingCycleResult`
- `TelegramPollingRunner`
- `TelegramPollingRunnerInput`

Main behavior:
- `createTelegramPollingRunner(input)`
  - polling-mode runner returns
- `pollOnce(cursor?)`
  - runtime telegram config normalize করে
  - disabled হলে skip করে
  - webhook mode হলে skip করে
  - Bot API client দিয়ে `getUpdates()` call করে
  - adapter দিয়ে incoming update normalize করে
  - valid message হলে trigger event create করে
  - `executeConfiguredTriggerPipelineWithHistory(...)` call করে
  - update ids track করে
  - next offset compute করে

Why this matters:
- live Telegram transport এখন শুধু parsing skeleton না
- first real handoff path now exists:
  - Telegram update
  - message normalization
  - trigger creation
  - config-driven orchestration
  - run history recording

### `packages/integrations/src/telegram/index.ts`

Purpose:
- polling runner integration API root-এ expose করা

### `tests/integration/telegram-polling-runner.integration.test.ts`

Purpose:
- polling runner actually orchestration run trigger করে কিনা verify করা

Covered:
- `getUpdates()` payload offset/timeout mapping
- valid update execution
- unsupported update ignore
- next offset advance
- history store entry
- disabled mode skip
- webhook mode skip

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-bot-api.test.ts tests/unit/telegram-adapter.test.ts tests/unit/telegram-runtime-config.test.ts tests/integration/telegram-polling-runner.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` Telegram tests passed
- root typecheck clean

## Next Safe Step

`M16-S4`: webhook mode contract and handler boundary add করা।
