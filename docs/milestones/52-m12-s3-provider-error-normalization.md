# M12-S3: Provider Error Normalization

## Goal

AI adapter failures provider-specific exception shape-এ leak না করে stable normalized error contract-এ আনতে।

## Changed Files

- `packages/integrations/src/ai/provider-contract.ts`
- `packages/integrations/src/ai/openai-compatible-adapter.ts`
- `tests/unit/openai-compatible-adapter.test.ts`

## What Was Added

### `packages/integrations/src/ai/provider-contract.ts`

Purpose:
- shared AI error contract define করা

Main types:
- `AiProviderErrorCode`
- `AiProviderError`

Error codes currently supported:
- `timeout`
- `transport`
- `response`

### `packages/integrations/src/ai/openai-compatible-adapter.ts`

Purpose:
- timeout/transport/response failures normalized করা

Function-by-Function Why:
- `createAiProviderError(input)`
  - normalized error details clone helper
- `AiProviderFailure`
  - adapter layer-এর standard error class
  - `details` property-তে stable machine-readable error data রাখে
- `mapOpenAiCompatibleResponse(request, raw)`
  - response-এ assistant text missing হলে `response` failure throw করে
- `withProviderTimeout(action, timeoutMs, providerId)`
  - provider request timeout wrap করে
  - timeout হলে normalized `timeout` failure throw করে
- `createOpenAiCompatibleProvider({ config, transport, timeoutMs })`
  - transport error catch করে
  - unknown transport failure কে normalized `transport` failure-এ convert করে

Why this matters:
- later orchestration layer simple `AiProviderFailure` handle করতে পারবে
- provider-specific or transport-specific raw error directly leak হবে না

### `tests/unit/openai-compatible-adapter.test.ts`

Purpose:
- missing assistant text -> `response` failure verify করা
- timeout -> `timeout` failure verify করা
- thrown transport error -> `transport` failure verify করা

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

`M12-S4`: tests and mock fixtures add করা।
