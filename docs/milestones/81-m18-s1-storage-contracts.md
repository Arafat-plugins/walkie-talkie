# M18-S1: Storage Contracts

## Goal

Entities, run history, আর audit data-এর জন্য shared persistence contract define করা, যাতে next step-এ file-backed storage same shape follow করতে পারে.

## Changed Files

- `packages/shared/src/storage-contract.ts`
- `packages/shared/src/index.ts`
- `tests/unit/storage-contract.test.ts`

## What Was Added

### `packages/shared/src/storage-contract.ts`

Purpose:
- cross-package persistence boundary define করা
- entity snapshots and operational snapshots-এর canonical shape fix করা

Main exports:
- `STORAGE_CONTRACT_VERSION`
- `STORED_ENTITY_KINDS`
- `EntityStorageSnapshot`
- `RuntimeStorageSnapshot`
- `WalkieTalkieStorageAdapter`
- `createEntityStorageSnapshot(...)`
- `createRuntimeStorageSnapshot(...)`
- `createNoopWalkieTalkieStorageAdapter()`

Behavior:
- snapshots always normalized with version + `updatedAt`
- agents / skills / MCP / pipelines cloned snapshot হিসেবে store-ready হয়
- runs / audit events cloned snapshot হিসেবে runtime-data bundle-এ যায়
- no-op adapter later integration points-এ safe default হিসেবে use করা যাবে

Why this matters:
- file persistence, DB persistence, বা future external storage adapter এখন same contract follow করতে পারবে
- another AI বা teammate সহজে বুঝবে persisted shape কেমন
- M18-S2 implementation-এর আগে storage boundary stable হলো

### `packages/shared/src/index.ts`

Purpose:
- shared storage contract package root-এ export করা

### `tests/unit/storage-contract.test.ts`

Purpose:
- entity snapshot cloning verify করা
- runtime snapshot cloning verify করা
- noop adapter empty bundles return করে কিনা verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/storage-contract.test.ts tests/unit/audit-event.test.ts tests/integration/run-history.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` tests passed
- root typecheck clean

## Next Safe Step

`M18-S2`: Implement file-based persistence for agents, skills, MCP servers, and pipelines.
