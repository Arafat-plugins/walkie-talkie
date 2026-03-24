# M3-S4: Wire Dependency Checker to Install Command

## Goal

`walkie-talkie install` command er vitore dependency checker + guidance output integrate kora.

## Changed Files

- `apps/cli/src/commands/install.ts`
- `apps/cli/src/index.ts`
- `tests/cli/install.command.test.ts`

## Function-by-Function Why

### `executeInstallCommand()`

File: `apps/cli/src/commands/install.ts`

Why:
- Install flow-er first gate hisebe dependencies validate kore.
- Guidance messages print kore actionable feedback dei.
- Blocking issue thakলে `exitCode: 1`, otherwise `0` return kore.

### `runCli(argv)` (async)

File: `apps/cli/src/index.ts`

Why:
- Install command ekhon async checker use kore, tai CLI runner async korte hoy.
- Command execution error hole controlled failure path (`exitCode: 1`) maintain kore.

### Updated smoke test

File: `tests/cli/install.command.test.ts`

Why:
- Async `runCli` path verify korte.
- Dependency-ready output contract assert korte.

## Verification Executed

- `node --experimental-strip-types apps/cli/src/index.ts install`
- `node --test --experimental-strip-types tests/cli/install.command.test.ts`

Observed:
- install command dependency status print kore
- test pass: 1 passed, 0 failed

## Out of Scope

- Dedicated unit tests for checker internals (M3-S5)
- Integration test matrix for missing/unsupported paths (M3-S5)

