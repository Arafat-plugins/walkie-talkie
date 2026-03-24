# M5-S5: Valid and Invalid Config Coverage

## Goal

Config layer-এর parser, persistence, আর secret handling-এ broader valid/invalid scenarios cover করা, যাতে `M5` close করার আগে core config behavior locked থাকে।

## Changed Files

- `tests/unit/config-parser.test.ts`
- `tests/unit/config-store.test.ts`
- `tests/unit/config-secrets.test.ts`

## What Was Added

### `tests/unit/config-parser.test.ts`

Added coverage for:
- valid object validation
- missing required sections/fields
- invalid enum values for trigger/environment/logLevel
- malformed JSON parse failure
- valid JSON round-trip through `parseAndValidateConfig`
- schema file JSON integrity

Why this matters:
- parser layer শুধু happy-path না, broken config shapes-ও catch করছে কিনা verify হয়

### `tests/unit/config-store.test.ts`

Added coverage for:
- deterministic serialization
- write + validated load success path
- invalid config content on disk
- malformed JSON file on disk
- missing file path

Why this matters:
- real file IO path broken হলে caller clear issues পাবে কিনা lock হয়

### `tests/unit/config-secrets.test.ts`

Added coverage for:
- secret path registry correctness
- deterministic masking output
- non-mutating redaction
- secret presence summary for set এবং unset states

Why this matters:
- secret handling layer safe display contract ধরে রাখে

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/config-parser.test.ts tests/unit/config-store.test.ts tests/unit/config-secrets.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## M5 Outcome

After this step, `M5` now has:
- config schema
- parser + validator
- writer + reader
- initial secret handling strategy
- broader valid/invalid coverage

This gives us a stable base to start runtime bootstrap in `M6`.

## Next Safe Step

`M6-S1`: `packages/runtime`-এ runtime bootstrap entry create করা।
