# Folder Map (Milestone 1)

## Root

- `apps/`: executable applications.
- `packages/`: reusable internal libraries.
- `scripts/`: CLI/bootstrap helper scripts.
- `config/`: schemas and static defaults.
- `docs/`: architecture and milestone docs.
- `tests/`: unit/integration/cli/e2e tests.
- `.changeset/`: release/version notes (future).

## apps

- `apps/cli`: command entrypoint (`walkie-talkie ...`).
- `apps/cli/src/commands`: top-level commands (`install`, `doctor`, etc.).
- `apps/cli/src/install`: install flow composition for CLI.
- `apps/cli/src/shared`: reusable CLI helpers.
- `apps/dashboard`: Next.js/React control plane.
- `apps/dashboard/src/app`: route-level app structure.
- `apps/dashboard/src/components`: shared UI components.
- `apps/dashboard/src/features`: feature-specific UI/domain glue.
- `apps/dashboard/src/lib`: dashboard-only helpers.

## packages

- `packages/core`: shared contracts, validators, dependency checks.
- `packages/config`: config schema loading, validation, read/write.
- `packages/onboarding`: question flow + setup orchestration.
- `packages/runtime`: runtime assembly and process bootstrap.
- `packages/agents`: agent definitions, registry, execution contracts.
- `packages/skills`: skill definitions, registry, execution wrappers.
- `packages/mcp`: MCP server registry, clients, capabilities mapping.
- `packages/pipeline`: dynamic flow graph and execution engine.
- `packages/integrations`: external adapters.
- `packages/integrations/src/telegram`: Telegram-specific adapter.
- `packages/integrations/src/ai`: AI provider adapters (OpenAI compatible first).
- `packages/logging`: log transport and log format contracts.
- `packages/shared`: low-level utilities shared across packages.

## scripts

- `scripts/install`: local setup or installer support scripts.
- `scripts/dev`: development helper commands.

## config

- `config/schema`: JSON/YAML schema files for configuration contracts.

## docs

- `docs/architecture`: architecture decisions and folder map.
- `docs/milestones`: incremental roadmap and completion criteria.

## tests

- `tests/unit`: module-level tests.
- `tests/integration`: cross-package flow tests.
- `tests/cli`: command behavior tests.
- `tests/e2e`: end-to-end scenarios.
- `tests/fixtures`: shared test data.

## First Folders Used by Installation System

1. `apps/cli/src/commands`
2. `apps/cli/src/install`
3. `packages/core/src`
4. `packages/onboarding/src`
5. `packages/config/src`
6. `packages/runtime/src`
7. `tests/cli` and `tests/integration`

