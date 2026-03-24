# M2-S2: CLI Command Registration

## Goal

`walkie-talkie install` command ke CLI entrypoint theke officially register kora.

## Changed Files

- `apps/cli/src/index.ts`
- `apps/cli/src/commands/install.ts`

## Function-by-Function Why

### `executeInstallCommand()`

File: `apps/cli/src/commands/install.ts`

Why:
- `install` command er dedicated handler lagbe.
- Command-specific logic alada file-e rakhle next milestone e dependency check/onboarding add kora easy hoy.
- Current step e function ta wiring proof hishebe exit contract return kore.

### `getCliScaffoldMetadata()`

File: `apps/cli/src/index.ts`

Why:
- CLI scaffold stage track korar jonno explicit metadata source.
- Milestone progress marker hishebe helpful (M2-S2).

### `resolveCommand(argv)`

File: `apps/cli/src/index.ts`

Why:
- Parsing logic ke execution theke separate rakhe.
- Unit test e command detection easily verify kora jabe.
- Unknown command handling deterministic rakhar base.

### `runCli(argv)`

File: `apps/cli/src/index.ts`

Why:
- Main orchestrator for CLI execution.
- `resolveCommand` + `commandRegistry` + handler execution ke single flow te compose kore.
- Exit code return koray tests e process-independent verification possible.

## Command Flow (Current)

1. `index.ts` receives `argv`
2. `resolveCommand()` checks supported command
3. If command is `install`, registry calls `executeInstallCommand()`
4. `runCli()` returns exit code
5. entrypoint sets `process.exitCode`

## Scope Boundaries

- M2-S2 only registration/wiring.
- Install message output (deterministic text) is planned for M2-S3.

