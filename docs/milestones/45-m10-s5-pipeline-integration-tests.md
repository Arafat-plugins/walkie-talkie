# M10-S5: Pipeline Integration Tests

## Goal

Pipeline contract, sequential path, branching path, এবং execution report helpers একসাথে stableভাবে কাজ করছে কিনা integration layer-এ verify করা।

## Changed Files

- `tests/integration/pipeline-engine-smoke.test.ts`

## What Was Added

### `tests/integration/pipeline-engine-smoke.test.ts`

Purpose:
- pipeline core pieces একসাথে real usage shape-এ verify করা

Covered scenarios:
- linear pipeline:
  - graph define
  - sequential path resolve
  - execution report build
  - per-step completion
  - final success state
- branching pipeline:
  - graph define
  - branch discovery
  - linear prefix capture
  - branch options capture

Why this matters:
- unit tests আলাদা helpers verify করে
- এই smoke test দেখায় current pipeline package minimal orchestration chain হিসেবে usable

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/pipeline-contracts.test.ts tests/unit/pipeline-sequential-path.test.ts tests/unit/pipeline-branching-path.test.ts tests/unit/pipeline-execution-report.test.ts tests/integration/pipeline-engine-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `5` tests passed
- typecheck clean

## Next Safe Step

`M11-S1`: Telegram adapter skeleton create করা।
