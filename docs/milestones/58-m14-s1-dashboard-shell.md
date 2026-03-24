# M14-S1: Dashboard App Shell

## Goal

Dashboard milestone শুরু করার smallest useful step ছিল app shell scaffold করা, যাতে later read-only views same navigation/status frame-এর ওপর build করা যায়।

## Changed Files

- `apps/dashboard/package.json`
- `apps/dashboard/tsconfig.json`
- `apps/dashboard/src/app/shell.ts`
- `apps/dashboard/src/index.ts`
- `tests/unit/dashboard-shell.test.ts`

## What Was Added

### `apps/dashboard/package.json`

Purpose:
- dashboard app package scaffold
- app-level typecheck script define করা

### `apps/dashboard/tsconfig.json`

Purpose:
- dashboard app source files-এর local TypeScript config

### `apps/dashboard/src/app/shell.ts`

Purpose:
- dashboard navigation + top-level status cards + shell copy define করা

Main types:
- `DashboardNavItem`
- `DashboardStatusCard`
- `DashboardShellModel`

Function-by-Function Why:
- `createDashboardShellModel(input?)`
  - dashboard shell default model দেয়
  - app name, title, subtitle, nav items, status cards normalize করে
- `buildDashboardShellSummary(model)`
  - shell model থেকে readable summary lines বানায়
  - tests/docs/debugging-এ quick shell overview দেয়

Current dashboard shell includes:
- nav:
  - Overview
  - Agents
  - Skills
  - MCP
  - Pipelines
  - Logs
  - Config
- status cards:
  - Runtime Readiness
  - Connected Integrations
  - Attention Needed

### `apps/dashboard/src/index.ts`

Purpose:
- dashboard shell API expose করা

### `tests/unit/dashboard-shell.test.ts`

Purpose:
- default shell structure verify করা
- summary output verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
```

Result:
- `1` test file passed
- root typecheck clean
- dashboard typecheck clean

## Next Safe Step

`M14-S2`: read-only views for agents/skills/mcp add করা।
