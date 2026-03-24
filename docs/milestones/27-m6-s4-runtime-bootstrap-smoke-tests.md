# M6-S4: Runtime Bootstrap Smoke Tests

## Goal

Runtime bootstrap path-কে more realistic end-to-end smoke coverage দেওয়া: config write -> bootstrap -> summary rendering।

## Changed Files

- `tests/integration/runtime-bootstrap-smoke.test.ts`

## What Was Added

### `tests/integration/runtime-bootstrap-smoke.test.ts`

Smoke scenarios:
- valid temp config file written to temp project dir
- `bootstrapRuntime(tempDir)` run
- `buildRuntimeBootstrapSummary(result)` checked
- missing config path failure summary checked

Why this matters:
- unit tests individual functions cover করছিল
- এই smoke test full mini runtime flow lock করে
- runtime package + config package integration confidence বাড়ায়

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/runtime-bootstrap.test.ts tests/unit/config-parser.test.ts tests/unit/config-store.test.ts tests/unit/config-secrets.test.ts tests/integration/runtime-bootstrap-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## M6 Outcome

After `M6`, runtime foundation now has:
- bootstrap entry
- readiness verification
- readiness summary contract
- smoke coverage for full bootstrap path

This is enough to move into `M7` agent registry work without runtime config ambiguity.

## Next Safe Step

`M7-S1`: agent contracts define করা।
