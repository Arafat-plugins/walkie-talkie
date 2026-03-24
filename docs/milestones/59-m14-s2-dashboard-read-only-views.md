# M14-S2: Dashboard Read-Only Views

## Goal

Dashboard shell-এর ওপর agents, skills, আর MCP servers-এর read-only render-ready data model বসানো।

## Changed Files

- `apps/dashboard/src/features/read-only-views.ts`
- `apps/dashboard/src/index.ts`
- `apps/dashboard/tsconfig.json`
- `tests/unit/dashboard-read-only-views.test.ts`

## What Was Added

### `apps/dashboard/src/features/read-only-views.ts`

Purpose:
- registry/domain data কে dashboard-friendly read-only cards-এ convert করা

Main types:
- `DashboardEntityCard`
- `DashboardReadOnlyViewsModel`

Function-by-Function Why:
- `summarizeAgent(agent)`
  - agent definition কে simple card summary-তে convert করে
- `summarizeSkill(skill)`
  - skill definition কে read-only card summary-তে convert করে
- `summarizeMcpServer(server)`
  - MCP server definition কে read-only card summary-তে convert করে
- `createDashboardReadOnlyViewsModel(input)`
  - agents/skills/mcp arrays থেকে dashboard-ready view model বানায়
- `buildDashboardReadOnlySummary(model)`
  - read-only sections-এর readable summary lines দেয়

### `apps/dashboard/src/index.ts`

Purpose:
- shell + read-only view model APIs dashboard package root-এ expose করা

### `apps/dashboard/tsconfig.json`

Purpose:
- `.ts` extension imports dashboard-local typecheck-এ allow করা
- Node source-run + TS validation একসাথে clean রাখা

### `tests/unit/dashboard-read-only-views.test.ts`

Purpose:
- agent/skill/mcp summary card model verify করা
- summary line output verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
```

Result:
- `2` test files passed
- root typecheck clean
- dashboard typecheck clean

## Next Safe Step

`M14-S3`: pipeline list view add করা।
