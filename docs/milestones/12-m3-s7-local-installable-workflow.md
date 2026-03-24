# M3-S7: Local Installable Workflow (`npm link`) Verification

## Goal

Repo-local source run chara installed command workflow e `walkie-talkie install` run verify kora.

## Changed Files

- `package.json`
- `README.md`
- `apps/cli/src/index.ts`
- `docs/milestones/12-m3-s7-local-installable-workflow.md`

## What Was Added

- Workspace script: `npm run cli:link`
- README e local installable command instructions
- CLI main-module detection fix for symlinked binary execution (`npm link` case)
- Executable bin shim: `apps/cli/bin/walkie-talkie.js`
- Linked `walkie-talkie install` now auto-runs CLI build before executing compiled entrypoint

## Verification Executed

1. `npm run cli:build`
2. `npm run cli:link`
3. `walkie-talkie install`

Observed:
- linked global command resolved
- `walkie-talkie install` printed dependency guidance
- exit code `0`
- linked command path can rebuild automatically before execution

Extra regression check:
- `node --test --experimental-strip-types tests/unit/dependency-checker.test.ts tests/unit/dependency-guidance.test.ts tests/integration/cli-routing.integration.test.ts tests/cli/install.command.test.ts`
- pass: 4, fail: 0

## Out of Scope

- `npm install -g .` alternative flow docs/verification (optional)
- install command থেকে `npm install` bootstrap logic (`M3-S8`)
