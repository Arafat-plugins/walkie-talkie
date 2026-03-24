# M5-S4: Initial Secrets Handling Strategy

## Goal

Config system-এ secret fields explicitভাবে identify করা, display-safe masked output দেওয়া, আর config-related logging/inspection-এ raw secrets accidental print হওয়া কমানো।

## Changed Files

- `packages/config/src/secrets.ts`
- `packages/config/src/index.ts`
- `tests/unit/config-secrets.test.ts`

## What Was Added

### `packages/config/src/secrets.ts`

Purpose:
- known secret fields centralize করা
- secret values display-safe form-এ mask করা
- config object redacted copy generate করা
- secret presence summary build করা

Function-by-Function Why:
- `SECRET_CONFIG_PATHS`
  - কোন config fields secret হিসেবে treat হবে সেটা one source-of-truth এ রাখে
  - next step-এ writer/reader/runtime/logging same registry reuse করতে পারবে
- `isSecretConfigPath(path)`
  - caller কোনো field secret category-তে পড়ে কিনা দ্রুত check করতে পারে
- `maskSecretValue(value)`
  - raw secret না দেখিয়ে stable masked string দেয়
  - debugging/logging-এ “set আছে” বোঝা যায়, full value leak হয় না
- `redactConfigSecrets(config)`
  - display/logging-এর জন্য safe config clone দেয়
  - original config mutate করে না
- `buildSecretPresenceSummary(config)`
  - কোন known secret set আছে/নেই সেটা boolean summary আকারে দেয়
  - onboarding/runtime readiness summary-তে useful হবে

Internal helpers:
- `isRecord`
  - nested object traversal safe করে
- `cloneRecord`
  - deep-ish clone বানিয়ে redaction non-mutating রাখে
- `getNestedValue`
  - dotted path থেকে value resolve করে
- `setNestedValue`
  - dotted path target-এ masked value set করে

### `tests/unit/config-secrets.test.ts`

Purpose:
- known secret path registry ঠিক আছে কিনা
- mask output deterministic কিনা
- redact function original config mutate করছে কিনা
- presence summary correct কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/config-parser.test.ts tests/unit/config-store.test.ts tests/unit/config-secrets.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Safety Boundary

This step does not encrypt secrets yet.

What it does now:
- registered secret fields centrally track করে
- raw secret display avoid করতে masked copy দেয়
- summary use-case এ only presence signal দেয়

What remains for later:
- env/file split strategy
- encryption or external secret store
- CLI/runtime logging integration everywhere

## Next Safe Step

`M5-S5`: valid/invalid config scenarios cover করে broader tests add করা, then `M5` close করা।
