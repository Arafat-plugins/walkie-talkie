# M3-S1: Dependency Check Contracts

## Goal

`packages/core` e dependency checker-er shared type contracts define kora, jate detection logic (M3-S2) stable interface follow kore.

## Changed Files

- `packages/core/src/dependency-checker.contract.ts`
- `packages/core/src/index.ts`

## Contract Overview

- `DependencyName`: current supported dependencies (`node`, `npm`)
- `DependencyHealth`: checker result state (`ok`, `missing`, `unsupported_version`, `error`)
- `DependencyRequirement`: input requirement model
- `DependencyCheckResult`: per dependency output
- `DependencyCheckSummary`: final aggregated result with blocking flag
- `DependencyChecker` interface: single `check()` contract for implementations

## Why This Step Matters

- CLI layer and checker implementation er modhye explicit boundary toiri hoy.
- M3-S2 e detection logic likhle output shape already fixed thakbe.
- Future dependency add korle contract-driven extension kora jabe.

## Out of Scope

- Actual version detection
- Shell command execution
- User-facing guidance messages

