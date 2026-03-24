# M5-S2: Config Parser and Validator

## Goal

`packages/config`-এ এমন parser + validator add করা, যাতে onboarding/config file থেকে আসা raw JSON string safe ভাবে parse করা যায়, validate করা যায়, আর caller clear success/failure contract পায়।

## Changed Files

- `packages/config/src/schema.ts`
- `packages/config/src/config-parser.ts`
- `packages/config/src/index.ts`
- `tests/unit/config-parser.test.ts`

## What Was Added

### `packages/config/src/schema.ts`

Purpose:
- Walkie-Talkie config object-এর TypeScript contract define করা
- validation failure কেমন shape-এ return হবে সেটা stable করা

Why these types exist:
- `WalkieTalkieConfig`
  - valid config-এর canonical app-level shape
  - next steps-এ config reader/writer/runtime সবাই same contract use করবে
- `ConfigValidationIssue`
  - কোন field fail করেছে সেটা `path` + `message` আকারে দেয়
  - user-facing config error clear করতে সাহায্য করবে
- `ConfigValidationResult`
  - success/failure result-কে discriminated union আকারে রাখে
  - caller `valid` check করে safely branch করতে পারে

### `packages/config/src/config-parser.ts`

Purpose:
- raw config string parse করা
- unknown object validate করা
- parse + validate এক call-এ করার helper দেওয়া

Function-by-Function Why:
- `isRecord(value)`
  - validator-এ nested object checks বারবার লাগে
  - raw `unknown` value object কিনা সেটা narrow করার reusable guard
- `isNonEmptyString(value)`
  - required string field validation repeat হচ্ছিল
  - trim-aware non-empty string rule centralize করে
- `pushIssue(issues, path, message)`
  - issue append logic uniform রাখে
  - duplicate object literals কমায়
- `parseConfigString(raw)`
  - parsing concern আলাদা রাখে
  - future-এ JSONC/YAML support এলে parser swap করা সহজ হবে
- `validateConfig(config)`
  - schema-like runtime checks করে
  - config object valid হলে `valid: true`, না হলে field-level issues return করে
- `parseAndValidateConfig(raw)`
  - install/config load flow-এর জন্য ergonomic entrypoint
  - malformed JSON আর structurally invalid config দুইটাই one contract-এ normalise করে

### `packages/config/src/index.ts`

Purpose:
- package public API stable রাখা
- caller-দের deep file path import এড়ানো

### `tests/unit/config-parser.test.ts`

Purpose:
- valid config accept হয় কিনা check করা
- malformed JSON safe failure দেয় কিনা check করা
- committed schema file invalid JSON হয়ে গেছে কিনা detect করা

## Verification

Command run:

```bash
node --test --experimental-strip-types tests/unit/config-parser.test.ts
```

Expected result:
- `pass: 1`
- `fail: 0`

## Call Flow

Config string input
-> `parseAndValidateConfig(raw)`
-> `parseConfigString(raw)`
-> `validateConfig(parsed)`
-> success config or failure issues

Direct object validation path
-> `validateConfig(config)`
-> field-level issue list

## API Contract

### `validateConfig(config)`

Input:
- `unknown`

Output:
- `{ valid: true, issues: [] }`
- or `{ valid: false, issues: ConfigValidationIssue[] }`

### `parseAndValidateConfig(raw)`

Input:
- raw JSON string

Output:
- `{ ok: true, config: WalkieTalkieConfig }`
- or `{ ok: false, issues: ConfigValidationIssue[] }`

## Next Safe Step

`M5-S3`: config writer + reader add করা, যাতে validated config disk-এ save/load করা যায়।
