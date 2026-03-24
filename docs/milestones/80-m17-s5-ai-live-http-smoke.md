# M17-S5: AI Live HTTP Smoke Tests

## Goal

Mocked HTTP fixtures use করে real fetch transport, provider adapter, and runtime wiring end-to-end smoke coverage add করা.

## Changed Files

- `tests/integration/ai-live-http-transport-smoke.test.ts`

## What Was Added

### `tests/integration/ai-live-http-transport-smoke.test.ts`

Purpose:
- live-style AI transport path mocked fetch দিয়ে verify করা
- runtime-wired provider path and retry recovery path দুইটাই prove করা

Coverage added:
- `createRuntimeDefaultAiProvider(...)`
  - saved config -> default provider binding
  - fetch-based transport -> `/chat/completions`
  - normalized AI completion response
- `createOpenAiCompatibleProvider(...)` + `createFetchOpenAiCompatibleTransport(...)`
  - first fetch attempt throws transport error
  - shared retry policy retries once
  - second fetch attempt returns fixture response
  - final normalized response succeeds

Why this matters:
- AI runtime path এখন শুধু unit-level না, integration smoke level-এও locked
- config wiring, HTTP transport, adapter normalization, and retry composition একসাথে verify হচ্ছে
- next persistence milestone-এ যাওয়ার আগে live AI boundary safer হলো

## Fixtures Used

- `tests/fixtures/ai/openai-compatible-request.json`
- `tests/fixtures/ai/openai-compatible-response.json`

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts tests/unit/ai-http-transport.test.ts tests/unit/openai-compatible-adapter.test.ts tests/unit/openai-compatible-http-transport.test.ts tests/unit/runtime-ai-provider.test.ts tests/integration/ai-provider-smoke.test.ts tests/integration/ai-live-http-transport-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `7` AI/unit+integration test files passed
- root typecheck clean

## Next Safe Step

`M18-S1`: Define storage contracts for entities, runs, and audit data.
