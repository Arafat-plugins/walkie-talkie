# Walkie-Talkie

OpenClaw-inspired (not copied) modular AI agent platform.

## Current Build Status

- M1 complete: foundation structure + architecture docs.
- M2 complete: CLI install skeleton with command wiring and smoke test.
- M3 complete: dependency checker + guidance + install bootstrap + local installable command.

## Quick Navigation

- Architecture overview: `docs/architecture/01-foundation.md`
- Folder map: `docs/architecture/02-folder-map.md`
- Milestone plan: `docs/milestones/00-roadmap.md`

## Planned First Executable Path

Installation flow will start from:
1. `apps/cli/src/commands/install.ts`
2. `packages/core/src/dependency-checker.ts`
3. `packages/onboarding/src/wizard.ts`
4. `packages/config/src/config-writer.ts`
5. `packages/runtime/src/bootstrap.ts`

## Run Instructions (Current Milestone)

From project root (`walkie-talkie/`):

1. Run install scaffold command directly:
   - `node --experimental-strip-types apps/cli/src/index.ts install`
2. Run CLI smoke test:
   - `node --test --experimental-strip-types tests/cli/install.command.test.ts`
3. Optional workspace script entry:
   - `npm run cli`

## Local Installable Command (M3-S7)

From project root (`walkie-talkie/`):

1. One-command local setup:
   - `npm run install:local`
2. Or manual path:
   - `npm run cli:link`
   - `walkie-talkie install`

`npm run install:local` will:
- link the `walkie-talkie` binary
- run `walkie-talkie install`

Linked `walkie-talkie install` now performs the CLI build automatically before executing the compiled entrypoint.

## Dashboard Local Run

From project root (`walkie-talkie/`):

1. Build + readiness check:
   - `npm run dashboard:serve:check`
2. Start local dashboard server:
   - `npm run dashboard:serve`
3. Open in browser:
   - `http://localhost:4173`

The dashboard server serves `apps/dashboard/index.html` and the built browser entry from `apps/dashboard/dist/...`.
# walkie-talkie
