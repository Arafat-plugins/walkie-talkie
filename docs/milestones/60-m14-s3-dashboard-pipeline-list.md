# M14-S3: Dashboard Pipeline List

## Goal

Dashboard foundation-এ pipeline list view model add করা, যাতে orchestration graph summaries shell-এর read-only sections-এর সাথে consistentভাবে দেখানো যায়।

## Changed Files

- `apps/dashboard/src/features/pipeline-list-view.ts`
- `apps/dashboard/src/index.ts`
- `tests/unit/dashboard-pipeline-list.test.ts`

## What Was Added

### `apps/dashboard/src/features/pipeline-list-view.ts`

Purpose:
- pipeline definitions কে dashboard list cards-এ convert করা

Main types:
- `DashboardPipelineListModel`

Function-by-Function Why:
- `summarizePipeline(pipeline)`
  - pipeline definition কে compact summary card-এ convert করে
  - nodes, edges, start node, tag count meta আকারে দেয়
- `createDashboardPipelineListModel(input)`
  - pipeline arrays থেকে dashboard-ready list model বানায়
- `buildDashboardPipelineSummary(model)`
  - readable pipeline line দেয়

### `apps/dashboard/src/index.ts`

Purpose:
- pipeline list view APIs dashboard package root-এ expose করা

### `tests/unit/dashboard-pipeline-list.test.ts`

Purpose:
- pipeline summary card model verify করা
- summary line output verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts tests/unit/dashboard-pipeline-list.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
```

Result:
- `3` test files passed
- root typecheck clean
- dashboard typecheck clean

## Next Safe Step

`M14-S4`: basic status/log panel add করা।
