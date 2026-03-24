# M2-S5: Run Instructions

## Goal

CLI scaffold run/test korar command gulo clear vabe document kora.

## Changed Files

- `README.md`
- `docs/milestones/05-m2-s5-run-instructions.md`

## What Was Documented

### CLI command run

From `walkie-talkie/` root:
- `node --experimental-strip-types apps/cli/src/index.ts install`

Expected output:
- `Install flow scaffolded. Next step: dependency checks (M3).`

### Smoke test run

From `walkie-talkie/` root:
- `node --test --experimental-strip-types tests/cli/install.command.test.ts`

Expected:
- 1 test pass, 0 fail.

### Optional npm script path

From `walkie-talkie/` root:
- `npm run cli`

Note:
- Current root script runs CLI without passing subcommand.
- For install flow verification, direct node command is the deterministic path in M2.

## Why This Step Matters

- New contributor quickly project state run korte parbe.
- Milestone verification repeatable hoy.
- M3 start er age baseline execution contract fixed thake.

