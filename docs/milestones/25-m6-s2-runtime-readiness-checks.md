# M6-S2: Runtime Readiness Checks

## Goal

Config file structurally valid হলেও runtime start-এর জন্য required trigger-specific settings আছে কিনা verify করা।

## Changed Files

- `packages/runtime/src/readiness.ts`
- `packages/runtime/src/bootstrap.ts`
- `packages/runtime/src/index.ts`
- `tests/unit/runtime-bootstrap.test.ts`

## What Was Added

### `packages/runtime/src/readiness.ts`

Purpose:
- runtime-specific readiness rules centralize করা
- config validation-এর বাইরে startup requirements enforce করা

Function-by-Function Why:
- `verifyRuntimeReadiness(config)`
  - runtime start-এর আগে critical config requirements check করে
  - current rules:
    - default AI apiKey present থাকতে হবে
    - `primaryTrigger === "telegram"` হলে `telegram.botToken` লাগবে
  - result union return করে so caller clear branching করতে পারে
- `pushIssue(...)`
  - readiness issue collection consistent রাখে

Types:
- `RuntimeReadinessIssue`
  - startup-blocking issue contract
- `RuntimeReadinessResult`
  - `ready: true/false` shape

### `packages/runtime/src/bootstrap.ts`

Change:
- `bootstrapRuntime()` এখন config load-এর পর `verifyRuntimeReadiness()` call করে
- structurally valid config কিন্তু missing trigger-specific requirement থাকলে bootstrap fail করে

### `packages/runtime/src/index.ts`

Purpose:
- readiness API export করা

### `tests/unit/runtime-bootstrap.test.ts`

Added coverage for:
- readiness pass for CLI trigger
- readiness fail for Telegram trigger without bot token
- bootstrap fail when readiness rule is violated

## Key Rule Introduced

`config valid` মানেই `runtime ready` না।

Example:
- config JSON shape valid
- but `primaryTrigger = telegram`
- and `providers.telegram.botToken` missing
- then runtime should fail before start

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/runtime-bootstrap.test.ts tests/unit/config-parser.test.ts tests/unit/config-store.test.ts tests/unit/config-secrets.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Next Safe Step

`M6-S3`: runtime readiness summary print contract add করা।
