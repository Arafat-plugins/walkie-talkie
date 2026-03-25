# Real Test Patch: Telegram Poll-Once Command

## What changed

- added fetch-based Telegram Bot API transport
- added fetch-based Telegram Bot API client factory
- added CLI command:
  - `telegram:poll-once`
- added workspace script:
  - `npm run telegram:poll:once`
- added integration coverage for one-shot live-style polling

## Why this patch exists

The Telegram live transport boundary was already implemented, but there was still no thin runnable command that let us perform a practical real-test cycle from local config and persistent runtime state.

This patch adds that missing bridge.

## Current behavior

The command:

- bootstraps persistent runtime state from disk
- creates a fetch-based Telegram Bot API client from saved config
- runs one `getUpdates` polling cycle
- routes supported updates into configured orchestration
- persists updated run history back to runtime storage

## Current limitation

This patch does not yet auto-send a Telegram reply from final pipeline output.

It is focused on:

- real update ingestion
- real orchestration handoff
- persisted runtime evidence

## Verification

Verified with:

```bash
node --test --experimental-strip-types tests/unit/telegram-bot-api.test.ts tests/unit/telegram-bot-api-fetch.test.ts tests/integration/telegram-poll-once.command.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

## Tracker impact

- main roadmap step remains unchanged
- this is a practical real-test capability patch
