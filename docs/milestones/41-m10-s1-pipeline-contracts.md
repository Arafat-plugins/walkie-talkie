# M10-S1: Pipeline Node and Edge Contracts

## Goal

Pipeline engine শুরু করার আগে orchestration graph-এর stable contract define করা।

## Changed Files

- `packages/pipeline/src/pipeline-contract.ts`
- `packages/pipeline/src/index.ts`
- `tests/unit/pipeline-contracts.test.ts`

## What Was Added

### `packages/pipeline/src/pipeline-contract.ts`

Purpose:
- trigger -> agent -> skill -> mcp -> response flow define করার graph shape provide করা

Constants:
- `PIPELINE_CONTRACT_VERSION`
- `PIPELINE_NODE_TYPES`
- `PIPELINE_EDGE_TYPES`

Main types:
- `PipelineNodeType`
- `PipelineEdgeType`
- `PipelineNodeConfig`
- `PipelineNodeDefinition`
- `PipelineEdgeDefinition`
- `PipelineDefinition`
- `PipelineDefinitionInput`

Function-by-Function Why:
- `createPipelineDefinition(input)`
  - pipeline graph normalize করে
  - version apply করে
  - node config / edges / tags clone করে
  - canonical pipeline object shape দেয়

Node types currently supported:
- `trigger`
- `agent`
- `skill`
- `mcp`
- `condition`
- `response`

Edge types currently supported:
- `default`
- `success`
- `failure`
- `conditional`

### `packages/pipeline/src/index.ts`

Purpose:
- pipeline package public API expose করা

### `tests/unit/pipeline-contracts.test.ts`

Purpose:
- contract constants stable আছে কিনা
- `createPipelineDefinition()` graph structures clone করে কিনা
- version/startNode/tags path ঠিক আছে কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/pipeline-contracts.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- test pass
- typecheck clean

## Next Safe Step

`M10-S2`: sequential execution path implement করা।
