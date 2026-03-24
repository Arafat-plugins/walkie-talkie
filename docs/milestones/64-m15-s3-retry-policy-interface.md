# M15-S3: Retry Policy Interface

## Goal

Retry execution engine বানানোর আগে shared retry policy contract define করা, যাতে provider/runtime/integration failures later same interface দিয়ে retry decision নিতে পারে।

## Changed Files

- `packages/logging/src/retry-policy.ts`
- `packages/logging/src/index.ts`
- `tests/unit/retry-policy.test.ts`

## What Was Added

### `packages/logging/src/retry-policy.ts`

Purpose:
- retry behavior-এর shared configuration shape define করা
- delay calculation helper add করা
- failure report থেকে retry decision নেওয়ার base helper provide করা

Main constants and types:
- `RETRY_BACKOFF_STRATEGIES`
- `RetryBackoffStrategy`
- `RetryPolicy`
- `RetryAttemptContext`
- `RetryDecision`

Function-by-Function Why:
- `createRetryPolicy(input?)`
  - deterministic defaults দেয়
  - later callers partial config দিলেও clean full policy পায়
- `computeRetryDelayMs(context)`
  - `fixed` vs `exponential` backoff delay calculate করে
  - optional `maxDelayMs` clamp apply করে
- `shouldRetryFailure(context)`
  - failure retryable কিনা, max attempts hit হয়েছে কিনা, source/code filters match করে কিনা check করে
  - normalized retry decision return করে

Important boundary:
- এই step retry loop execute করে না
- শুধু interface + decision helpers দেয়
- later implementation এই contract reuse করবে

### `packages/logging/src/index.ts`

Purpose:
- retry policy APIs logging package root-এ expose করা

### `tests/unit/retry-policy.test.ts`

Purpose:
- default policy verify করা
- delay calculation verify করা
- retry decision rules verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/log-contract.test.ts tests/unit/failure-report.test.ts tests/unit/retry-policy.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` test files passed
- root typecheck clean

## Next Safe Step

`M15-S4`: audit event model and storage interface add করা।
