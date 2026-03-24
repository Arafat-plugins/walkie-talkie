# M15-S2: Failure Report Objects

## Goal

Reliability layer-এ reusable failure object add করা, যাতে runtime, provider, dependency, আর future retry/audit work একি normalized shape use করতে পারে।

## Changed Files

- `packages/logging/src/failure-report.ts`
- `packages/logging/src/index.ts`
- `tests/unit/failure-report.test.ts`

## What Was Added

### `packages/logging/src/failure-report.ts`

Purpose:
- failures-এর জন্য shared structured object define করা
- failure -> log entry mapping সহজ করা
- retryability and cause information standardize করা

Main constants and types:
- `FAILURE_REPORT_SOURCES`
- `FAILURE_REPORT_LEVELS`
- `FailureReportSource`
- `FailureReportLevel`
- `FailureReportMetadata`
- `FailureReportCause`
- `FailureReport`

Function-by-Function Why:
- `createFailureReport(input)`
  - timestamped normalized failure object বানায়
  - default level `error` set করে
  - `retryable` default `false` রাখে
  - context/cause metadata clone করে mutation leak কমায়
- `toFailureLogEntry(report)`
  - failure report কে standardized log entry-তে convert করে
  - later logger implementations সরাসরি use করতে পারবে
- `buildFailureReportSummary(report)`
  - readable summary lines দেয়
  - CLI/debug/dashboard/audit previews-এ useful

Current sources:
- `runtime`
- `pipeline`
- `provider`
- `integration`
- `config`
- `dependency`
- `unknown`

### `packages/logging/src/index.ts`

Purpose:
- failure report APIs logging package root-এ expose করা

### `tests/unit/failure-report.test.ts`

Purpose:
- normalized failure object verify করা
- failure -> log mapping verify করা
- readable summary lines verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/log-contract.test.ts tests/unit/failure-report.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `2` test files passed
- root typecheck clean

## Next Safe Step

`M15-S3`: retry policy interface prepare করা।
