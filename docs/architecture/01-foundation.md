# Architecture Foundation (Milestone 1)

## Goals of This Structure

- Keep CLI, runtime, dashboard, and domain modules separated.
- Support unlimited agents, skills, MCP servers, and pipelines.
- Enable incremental delivery without future rewrites.
- Keep install/onboarding path explicit and testable.

## Top-Level Strategy

- `apps/`: runnable entry points (CLI, Dashboard).
- `packages/`: reusable domain modules and platform services.
- `scripts/`: project automation scripts (install/dev helpers).
- `config/`: schemas and static configuration templates.
- `docs/`: architecture, milestone docs, runbooks.
- `tests/`: test suites by type.

## Why This Supports Dynamic Behavior

- Dynamic entities are isolated in dedicated packages:
  - agents in `packages/agents`
  - skills in `packages/skills`
  - MCP servers in `packages/mcp`
  - orchestration graph in `packages/pipeline`
- Triggers and providers are integration adapters in `packages/integrations`.
- Runtime composition lives in `packages/runtime`, so one component can be reused in multiple flows.
- CLI and dashboard both consume same package layer, preventing duplicated business logic.

## Install-First Execution Order (Phase 1-2)

1. `apps/cli` receives `walkie-talkie install` command.
2. CLI calls dependency validation in `packages/core`.
3. Onboarding Q/A runs via `packages/onboarding`.
4. Validated settings are persisted by `packages/config`.
5. Runtime bootstrap in `packages/runtime` verifies ready state.

This order keeps install flow deterministic and easy to test.

## Naming Conventions

- Folder names: `kebab-case`
- TypeScript files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants/env keys: `UPPER_SNAKE_CASE`
- Docs: numeric prefix for sequence, e.g. `01-foundation.md`

## Future Expansion Rules

- New integration? Add under `packages/integrations/src/<provider>`.
- New trigger type? Add under `packages/pipeline` and keep trigger contract in `packages/core`.
- New external protocol (non-MCP)? Add separate package; do not overload `mcp` package.
- Dashboard feature grows under `apps/dashboard/src/features/<feature-name>`.

## Non-Goals in This Milestone

- No command implementation.
- No dependency installation automation yet.
- No onboarding question engine yet.
- No dashboard UI implementation yet.

