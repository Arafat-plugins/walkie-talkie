# M3-S6: Real CLI Executable Path (dist + bin + shebang)

## Goal

Source-only execution theke বেরিয়ে compiled `dist` based CLI executable path প্রস্তুত করা.

## Changed Files

- `apps/cli/src/index.ts`
- `apps/cli/package.json`
- `apps/cli/tsconfig.build.json`
- `package.json`
- `package-lock.json`

## What Was Added

- `index.ts` এ shebang (`#!/usr/bin/env node`)
- CLI package e `build` script + `dist` entry mapping
- `bin.walkie-talkie` path এখন `dist/apps/cli/src/index.js`
- build config (`tsconfig.build.json`) for emitting:
  - `apps/cli/src/*`
  - dependent `packages/core/src/*`
- workspace-level commands:
  - `npm run cli:build`
  - `npm run cli:dist -- install`

## Verification Executed

- `npm run cli:build`
- `npm run cli:dist -- install`
- `node apps/cli/dist/apps/cli/src/index.js install`

Observed:
- dist build success
- compiled entrypoint install flow run success

## Notes

- Build-time TypeScript dependencies (`typescript`, `@types/node`) added in workspace dev dependencies.
- `M3-S7` এ next কাজ: installed command workflow (`npm link` / `npm install -g .`) verify করা.

