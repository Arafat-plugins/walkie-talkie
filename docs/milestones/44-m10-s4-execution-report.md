# M10-S4: Error Handling and Execution Report

## Goal

Pipeline path resolve করার পরে next useful step ছিল execution status trace রাখা, যাতে later real runner প্রতিটি step-এর outcome report করতে পারে।

## Changed Files

- `packages/pipeline/src/execution-report.ts`
- `packages/pipeline/src/index.ts`
- `tests/unit/pipeline-execution-report.test.ts`

## What Was Added

### `packages/pipeline/src/execution-report.ts`

Purpose:
- pipeline execution-এর planned/running/success/failure/blocked state deterministicভাবে capture করা

Constants:
- `PIPELINE_EXECUTION_STATUSES`
- `PIPELINE_STEP_STATUSES`

Main types:
- `PipelineExecutionStatus`
- `PipelineStepStatus`
- `PipelineExecutionStepReport`
- `PipelineExecutionReport`

Function-by-Function Why:
- `updateStepStatus(steps, nodeId, status, error?)`
  - immutable step update helper
  - repeated step mutation logic এক জায়গায় রাখে
- `createPipelineExecutionReport(pipeline, steps, now?)`
  - resolved sequential steps থেকে initial planned report বানায়
  - runner শুরু হওয়ার আগে stable execution document দেয়
- `markPipelineExecutionStepCompleted(report, nodeId)`
  - single step complete mark করে
  - report status `running` করে
- `markPipelineExecutionFailed(report, nodeId, error, now?)`
  - failed step mark করে
  - remaining planned steps কে `blocked` করে
  - top-level error + finished timestamp set করে
- `markPipelineExecutionCompleted(report, now?)`
  - final success state set করে
  - remaining planned steps complete mark করে
- `createPipelineResolutionFailureReport(pipeline, error, now?)`
  - path resolve হওয়ার আগেই যদি block/failure হয়, তখন empty-steps blocked report দেয়

Behavior contract:
- execution start-এর আগে report `planned`
- step complete হলে report `running`
- step fail হলে current `failed`, later planned steps `blocked`
- resolution fail হলে top-level `blocked` report with empty steps

### `packages/pipeline/src/index.ts`

Purpose:
- pipeline package public API-তে execution report helpers expose করা

### `tests/unit/pipeline-execution-report.test.ts`

Purpose:
- planned report build verify করা
- running state verify করা
- failed + blocked transitions verify করা
- success completion verify করা
- resolution failure report verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/pipeline-contracts.test.ts tests/unit/pipeline-sequential-path.test.ts tests/unit/pipeline-branching-path.test.ts tests/unit/pipeline-execution-report.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` tests passed
- typecheck clean

## Next Safe Step

`M10-S5`: pipeline integration tests add করা।
