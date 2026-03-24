# M19-S4: Dashboard Status and Log Render

## Goal

Rendered dashboard shell-এর ভিতরে run history এবং audit data থেকে visible status/log panel দেখানো।

## Changed Files

- `apps/dashboard/src/features/status-log-panel.ts`
- `apps/dashboard/src/app/bootstrap.ts`
- `apps/dashboard/index.html`
- `tests/unit/dashboard-status-log-panel.test.ts`
- `tests/unit/dashboard-bootstrap.test.ts`

## What Was Added

### `apps/dashboard/src/features/status-log-panel.ts`

Purpose:
- run history + audit events combine করে render-ready operations panel build করা

What changed:
- audit items now have their own dashboard summary shape
- demo status/log panel model now includes:
  - recent runs
  - recent audit events
- real markup builder now renders:
  - latest run
  - recent runs list
  - audit trail list
  - empty-state fallback when audit data is absent

Function-by-Function Why:
- `summarizeAudit(event)`
  - audit event কে readable dashboard card item-এ turn করে
  - outcome অনুযায়ী tone set করে
- `createDashboardDemoStatusLogPanelModel()`
  - browser-visible dashboard-এর জন্য deterministic demo operations data দেয়
- `buildDashboardStatusLogPanelMarkup(model)`
  - status/log section-এর full HTML render করে
  - separate run column and audit column দেখায়

### `apps/dashboard/src/app/bootstrap.ts`

Purpose:
- bootstrap phase-এ status/log panel shell-এর নিচে include করা

Behavior change:
- dashboard now renders:
  - overview shell
  - platform sections
  - status/log panel

### `apps/dashboard/index.html`

Purpose:
- operations/status panel-এর visual layer add করা

Added styles:
- status panel wrapper
- two-column operations grid
- run/audit columns
- log item cards
- success/warning tones
- empty-state styling
- mobile single-column fallback

### `tests/unit/dashboard-status-log-panel.test.ts`

Purpose:
- audit-aware summaries verify করা
- demo panel model verify করা
- visible status/log markup verify করা

### `tests/unit/dashboard-bootstrap.test.ts`

Purpose:
- bootstrap HTML-এ rendered operations panel visible কিনা verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts tests/unit/dashboard-pipeline-list.test.ts tests/unit/dashboard-status-log-panel.test.ts tests/unit/dashboard-bootstrap.test.ts tests/unit/dashboard-platform-sections.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
npm run dashboard:build
```

Result:
- `6` dashboard unit test files passed
- root typecheck clean
- dashboard typecheck clean
- dashboard build clean

Practical result:
- dashboard now visibly shows an operations section
- recent runs and audit signals are rendered as real cards, not just model helpers

## Next Safe Step

`M19-S5`: dashboard smoke tests and local run command add করা।
