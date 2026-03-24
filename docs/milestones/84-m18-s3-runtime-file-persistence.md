# M18-S3: Runtime File Persistence

## Goal

Run history এবং audit events-এর জন্য disk-backed runtime snapshot persistence add করা.

## Changed Files

- `packages/shared/src/runtime-file-storage.ts`
- `packages/shared/src/index.ts`
- `tests/unit/runtime-file-storage.test.ts`

## What Was Added

### `packages/shared/src/runtime-file-storage.ts`

Purpose:
- runtime operational data files resolve, serialize, write, and load করা

Main exports:
- `DEFAULT_RUNTIME_STORAGE_FILE`
- `resolveRuntimeStoragePath(...)`
- `serializeRuntimeStorageSnapshot(...)`
- `writeRuntimeStorageFile(...)`
- `readRuntimeStorageFile(...)`
- `loadRuntimeStorageFile(...)`

Behavior:
- runtime snapshots store under `.walkie-talkie/storage/runtime.snapshot.json`
- run history and audit data deterministic JSON shape-এ persist হয়
- invalid storage version issue return করে
- missing/invalid file path clear file-level issue return করে

Why this matters:
- operational history এখন process restart-এর বাইরে survive করতে পারবে
- startup state restore করার জন্য next step-এ required runtime storage layer ready হলো
- dashboard/logging history later persisted source থেকে hydrate করা easier হবে

### `tests/unit/runtime-file-storage.test.ts`

Purpose:
- runtime storage path verify করা
- deterministic serialization verify করা
- disk round-trip verify করা
- invalid version handling verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/runtime-file-storage.test.ts tests/unit/entity-file-storage.test.ts tests/unit/storage-contract.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` test files passed
- root typecheck clean

## Next Safe Step

`M18-S4`: Add config/runtime state loading from persistent storage.
