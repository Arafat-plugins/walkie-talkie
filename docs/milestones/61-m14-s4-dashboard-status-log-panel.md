# M14-S4: Dashboard Status and Log Panel

## Goal

Dashboard foundation-এ runtime status cards আর recent run log panel model add করা।

## Changed Files

- `apps/dashboard/src/features/status-log-panel.ts`
- `apps/dashboard/src/index.ts`
- `tests/unit/dashboard-status-log-panel.test.ts`

## What Was Added

### `apps/dashboard/src/features/status-log-panel.ts`

Purpose:
- shell status cards + runtime run history combine করে dashboard status/log panel model বানানো

Main types:
- `DashboardLogItem`
- `DashboardStatusLogPanelModel`

Function-by-Function Why:
- `summarizeRun(entry)`
  - runtime run history entry কে dashboard log item-এ convert করে
  - status অনুযায়ী tone set করে
- `createDashboardStatusLogPanelModel(input)`
  - status cards clone করে
  - latest run select করে
  - full recent runs list build করে
- `buildDashboardStatusLogSummary(model)`
  - status/log panel readable summary lines দেয়

What panel shows now:
- shell-level status cards
- latest run summary
- recent run titles

### `apps/dashboard/src/index.ts`

Purpose:
- status/log panel APIs dashboard package root-এ expose করা

### `tests/unit/dashboard-status-log-panel.test.ts`

Purpose:
- latest/recent run summary verify করা
- readable status/log lines verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts tests/unit/dashboard-pipeline-list.test.ts tests/unit/dashboard-status-log-panel.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
```

Result:
- `4` test files passed
- root typecheck clean
- dashboard typecheck clean

## Next Safe Step

`M15-S1`: log contract and levels standardize করা।
