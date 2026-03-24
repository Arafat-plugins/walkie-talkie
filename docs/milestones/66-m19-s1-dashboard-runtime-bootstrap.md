# M19-S1: Dashboard Runtime Stack and Bootstrap

## Goal

Dashboard-এর জন্য first rendered runtime stack choose করা এবং browser-visible app bootstrap add করা।

## Stack Decision

Chosen stack:
- runtime target: `browser`
- renderer: `vanilla-dom`
- module format: `esm`

Why this stack:
- no external frontend dependency লাগেনি
- existing TypeScript workspace-এর সাথে low-friction bootstrap possible হয়েছে
- current milestone-এ visible UI foundation পাওয়া গেছে without overcommitting to React/Vue/etc.

## Changed Files

- `apps/dashboard/src/app/bootstrap.ts`
- `apps/dashboard/src/main.ts`
- `apps/dashboard/src/index.ts`
- `apps/dashboard/index.html`
- `apps/dashboard/tsconfig.build.json`
- `apps/dashboard/package.json`
- `package.json`
- `tests/unit/dashboard-bootstrap.test.ts`

## What Was Added

### `apps/dashboard/src/app/bootstrap.ts`

Purpose:
- dashboard browser runtime stack define করা
- initial bootstrap config build করা
- mount node-এ first loading UI render করা

Main constants and types:
- `DASHBOARD_RUNTIME_TARGETS`
- `DASHBOARD_RENDERERS`
- `DASHBOARD_MODULE_FORMATS`
- `DashboardRuntimeStack`
- `DashboardAppBootstrap`
- `DashboardDomDocument`
- `DashboardDomElement`

Function-by-Function Why:
- `createDashboardAppBootstrap(input?)`
  - deterministic runtime/bootstrap config দেয়
- `buildDashboardBootstrapMarkup(bootstrap)`
  - initial loading shell HTML দেয়
- `buildDashboardBootstrapSummary(bootstrap)`
  - readable runtime stack summary দেয়
- `bootstrapDashboardApp(documentRef, bootstrap?)`
  - document title set করে
  - mount node খুঁজে
  - loading UI inject করে

### `apps/dashboard/src/main.ts`

Purpose:
- browser entry module
- global document থাকলে bootstrap run করা

### `apps/dashboard/index.html`

Purpose:
- static browser entry document
- bootstrap mount node + initial CSS + module script path define করা

### `apps/dashboard/tsconfig.build.json`

Purpose:
- emitted dashboard build config
- ESM browser output generate করা

### `apps/dashboard/package.json`

Purpose:
- dashboard build script add করা
- emitted main/types path define করা

### root `package.json`

Purpose:
- workspace-level dashboard build/typecheck convenience scripts add করা

### `tests/unit/dashboard-bootstrap.test.ts`

Purpose:
- runtime stack defaults verify করা
- fake document-এর উপর bootstrap injection verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts tests/unit/dashboard-pipeline-list.test.ts tests/unit/dashboard-status-log-panel.test.ts tests/unit/dashboard-bootstrap.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
npm run dashboard:build
```

Result:
- `5` dashboard unit test files passed
- root typecheck clean
- dashboard typecheck clean
- dashboard build emitted browser entry at `apps/dashboard/dist/apps/dashboard/src/main.js`

Implementation note:
- current build also emits referenced workspace modules into dashboard `dist/`
- acceptable for this bootstrap step
- later dashboard packaging optimization can narrow emitted surface

## Next Safe Step

`M19-S2`: current dashboard models থেকে overview shell render করা।
