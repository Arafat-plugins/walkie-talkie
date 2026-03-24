# M10-S2: Sequential Execution Path

## Goal

Pipeline graph define করার পর next smallest useful step ছিল linear path safely walk করা।

## Changed Files

- `packages/pipeline/src/sequential-path.ts`
- `packages/pipeline/src/index.ts`
- `tests/unit/pipeline-sequential-path.test.ts`

## What Was Added

### `packages/pipeline/src/sequential-path.ts`

Purpose:
- simple trigger -> agent -> skill -> response type pipeline graph কে deterministic sequential order-এ resolve করা

Main types:
- `SequentialPipelineStep`
- `SequentialPipelinePlan`

Function-by-Function Why:
- `buildNodeMap(pipeline)`
  - node id দিয়ে fast lookup করার জন্য in-memory map বানায়
  - later edge traversal-এর সময় repeated array scan avoid করে
- `buildOutgoingEdgeMap(pipeline)`
  - each node থেকে কোন edges বের হচ্ছে তা grouped map আকারে রাখে
  - sequential walker যেন current node থেকে next default edge খুঁজে পায়
- `resolveSequentialExecutionPath(pipeline)`
  - `startNodeId` থেকে walk শুরু করে
  - শুধু `default` edges follow করে
  - ordered execution steps return করে
  - safe failure দেয় when:
    - start node missing
    - multiple default edges path ambiguous করে
    - edge missing node-এ point করে
    - cycle detect হয়

Behavior contract:
- linear pipeline হলে `{ ok: true, steps }`
- invalid sequential graph হলে `{ ok: false, error }`

### `packages/pipeline/src/index.ts`

Purpose:
- pipeline package public API-তে sequential path resolver expose করা

### `tests/unit/pipeline-sequential-path.test.ts`

Purpose:
- linear path ordering verify করা
- missing start node guard verify করা
- ambiguous branching guard verify করা
- cycle detection guard verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/pipeline-contracts.test.ts tests/unit/pipeline-sequential-path.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `2` tests passed
- typecheck clean

## Next Safe Step

`M10-S3`: basic branching support add করা।
