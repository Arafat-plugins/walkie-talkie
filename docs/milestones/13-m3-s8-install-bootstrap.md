# M3-S8: Install Bootstrap (`npm install`) Inside Install Command

## Goal

`walkie-talkie install` command er vitore project dependency bootstrap (`npm install`) automatic চালানো.

## Changed Files

- `apps/cli/src/commands/install.ts`
- `tests/cli/install.command.test.ts`
- `tests/integration/cli-routing.integration.test.ts`

## Function-by-Function Why

### `runProjectBootstrap()`

File: `apps/cli/src/commands/install.ts`

Why:
- Current directory te `package.json` ache naki validate kore.
- `npm install` চালিয়ে Walkie-Talkie project dependencies bootstrap kore.
- bootstrap success/failure ke explicit `exitCode` contract e map kore.

### `executeInstallCommand()` update

File: `apps/cli/src/commands/install.ts`

Why:
- Dependency health `ok` holei bootstrap phase e যায়.
- `WALKIE_SKIP_BOOTSTRAP=1` থাকলে test/runtime control mode maintain kore.
- bootstrap success hole onboarding-next message print kore.

### Test updates

Files:
- `tests/cli/install.command.test.ts`
- `tests/integration/cli-routing.integration.test.ts`

Why:
- Automated tests e real `npm install` avoid korte bootstrap skip env set kora hoyeche.
- install command output contract preserved ache kina verify kora hoyeche.

## Verification Executed

- `node --test --experimental-strip-types tests/unit/dependency-checker.test.ts tests/unit/dependency-guidance.test.ts tests/integration/cli-routing.integration.test.ts tests/cli/install.command.test.ts`
- `npm run cli:build`
- `npm run cli:link`
- `walkie-talkie install`

Observed (live command):
- dependency check output
- `Bootstrapping project dependencies with npm install...`
- `Project dependencies installed successfully.`
- exit code `0`

## Outcome

One-command flow now includes dependency bootstrap:
- `walkie-talkie install`

