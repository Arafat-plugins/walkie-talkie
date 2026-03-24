# M18-S4: Persistent State Loading

## Summary

This step adds a runtime bootstrap path that restores config, persisted entities, and persisted runtime history from disk-backed storage.

## What Was Added

- `packages/runtime/src/persistent-state.ts`
  - `bootstrapPersistentRuntime(...)`
  - `buildPersistentRuntimeBootstrapSummary(...)`
  - `createPersistentEntitySnapshot(...)`
  - `createPersistentRuntimeSnapshot(...)`
- `packages/runtime/src/index.ts`
  - exports persistent runtime bootstrap helpers
- `packages/logging/src/audit-event.ts`
  - `InMemoryAuditEventStore`
- `packages/runtime/src/run-history.ts`
  - `seed(...)`
  - `count()`
- `packages/skills/src/skill-registry.ts`
  - restore-friendly `seed(...)`, `count()`, `snapshot(...)`
- `packages/mcp/src/mcp-registry.ts`
  - restore-friendly `seed(...)`, `count()`, `snapshot(...)`

## Runtime Behavior

`bootstrapPersistentRuntime(baseDirectory)` now:

1. loads `walkie-talkie.config.json`
2. verifies runtime readiness
3. loads `.walkie-talkie/storage/entities.snapshot.json`
4. loads `.walkie-talkie/storage/runtime.snapshot.json`
5. restores:
   - agent registry
   - skill registry
   - MCP registry
   - pipelines array
   - in-memory run history store
   - in-memory audit store

## Missing File Behavior

If entity or runtime snapshot files do not exist yet, the bootstrap does not fail.
It falls back to empty snapshots and returns warnings instead.

This keeps first-run startup safe while still blocking on malformed persisted files.

## Validation Coverage

- persistent bootstrap success path
- missing snapshot fallback path
- invalid persisted entity snapshot failure path
- summary output coverage

## Why This Step Matters

Persistence is no longer write-only.
The runtime can now recover previously saved platform state after restart, which makes the storage layer actually usable for the next integration step.
