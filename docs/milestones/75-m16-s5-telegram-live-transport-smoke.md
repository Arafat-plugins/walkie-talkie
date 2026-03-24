# M16-S5: Telegram Live Transport Smoke Tests

## Goal

Live Telegram transport piecesগুলো mocked network fixtures দিয়ে smoke coverage-এ lock করা।

## Changed Files

- `tests/fixtures/telegram/get-updates-response.json`
- `tests/fixtures/telegram/send-message-response.json`
- `tests/integration/telegram-live-transport-smoke.test.ts`

## What Was Added

### `tests/fixtures/telegram/get-updates-response.json`

Purpose:
- realistic Bot API `getUpdates` envelope fixture
- valid message update + ignored callback update together carry করে

### `tests/fixtures/telegram/send-message-response.json`

Purpose:
- realistic Bot API `sendMessage` delivered-message envelope fixture

### `tests/integration/telegram-live-transport-smoke.test.ts`

Purpose:
- fixture-driven smoke coverage add করা for live Telegram transport slice

Covered:
- mocked `getUpdates` response -> Bot API client -> polling runner
- polling runner -> trigger -> orchestration -> run history
- mocked `sendMessage` response -> delivered message normalization
- transport payload shapes remain stable

Why this matters:
- Telegram live transport path now has:
  - config contract
  - Bot API client
  - polling runner
  - webhook handler
  - fixture-driven smoke coverage

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/telegram-bot-api.test.ts tests/unit/telegram-adapter.test.ts tests/unit/telegram-runtime-config.test.ts tests/integration/telegram-polling-runner.integration.test.ts tests/integration/telegram-webhook-handler.integration.test.ts tests/integration/telegram-live-transport-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `6` Telegram tests passed
- root typecheck clean

## Milestone Outcome

`M16` is now done.

What is now available:
- live-mode Telegram runtime contract
- Bot API client boundary
- polling runner orchestration handoff
- webhook handler boundary
- mocked transport smoke coverage

## Next Safe Step

`M17-S1`: live HTTP transport contract for AI providers define করা।
