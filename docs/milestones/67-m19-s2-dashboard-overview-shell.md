# M19-S2: Dashboard Overview Shell

## Goal

Blank bootstrap screen replace করে current dashboard shell model থেকে visible overview shell render করা।

## Changed Files

- `apps/dashboard/src/app/shell.ts`
- `apps/dashboard/src/app/bootstrap.ts`
- `apps/dashboard/index.html`
- `tests/unit/dashboard-shell.test.ts`
- `tests/unit/dashboard-bootstrap.test.ts`

## What Was Added

### `apps/dashboard/src/app/shell.ts`

Purpose:
- shell model থেকে real renderable overview markup build করা

Function-by-Function Why:
- `buildDashboardShellMarkup(model)`
  - sidebar, nav, hero section, এবং status cards-এর HTML generate করে
  - shell model কে visible dashboard structure-এ convert করে

Rendered sections now:
- app title and subtitle
- left navigation rail
- overview hero copy
- runtime status cards

### `apps/dashboard/src/app/bootstrap.ts`

Purpose:
- bootstrap phase-এ placeholder screen না দিয়ে shell model render করা

Behavior change:
- app bootstrap এখন `createDashboardShellModel()` use করে
- mount node-এ real overview shell inject করে

### `apps/dashboard/index.html`

Purpose:
- shell markup-এর জন্য actual visual styling দেওয়া

Design direction:
- editorial serif headline
- warm parchment background
- dark control-plane panel
- sidebar + content split
- explicit card tones

### `tests/unit/dashboard-shell.test.ts`

Purpose:
- rendered shell markup-এ nav ids, cards, and overview title verify করা

### `tests/unit/dashboard-bootstrap.test.ts`

Purpose:
- bootstrap now real overview shell inject করে কিনা verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts tests/unit/dashboard-pipeline-list.test.ts tests/unit/dashboard-status-log-panel.test.ts tests/unit/dashboard-bootstrap.test.ts
npx tsc -p tsconfig.json --noEmit
npm run dashboard:build
```

Result:
- `5` dashboard unit test files passed
- root typecheck clean
- dashboard build clean

Practical result:
- dashboard now opens with a visible overview shell
- no longer just a blank styled background

## Next Safe Step

`M19-S3`: read-only views for agents, skills, MCP, and pipelines render করা।
