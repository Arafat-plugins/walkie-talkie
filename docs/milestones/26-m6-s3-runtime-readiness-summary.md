# M6-S3: Runtime Readiness Summary

## Goal

Runtime bootstrap result থেকে deterministic human-readable summary lines generate করা, যাতে CLI, logs, এবং future dashboard same startup contract reuse করতে পারে।

## Changed Files

- `packages/runtime/src/bootstrap.ts`
- `tests/unit/runtime-bootstrap.test.ts`

## What Was Added

### `packages/runtime/src/bootstrap.ts`

New function:
- `buildRuntimeBootstrapSummary(result)`

Purpose:
- runtime bootstrap result কে display-ready text lines-এ convert করা
- success/failure দুই path-এই deterministic output রাখা

Function Why:
- `buildRuntimeBootstrapSummary(result)`
  - caller-কে summary render logic duplicate করতে দেয় না
  - ready হলে project/trigger/environment show করে
  - blocked হলে issue list show করে

Summary behavior:
- always includes config path
- success path:
  - `Runtime readiness: ready`
  - project
  - trigger
  - environment
- failure path:
  - `Runtime readiness: blocked`
  - issue lines

### `tests/unit/runtime-bootstrap.test.ts`

Added coverage for:
- summary output on successful bootstrap result
- summary output on failed bootstrap result

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/runtime-bootstrap.test.ts tests/unit/config-parser.test.ts tests/unit/config-store.test.ts tests/unit/config-secrets.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Why This Matters

Later we will need the same runtime status in multiple places:
- CLI output
- runtime command output
- dashboard status panel

This summary function keeps that contract centralized.

## Next Safe Step

`M6-S4`: bootstrap smoke tests add করা, then `M6` close করা।
