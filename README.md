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
2. Optional rerun of terminal onboarding:
   - `walkie-talkie onboard`
   - or `npm run onboard`
3. Or manual path:
   - `npm run cli:link`
   - `walkie-talkie install`
   - `walkie-talkie onboard`

`npm run install:local` will:
- resolve the repo root from the installer script itself
- install workspace dependencies
- link the `walkie-talkie` binary
- run `walkie-talkie install`

`walkie-talkie install` now performs terminal onboarding after dependency/bootstrap work.

Install/onboard terminal setup now captures:
- project name
- full machine access preference
- default model
- AI connection mode (`api-key` or `codex`)
- API key when API-key mode is selected
- optional Codex device-auth launch when Codex mode is selected
- runtime environment
- communication channel (`telegram`, `whatsapp`, `discord`)
- selected channel credential
- Telegram polling vs webhook mode when Telegram is selected
- webhook public URL when needed
- example pipeline bootstrap flag

## Dashboard Local Run

From project root (`walkie-talkie/`):

1. Build + readiness check:
   - `npm run dashboard:serve:check`
2. Start local dashboard server:
   - `npm run dashboard:serve`
3. Open in browser:
   - `http://localhost:4173`

The dashboard server serves `apps/dashboard/index.html` and the built browser entry from `apps/dashboard/dist/...`.

## Telegram Real Test (Poll Once)

From project root (`walkie-talkie/`):

1. make sure `walkie-talkie.config.json` has:
   - `runtime.telegram.enabled = true`
   - `runtime.telegram.delivery.mode = polling`
   - `providers.telegram.botToken`
2. run one live polling cycle:
   - `npm run telegram:poll:once`

## Telegram Quick Test (Today)

From project root (`walkie-talkie/`):

1. install and onboard:
   - `npm run install:local`
2. make sure config has:
   - `providers.telegram.botToken`
   - either `providers.defaultAi.apiKey` or `providers.defaultAi.authMode = codex`
3. seed a ready-to-test Telegram agent + skill + pipeline:
   - `npm run telegram:seed:local-machine`
4. run one real polling cycle:
   - `npm run telegram:poll:once`
5. or keep the bot running:
   - `npm run telegram:poll`

Current scope:
- fetches one real Telegram `getUpdates` cycle
- routes supported updates into runtime orchestration
- sends Telegram replies when final output contains `replyText`
- persists updated run history to local runtime storage

Seeded Telegram flow behavior:
- understands simple machine questions like installed/version checks
- checks the real local machine
- uses the default AI provider when available to turn facts into a more natural reply
- falls back to deterministic human text when Codex mode is selected but no direct provider bridge is active yet

## Production Bootstrap Boundary

From project root (`walkie-talkie/`):

1. Print the current production bootstrap plan:
   - `npm run install:production:plan`
2. Verify the boundary script is wired:
   - `npm run install:production:check`

Current scope:
- documents the supported local entry command
- defines hosted installer and Windows installer boundaries
- keeps install flow minimal until later productization steps

Today, the supported real install path is still:
- `npm run install:local`

## Secret Env Policy

Walkie-Talkie currently supports two secret-loading paths:

1. direct config value
2. env-backed secret resolution

Tracked env variables:
- `WALKIE_DEFAULT_AI_API_KEY`
- `WALKIE_TELEGRAM_BOT_TOKEN`

You can either:
- put the secret directly in `walkie-talkie.config.json`
- or use an env reference such as `env:WALKIE_DEFAULT_AI_API_KEY`

See the committed template:
- `.env.example`

## Release And Deployment Docs

- release checklist:
  - `docs/architecture/08-release-readiness-checklist.md`
- deployment playbook:
  - `docs/architecture/09-deployment-playbook.md`

## Hosted Installer Boundary

From project root (`walkie-talkie/`):

1. print hosted installer contract:
   - `npm run install:hosted:plan`
2. verify hosted installer boundary wiring:
   - `npm run install:hosted:check`
3. print Linux/macOS shell bootstrap plan:
   - `npm run install:hosted:shell:plan`
4. verify Linux/macOS shell bootstrap boundary:
   - `npm run install:hosted:shell:check`
5. print Windows PowerShell bootstrap plan:
   - `npm run install:hosted:windows:plan`
6. verify Windows PowerShell bootstrap boundary:
   - `npm run install:hosted:windows:check`

Current scope:
- hosted installer assumptions are defined
- manifest shape is defined
- Linux/macOS `install.sh` boundary is present
- Windows `install.ps1` boundary is present
- hosted release download is still pending
# walkie-talkie
