# M3-S3: Failure Guidance Output

## Goal

Dependency checker summary theke user-facing actionable guidance generate kora.

## Changed Files

- `packages/core/src/dependency-guidance.ts`
- `packages/core/src/index.ts`

## Function-by-Function Why

### `buildDependencyGuidance(summary)`

Why:
- Checker result gulo ke install/onboarding friendly message list e map kore.
- CLI layer ke raw health state parse korte hoy na.

### `buildMissingGuidance(...)`

Why:
- Missing dependency hole direct install hint dei.

### `buildUnsupportedVersionGuidance(...)`

Why:
- Version mismatch clearly explain kore + upgrade direction dei.

### `buildErrorGuidance(...)`

Why:
- Unknown/system error er khetre retry/debug hint dei.

### `buildOkGuidance(...)`

Why:
- Healthy dependency-r explicit success feedback dei.

## Verification Run

Executed a runtime check with:
- node min version intentionally high (`30.0.0`)
- npm min version valid (`10.0.0`)

Observed:
- node -> `unsupported_version` => guidance severity `error`
- npm -> `ok` => guidance severity `info`

## Out of Scope

- CLI `install` command e guidance print wiring (M3-S4)
- Automated test files (M3-S5)

