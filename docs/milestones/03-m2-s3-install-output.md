# M2-S3: Deterministic Install Output

## Goal

`walkie-talkie install` run korle predictable output ashbe and command success exit code return korbe.

## Changed File

- `apps/cli/src/commands/install.ts`

## Function-Level Why

### `INSTALL_SCAFFOLD_MESSAGE`

Why:
- Fixed deterministic output contract define kore.
- Future CLI test e exact message assert kora easy hoy.

### `executeInstallCommand()`

Why:
- Install command er single execution point.
- Deterministic output print kore.
- Exit contract `{ exitCode: 0 }` return kore, jate caller stable behavior pay.

## Behavior Contract (M2-S3)

When `install` command is executed:
- stdout: `Install flow scaffolded. Next step: dependency checks (M3).`
- exit code: `0`

## Out of Scope

- Dependency check implementation
- Onboarding question flow
- Config write/read

