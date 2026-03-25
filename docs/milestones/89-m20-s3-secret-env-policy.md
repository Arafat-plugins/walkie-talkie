# M20-S3: Secret Management Upgrade Path and Env Policy

## Summary

This step adds the first explicit upgrade path for secret handling.

The project still supports secrets directly inside `walkie-talkie.config.json`, but it now also supports env-backed secret resolution in a predictable way.

## Added

- `packages/config/src/env-policy.ts`
  - env secret bindings
  - `env:VAR_NAME` reference support
  - env resolution helper
  - env template lines
  - readable policy summary
- `.env.example`
  - committed template for tracked secret env vars

## Runtime Wiring

Env secret resolution now applies before runtime readiness and default AI provider wiring.

That means:

- `bootstrapRuntime(...)` resolves env-backed secrets first
- `bootstrapPersistentRuntime(...)` resolves env-backed secrets first
- `createRuntimeDefaultAiProvider(...)` can consume env-backed API keys

## Current Policy

- config remains authoritative for non-secret fields
- env can override tracked secret fields
- explicit `env:VAR_NAME` references are supported
- env-backed refs show as `[env:VAR_NAME]` in redacted output

## Scope Boundary

This is still a light-weight policy, not a full secret vault.

Later productization can upgrade this toward:

- encrypted secret stores
- external secret providers
- team/project scoped secret references
