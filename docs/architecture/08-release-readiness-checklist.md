# Release Readiness Checklist

## Purpose

এই checklist-এর কাজ হলো release cut করার আগে team বা অন্য AI যেন same checks follow করে।

## Pre-Release

- `docs/milestones/01-master-milestones.md` current step updated
- `docs/milestones/STATUS.md` current milestone updated
- `.gitignore` checked for generated/local files
- `.env.example` reflects current tracked secret env vars
- no generated local snapshots committed

## Verification

Run from project root:

```bash
npx tsc -p tsconfig.json --noEmit
node --test --experimental-strip-types tests/unit/*.test.ts
node --test --experimental-strip-types tests/integration/*.test.ts
npm run dashboard:build
npm run dashboard:serve:check
npm run install:production:check
```

## Runtime Readiness

- install flow still works with `npm run install:local`
- `walkie-talkie.config.json` generation still works
- persistent storage path loads without breaking first-run flow
- Telegram runtime config still validates for polling/webhook
- default AI provider wiring still resolves secrets correctly

## UI Readiness

- dashboard shell renders
- platform sections render
- status/log panel renders
- local dashboard server starts on `http://localhost:4173`

## Safety Readiness

- retry policy contract unchanged or intentionally updated
- audit event contract unchanged or intentionally updated
- operator safety profile still covers:
  - budgets
  - approvals
  - allowlists

## Release Notes Inputs

Capture:

- milestone/step completed
- user-visible changes
- commands added/changed
- known limitations
- next planned milestone

## Stop Release If

- typecheck fails
- integration tests fail
- generated files are accidentally tracked
- runtime bootstrap blocks on valid config
- dashboard build breaks
- install boundary docs no longer match actual commands
