# M19-S5: Dashboard Smoke Tests and Local Run Command

## Goal

Rendered dashboard-এর জন্য one-command local serve flow add করা এবং সেটা smoke coverage দিয়ে lock করা।

## Changed Files

- `apps/dashboard/scripts/serve.mjs`
- `package.json`
- `README.md`
- `tests/integration/dashboard-serve-smoke.test.ts`

## What Was Added

### `apps/dashboard/scripts/serve.mjs`

Purpose:
- dashboard app folder থেকে static local HTTP server চালানো
- built dashboard entry আছে কিনা আগে verify করা

Behavior:
- default port: `4173`
- serves:
  - `apps/dashboard/index.html`
  - built `dist/...` assets
- `--check` mode:
  - server start না করে readiness summary print করে
  - build artifacts missing হলে explicit error দেয়

Why this matters:
- `file://` mode unreliable ছিল browser module loading-এর জন্য
- HTTP serve flow এখন project-native command দিয়ে পাওয়া যাবে

### `package.json`

Purpose:
- root-level dashboard local run commands expose করা

Added scripts:
- `dashboard:serve`
  - build + local HTTP serve
- `dashboard:serve:check`
  - build + readiness verification summary

### `README.md`

Purpose:
- main repo থেকে dashboard run করার working commands document করা

### `tests/integration/dashboard-serve-smoke.test.ts`

Purpose:
- local run contract verify করা

What it checks:
- root scripts exist
- serve script exists
- dashboard HTML still points at built browser entry

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/dashboard-shell.test.ts tests/unit/dashboard-read-only-views.test.ts tests/unit/dashboard-pipeline-list.test.ts tests/unit/dashboard-status-log-panel.test.ts tests/unit/dashboard-bootstrap.test.ts tests/unit/dashboard-platform-sections.test.ts tests/integration/dashboard-serve-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
npx tsc -p apps/dashboard/tsconfig.json --noEmit
npm run dashboard:serve:check
```

Result:
- `7` dashboard tests passed
- root typecheck clean
- dashboard typecheck clean
- local serve readiness command prints:
  - dashboard URL
  - index path
  - built entry path

## Working Local Command

From project root:

```bash
npm run dashboard:serve
```

Then open:

```text
http://localhost:4173
```

## Next Safe Step

Resume product track with `M16-S1`: Telegram runtime config contract define করা।
