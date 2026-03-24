# M10-S3: Basic Branching Support

## Goal

Sequential path resolver-এর পরে next smallest orchestration step ছিল first branch point detect করা, যাতে later execution engine success/failure/conditional path select করতে পারে।

## Changed Files

- `packages/pipeline/src/branching-path.ts`
- `packages/pipeline/src/index.ts`
- `tests/unit/pipeline-branching-path.test.ts`

## What Was Added

### `packages/pipeline/src/branching-path.ts`

Purpose:
- start node থেকে linear default path follow করা
- first branch point-এ available outgoing options return করা

Main types:
- `PipelineBranchOption`
- `PipelineBranchPoint`
- `BranchingPipelinePlan`

Function-by-Function Why:
- `buildNodeMap(pipeline)`
  - node id দিয়ে fast lookup দেয়
  - branch edge target resolve করার সময় repeated scan avoid করে
- `buildOutgoingEdgeMap(pipeline)`
  - current node থেকে কোন edges বের হচ্ছে তা grouped map আকারে দেয়
  - branch discovery stage-এ fast outgoing lookup নিশ্চিত করে
- `resolveBranchingExecutionPath(pipeline)`
  - `startNodeId` থেকে walk শুরু করে
  - exactly one default edge থাকলে linear path continue করে
  - multiple or non-default outgoing edges পেলে branch point return করে
  - branch options-এ edge + target node pair দেয়
  - safe failure দেয় when:
    - start node missing
    - edge missing node-এ point করে
    - branch loop/cycle detect হয়

Behavior contract:
- no branch থাকলে `{ ok: true, steps }`
- branch থাকলে `{ ok: true, steps, branch }`
- invalid graph হলে `{ ok: false, error }`

### `packages/pipeline/src/index.ts`

Purpose:
- pipeline package public API-তে branching path resolver expose করা

### `tests/unit/pipeline-branching-path.test.ts`

Purpose:
- linear prefix + branch options verify করা
- no-branch terminal case verify করা
- missing branch target guard verify করা
- cycle guard verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/pipeline-contracts.test.ts tests/unit/pipeline-sequential-path.test.ts tests/unit/pipeline-branching-path.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` tests passed
- typecheck clean

## Next Safe Step

`M10-S4`: error handling and execution report add করা।
