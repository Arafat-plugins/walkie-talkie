# M3-S5: Unit and CLI Integration Tests

## Goal

Dependency checker and CLI dependency-gate flow er jonno minimum test coverage add kora.

## Changed Files

- `tests/unit/dependency-checker.test.ts`
- `tests/unit/dependency-guidance.test.ts`
- `tests/integration/cli-routing.integration.test.ts`

## Test Coverage Added

### Unit: dependency checker helpers

File: `tests/unit/dependency-checker.test.ts`

Covers:
- `normalizeVersion`
- `parseVersion`
- `isVersionSupported`

### Unit: guidance mapper

File: `tests/unit/dependency-guidance.test.ts`

Covers:
- `missing` -> actionable error guidance
- `unsupported_version` -> actionable error guidance
- `error` -> diagnostic guidance
- `ok` -> info guidance with version

### Integration: CLI routing and install command path

File: `tests/integration/cli-routing.integration.test.ts`

Covers:
- unknown command => exit code `1`
- install command route => dependency check header output + success exit

## Verification Executed

Command:
- `node --test --experimental-strip-types tests/unit/dependency-checker.test.ts tests/unit/dependency-guidance.test.ts tests/integration/cli-routing.integration.test.ts tests/cli/install.command.test.ts`

Result:
- tests: 4
- pass: 4
- fail: 0

## Out of Scope

- Real executable packaging (`M3-S6`)
- `npm link`/global install verification (`M3-S7`)
- dependency bootstrap in install command (`M3-S8`)

