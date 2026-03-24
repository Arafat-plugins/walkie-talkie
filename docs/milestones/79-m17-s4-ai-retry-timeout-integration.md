# M17-S4: AI Retry and Timeout Integration

## Goal

Shared reliability contracts use করে AI transport retry behavior wire করা, while existing timeout normalization intact রাখা.

## Changed Files

- `packages/integrations/src/ai/openai-compatible-adapter.ts`
- `tests/unit/openai-compatible-adapter.test.ts`

## What Was Added

### `packages/integrations/src/ai/openai-compatible-adapter.ts`

Purpose:
- provider adapter-এ retry + timeout behavior একসাথে compose করা

Main additions:
- `withProviderRetry(...)`
  - shared `RetryPolicy` create করে
  - retryable `AiProviderFailure` হলে backoff delay apply করে
  - non-retryable failure হলে immediately stop করে
- `toRetryableFailureReport(...)`
  - adapter failure -> shared `FailureReport` shape map করে
  - `transport` and `timeout` failures retryable mark করে
  - `response` failures non-retryable রাখে
- `createOpenAiCompatibleProvider(...)`
  - new optional inputs:
    - `retryPolicy?`
    - `onDelay?`
  - `withProviderRetry(...)` দিয়ে transport execution wrap করে
  - existing `withProviderTimeout(...)` logic inside retried execution রাখে

Why this matters:
- provider transport failure handling এখন shared reliability layer-এর সাথে aligned
- retry policy later runtime/provider orchestration-এ reuse করা easier
- malformed provider responses unnecessarily retry হয় না

### `tests/unit/openai-compatible-adapter.test.ts`

Purpose:
- retry success path verify করা
- non-retryable response failure path verify করা

Coverage added:
- retryable `transport` failure one retry পরে success করে
- configured delay hook expected backoff value receive করে
- invalid response shape retry না করে first failure-তেই stop করে

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/retry-policy.test.ts tests/unit/openai-compatible-adapter.test.ts tests/unit/runtime-ai-provider.test.ts tests/unit/openai-compatible-http-transport.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` test files passed
- root typecheck clean

## Next Safe Step

`M17-S5`: Add live adapter smoke tests with mocked HTTP fixtures.
