# M16-S1: Telegram Runtime Config Contract

## Goal

Live Telegram transport milestone-এর first safe step হিসেবে secret আর runtime knobs আলাদা করে explicit config contract define করা।

## Changed Files

- `packages/integrations/src/telegram/telegram-runtime-config.ts`
- `packages/integrations/src/telegram/index.ts`
- `packages/config/src/schema.ts`
- `packages/config/src/config-parser.ts`
- `packages/runtime/src/readiness.ts`
- `config/schema/walkie-talkie.config.schema.json`
- `tests/unit/config-parser.test.ts`
- `tests/unit/runtime-bootstrap.test.ts`
- `tests/unit/telegram-runtime-config.test.ts`

## What Was Added

### `packages/integrations/src/telegram/telegram-runtime-config.ts`

Purpose:
- live Telegram mode-এর runtime knobs one place-এ formalize করা

Main type:
- `TelegramRuntimeConfig`

Main helper:
- `createTelegramRuntimeConfig(input?)`
  - `enabled` default করে
  - existing delivery defaults reuse করে
  - optional webhook/public URL fields preserve করে

Why this matters:
- secret token থাকে `providers.telegram.botToken`-এ
- runtime behavior থাকে `runtime.telegram` block-এ
- later polling runner / webhook handler clean contract পাবে

### `packages/config/src/schema.ts`

Purpose:
- `WalkieTalkieConfig` type-এ new `runtime.telegram` block add করা

Added fields:
- `enabled?`
- `delivery?`
  - `mode`
  - `webhookPath?`
  - `pollingIntervalMs?`
- `publicBaseUrl?`
- `webhookSecretToken?`

### `packages/config/src/config-parser.ts`

Purpose:
- new Telegram runtime config validate করা

Validation added:
- `runtime.telegram` must be an object
- `enabled` must be boolean
- `delivery.mode` must be `webhook` or `polling`
- `webhookPath` must be non-empty string if present
- `pollingIntervalMs` must be positive integer if present
- `publicBaseUrl` / `webhookSecretToken` must be non-empty strings if present
- `publicBaseUrl` becomes required when delivery mode is `webhook`

### `packages/runtime/src/readiness.ts`

Purpose:
- runtime start gate-এ webhook-specific requirement reflect করা

Behavior change:
- telegram primary trigger + webhook delivery mode now also requires:
  - `runtime.telegram.publicBaseUrl`

### `config/schema/walkie-talkie.config.schema.json`

Purpose:
- JSON Schema source-of-truth-এ same `runtime.telegram` contract reflect করা

### Tests

#### `tests/unit/config-parser.test.ts`

Added coverage for:
- valid polling-mode Telegram runtime config
- invalid Telegram runtime fields
- webhook mode requiring public base URL

#### `tests/unit/runtime-bootstrap.test.ts`

Added coverage for:
- readiness failure when Telegram webhook mode is configured without `publicBaseUrl`

#### `tests/unit/telegram-runtime-config.test.ts`

Added coverage for:
- polling defaults
- webhook-specific runtime config preservation

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/config-parser.test.ts tests/unit/runtime-bootstrap.test.ts tests/unit/telegram-adapter.test.ts tests/unit/telegram-runtime-config.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` test files passed
- root typecheck clean

## Next Safe Step

`M16-S2`: Telegram Bot API client for send/poll operations implement করা।
