# M2-S4: CLI Smoke Test

## Goal

`walkie-talkie install` command success path ke automated smoke test diye verify kora.

## Changed Files

- `apps/cli/src/index.ts`
- `apps/cli/package.json`
- `apps/cli/tsconfig.json`
- `tests/cli/install.command.test.ts`

## Function-by-Function Why

### `runCli(argv)` (existing, tested)

File: `apps/cli/src/index.ts`

Why:
- CLI execution orchestration er core function.
- Smoke test e process spawn chara direct verification possible.

### `INSTALL_SCAFFOLD_MESSAGE` (existing, asserted)

File: `apps/cli/src/commands/install.ts`

Why:
- Deterministic output contract.
- Test e expected stdout assert korar stable source.

## Config/Script Changes Why

### `apps/cli/src/index.ts` import path

- `./commands/install.ts` use kora hoyeche jate Node `--experimental-strip-types` runtime e direct resolve korte pare.

### `apps/cli/package.json` scripts

- `dev`: TypeScript source direct run for current milestone.
- `test:smoke`: single smoke test run command.
- `typecheck`: no-emit type validation path.

### `apps/cli/tsconfig.json`

- `allowImportingTsExtensions: true` to support `.ts` import paths.
- `noEmit: true` কারণ ei phase e runtime source-first execution use hocche.

## Test Case

File: `tests/cli/install.command.test.ts`

Case:
- Input argv: `["node", "walkie-talkie", "install"]`
- Expected:
  - `runCli(...)` returns `0`
  - first log equals `INSTALL_SCAFFOLD_MESSAGE`

## Verification Executed

- `node --experimental-strip-types apps/cli/src/index.ts install` -> success output
- `node --test --experimental-strip-types tests/cli/install.command.test.ts` -> 1 pass, 0 fail

