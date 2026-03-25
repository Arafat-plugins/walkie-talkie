# Terminal Onboard Command Patch

## Summary

Added a dedicated `walkie-talkie onboard` command and re-wired `walkie-talkie install` so project configuration can be completed from the terminal during install or later as a rerun step, similar to OpenClaw-style post-install setup.

## What Changed

- Added CLI command:
  - `walkie-talkie onboard`
- Rewired `walkie-talkie install` to launch onboarding after bootstrap
- Extended terminal onboarding questions for:
  - full machine access preference
  - default model
  - AI auth mode (`api-key` vs `codex`)
  - runtime environment
  - communication channel choice
  - channel credential
  - Telegram polling vs webhook mode when relevant
  - webhook public base URL
- Added conditional onboarding validation for Telegram setup
- Added Codex device-auth launch path when Codex mode is selected
- Updated local install flow to work on fresh clones before TypeScript is built

## Practical Flow

1. `npm run install:local`
2. `npm run telegram:seed:local-machine`
3. `npm run telegram:poll`

## Work Files

- `apps/cli/src/commands/install.ts`
- `apps/cli/src/commands/onboard.ts`
- `apps/cli/src/index.ts`
- `packages/onboarding/src/question-schema.ts`
- `packages/onboarding/src/answer-validation.ts`
- `package.json`
- `README.md`
