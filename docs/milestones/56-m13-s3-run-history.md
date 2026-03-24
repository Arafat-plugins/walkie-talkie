# M13-S3: Minimal Run History Capture

## Goal

Orchestration run result memory-তে capture করা, যাতে later dashboard/log/history layer same run summary read করতে পারে।

## Changed Files

- `packages/runtime/src/run-history.ts`
- `packages/runtime/src/index.ts`
- `tests/integration/run-history.integration.test.ts`

## What Was Added

### `packages/runtime/src/run-history.ts`

Purpose:
- minimal in-memory run history store provide করা

Main types:
- `RuntimeRunHistoryEntry`

Function-by-Function Why:
- `cloneRunHistoryEntry(entry)`
  - returned history mutation store state leak না করে
- `InMemoryRunHistoryStore.record(entry)`
  - new run entry append করে
- `InMemoryRunHistoryStore.list()`
  - full run history snapshot দেয়
- `InMemoryRunHistoryStore.latest()`
  - most recent run entry দেয়
- `createRunHistoryEntry(trigger, result)`
  - orchestration result থেকে compact history summary বানায়
- `executeConfiguredTriggerPipelineWithHistory(input)`
  - config-driven orchestration run করে
  - তারপর generated entry store-এ record করে

What gets captured:
- `runId`
- `pipelineId`
- `pipelineName`
- `triggerKind`
- `triggerEventName`
- `status`
- `startedAt`
- `finishedAt`
- `error`

### `packages/runtime/src/index.ts`

Purpose:
- run history helpers runtime package API-তে expose করা

### `tests/integration/run-history.integration.test.ts`

Purpose:
- successful run history entry verify করা
- blocked run history entry verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/integration/run-history.integration.test.ts tests/integration/config-driven-orchestration.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `2` integration test files passed
- typecheck clean

## Next Safe Step

`M13-S4`: E2E verification scenario add করা।
