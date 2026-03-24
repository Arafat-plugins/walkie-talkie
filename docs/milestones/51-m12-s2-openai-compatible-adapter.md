# M12-S2: OpenAI-Compatible Adapter

## Goal

AI provider contract-এর পরে first concrete adapter implement করা, but network-hardcoded না করে transport-injected shape-এ।

## Changed Files

- `packages/integrations/src/ai/openai-compatible-adapter.ts`
- `packages/integrations/src/ai/index.ts`
- `tests/unit/openai-compatible-adapter.test.ts`

## What Was Added

### `packages/integrations/src/ai/openai-compatible-adapter.ts`

Purpose:
- OpenAI-compatible request payload build করা
- raw provider response normalize করা
- transport-injected provider adapter expose করা

Main types:
- `OpenAiCompatiblePayload`
- `OpenAiCompatibleRawResponse`
- `OpenAiCompatibleTransport`

Function-by-Function Why:
- `buildOpenAiCompatiblePayload(request)`
  - shared completion request কে provider-specific payload-এ convert করে
  - model, temperature, messages cleanভাবে forward করে
- `mapOpenAiCompatibleResponse(request, raw)`
  - raw response থেকে first assistant text extract করে
  - shared `AiCompletionResponse` shape-এ normalize করে
- `createOpenAiCompatibleProvider({ config, transport })`
  - adapter instance তৈরি করে
  - request normalize করে
  - injected transport call করে
  - normalized response return করে

Why transport injection:
- current milestone-এ real network dependency avoid করা
- tests deterministic রাখা
- next step-এ timeout/error normalization সহজ করা

### `packages/integrations/src/ai/index.ts`

Purpose:
- OpenAI-compatible adapter package API-তে expose করা

### `tests/unit/openai-compatible-adapter.test.ts`

Purpose:
- payload building verify করা
- raw response mapping verify করা
- provider adapter transport delegation verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts tests/unit/openai-compatible-adapter.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `2` test files passed
- typecheck clean

## Next Safe Step

`M12-S3`: timeout/error normalization add করা।
