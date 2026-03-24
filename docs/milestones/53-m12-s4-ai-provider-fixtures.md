# M12-S4: AI Provider Fixtures

## Goal

AI adapter layer realistic mock fixtures দিয়ে verify করা, যাতে provider contract + adapter + error normalization একসাথে green থাকে।

## Changed Files

- `tests/fixtures/ai/openai-compatible-request.json`
- `tests/fixtures/ai/openai-compatible-response.json`
- `tests/integration/ai-provider-smoke.test.ts`

## What Was Added

### `tests/fixtures/ai/openai-compatible-request.json`

Purpose:
- realistic OpenAI-compatible completion request fixture

### `tests/fixtures/ai/openai-compatible-response.json`

Purpose:
- realistic provider response fixture

### `tests/integration/ai-provider-smoke.test.ts`

Purpose:
- fixture request -> provider adapter -> transport -> normalized response path verify করা

Covered scenarios:
- success path:
  - request fixture load
  - payload build
  - transport delegation
  - normalized response
- failure path:
  - invalid response shape
  - normalized `response` failure

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts tests/unit/openai-compatible-adapter.test.ts tests/integration/ai-provider-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` test files passed
- typecheck clean

## Next Safe Step

`M13-S1`: trigger -> pipeline -> agent/skill connect করা।
