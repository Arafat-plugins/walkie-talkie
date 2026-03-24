# M18-S2: Entity File Persistence

## Goal

Agents, skills, MCP servers, and pipelines-এর জন্য disk-backed entity snapshot persistence add করা.

## Changed Files

- `packages/shared/src/entity-file-storage.ts`
- `packages/shared/src/index.ts`
- `.gitignore`
- `tests/unit/entity-file-storage.test.ts`

## What Was Added

### `packages/shared/src/entity-file-storage.ts`

Purpose:
- entity snapshot files resolve, serialize, write, and load করা
- local runtime storage path standardize করা

Main exports:
- `DEFAULT_STORAGE_DIRECTORY`
- `DEFAULT_ENTITY_STORAGE_FILE`
- `resolveStorageDirectory(...)`
- `resolveEntityStoragePath(...)`
- `serializeEntityStorageSnapshot(...)`
- `writeEntityStorageFile(...)`
- `readEntityStorageFile(...)`
- `loadEntityStorageFile(...)`

Behavior:
- entity snapshots store under `.walkie-talkie/storage/entities.snapshot.json`
- skills persist as metadata only; runtime handler JSON-এ যায় না
- load-এর সময় persisted skills safe placeholder handler পায়
- invalid storage version clear issue return করে

Why this matters:
- entity state এখন process restart-এর বাইরে disk-এ রাখা যাবে
- handler-bearing skills persist করার safe pattern define হলো
- next step-এ run history and audit persistence একই storage direction follow করতে পারবে

### `.gitignore`

Purpose:
- local storage output repo-তে accidentally commit না হওয়া

Added ignore:
- `.walkie-talkie/`

### `tests/unit/entity-file-storage.test.ts`

Purpose:
- storage path convention verify করা
- serialized snapshot handler-free কিনা verify করা
- disk round-trip verify করা
- loaded skill placeholder handler behavior verify করা
- invalid version issue verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/entity-file-storage.test.ts tests/unit/storage-contract.test.ts tests/unit/config-store.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` test files passed
- root typecheck clean

## Next Safe Step

`M18-S3`: Persist run history and audit events.
