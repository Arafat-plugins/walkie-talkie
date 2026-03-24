# Patch: Install Config Persistence

## Why This Patch Was Added

Original install flow onboarding answers collect করছিল, কিন্তু data disk-এ persist করছিল না।

That meant:
- install asked for real data
- answers validated successfully
- but nothing was saved
- process ended and data was lost

This patch closes that gap.

## Changed Files

- `apps/cli/src/commands/install.ts`
- `tests/integration/install-config-persistence.integration.test.ts`

## What Changed

### `apps/cli/src/commands/install.ts`

Added:
- `buildConfigFromOnboardingAnswers(answers)`
  - onboarding answers থেকে `WalkieTalkieConfig` object build করে
- onboarding success path now:
  - build config
  - write `walkie-talkie.config.json`
  - print saved config path
  - run runtime bootstrap
  - print runtime summary

New install flow after onboarding success:
1. answers collected
2. config object built
3. config file saved
4. runtime bootstrap verified
5. runtime summary printed

### `tests/integration/install-config-persistence.integration.test.ts`

Added coverage for:
- onboarding answers -> config mapping
- persisted config file -> runtime bootstrap success

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/cli/install.command.test.ts tests/integration/cli-routing.integration.test.ts tests/integration/onboarding-install.integration.test.ts tests/integration/runtime-bootstrap-smoke.test.ts tests/integration/install-config-persistence.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Current Result

Now install flow no longer loses onboarding data.

Saved file:
- `walkie-talkie.config.json` in project root

## Main Track Status

This patch does not change the main current milestone step.

Main track remains:
- Milestone: `M8`
- Step: `M8-S3`
