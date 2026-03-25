# Quick Test Patch: Telegram Seed And Poll Loop

## What changed

- added built-in Telegram machine assistant skill
- added built-in skill rebinding for persisted runtime state
- added seed command:
  - `telegram:seed-local-machine`
- added continuous polling command:
  - `telegram:poll`
- updated quick test instructions in `README.md`

## Why this patch exists

The user needs a same-day real Telegram test path.

That requires more than raw transport boundaries:

- a ready agent
- a ready pipeline
- a ready skill
- a way to restore built-in handlers after persistence
- a way to keep polling continuously

This patch adds that practical layer.

## New commands

From project root:

```bash
npm run telegram:seed:local-machine
npm run telegram:poll:once
npm run telegram:poll
```

## Seeded flow

The seed command creates and persists:

- `telegram-local-machine-agent`
- `telegram-machine-assistant-skill`
- `telegram-local-machine-pipeline`

It also ensures config flow binding points Telegram message events to the seeded pipeline.

## Machine assistant behavior

The built-in Telegram machine assistant currently focuses on:

- installed checks
- version requests
- natural reply generation from local facts

It can use the default AI provider to make the final reply more natural.

## Verification

Verified with:

```bash
node --test --experimental-strip-types tests/unit/telegram-machine-assistant-skill.test.ts tests/unit/builtin-skills.test.ts tests/integration/telegram-seed-local-machine.command.integration.test.ts tests/integration/telegram-polling-runner.integration.test.ts tests/integration/telegram-live-transport-smoke.test.ts tests/integration/telegram-poll-once.command.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```
