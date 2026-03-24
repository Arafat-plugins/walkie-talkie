# M19-S3: Dashboard Read-Only Sections

## Goal

Overview shell-এর নিচে agents, skills, MCP servers, এবং pipelines read-only sections render করা।

## Changed Files

- `apps/dashboard/src/features/platform-sections.ts`
- `apps/dashboard/src/app/shell.ts`
- `apps/dashboard/src/app/bootstrap.ts`
- `apps/dashboard/src/index.ts`
- `apps/dashboard/index.html`
- `tests/unit/dashboard-platform-sections.test.ts`
- `tests/unit/dashboard-bootstrap.test.ts`

## What Was Added

### `apps/dashboard/src/features/platform-sections.ts`

Purpose:
- current entity contracts থেকে demo platform snapshot build করা
- read-only dashboard sections-এর markup generate করা

Function-by-Function Why:
- `createDashboardDemoPlatformSectionsModel()`
  - agents/skills/MCP/pipelines-এর demo dataset build করে
  - fake random shape না নিয়ে current contracts use করে
- `buildDashboardPlatformSectionsMarkup(model)`
  - read-only entity sections HTML render করে
  - agents, skills, MCP, এবং pipelines visible blocks বানায়

### `apps/dashboard/src/app/shell.ts`

Purpose:
- shell markup-এ extra body section slot allow করা

Behavior change:
- `buildDashboardShellMarkup(model, { bodyMarkup })`
  - shell cards-এর নিচে extra rendered content inject করতে পারে

### `apps/dashboard/src/app/bootstrap.ts`

Purpose:
- bootstrap phase-এ demo platform sections include করা

Behavior change:
- bootstrap এখন overview shell + read-only entity sections একসাথে render করে

### `apps/dashboard/index.html`

Purpose:
- new sections/cards/grid layout-এর styling add করা

Added styles:
- section containers
- entity grid
- entity cards
- metadata pills
- responsive single-column fallback

### `tests/unit/dashboard-platform-sections.test.ts`

Purpose:
- demo platform snapshot model verify করা
- section markup render verify করা

### `tests/unit/dashboard-bootstrap.test.ts`

Purpose:
- bootstrap HTML-এ now rendered entities/pipelines visible কিনা verify করা

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
- dashboard now shows read-only agents, skills, MCP, and pipeline sections
- shell is no longer only title/nav/cards

## Next Safe Step

`M19-S4`: status/log panel render করা run history এবং audit data থেকে।
