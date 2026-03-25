# System Map

## Purpose

এই file quick orientation-এর জন্য।
যে কেউ project-এ ঢুকে short time-এ বুঝতে পারবে:
- current system layers কী
- main execution flows কোনগুলো
- কোন package কোন responsibility নেয়

## Main User-Facing Flows

### 1. Install Flow

Entry:
- `apps/cli/src/index.ts`

Path:
- command route
- `install.ts`
- dependency check
- onboarding
- config write
- runtime bootstrap summary

Core files:
- `apps/cli/src/commands/install.ts`
- `packages/core/src/dependency-checker.ts`
- `packages/onboarding/src/flow.ts`
- `packages/config/src/config-store.ts`
- `packages/runtime/src/bootstrap.ts`

### 2. Orchestration Flow

Entry concept:
- trigger event

Path:
- trigger event
- config-driven flow binding
- pipeline resolve
- agent resolve
- skill execute
- run history capture

Core files:
- `packages/core/src/trigger-event.contract.ts`
- `packages/runtime/src/flow-binding.ts`
- `packages/runtime/src/orchestration.ts`
- `packages/runtime/src/run-history.ts`
- `packages/pipeline/src/*`

### 3. Dashboard Flow

Entry:
- `apps/dashboard/index.html`
- `apps/dashboard/src/main.ts`

Path:
- browser bootstrap
- shell render
- read-only sections render
- later status/log panel render

Core files:
- `apps/dashboard/src/app/bootstrap.ts`
- `apps/dashboard/src/app/shell.ts`
- `apps/dashboard/src/features/*`

## Package Responsibility Table

### `packages/core`
- shared contracts and foundational helpers

### `packages/config`
- config schema, parser, validator, store, secrets

### `packages/runtime`
- bootstrap, orchestration, flow binding, run history

### `packages/agents`
- agent definitions and registry

### `packages/skills`
- skill definitions, validation, registry

### `packages/mcp`
- MCP definitions, registry, capability map

### `packages/pipeline`
- pipeline graph and path/reporting logic

### `packages/integrations`
- Telegram and AI provider integration boundaries

### `packages/logging`
- logging, failure reporting, retry policy contract, audit events

### `packages/onboarding`
- onboarding prompts and validation

## Current Reality Check

### Already Real

- install flow
- config persistence
- orchestration slice
- rendered dashboard foundation
- logging/failure/retry/audit contracts
- persistent storage load/save path
- live Telegram transport boundary
- live AI transport boundary

### Still Demo / Partial

- fully data-driven dashboard
- worker runtime execution loop
- operator safety enforcement inside runtime
- hosted one-line installer/distribution flow

## Current Important Docs

- `docs/milestones/01-master-milestones.md`
- `docs/milestones/STATUS.md`
- `docs/architecture/04-ai-collaboration-guardrails.md`
- `docs/architecture/05-execution-docs-framework.md`
- `docs/architecture/06-ai-handoff-playbook.md`
- `docs/architecture/08-release-readiness-checklist.md`
- `docs/architecture/09-deployment-playbook.md`

## Practical Resume Shortcut

If someone asks:
"Where do I start?"

Answer:

1. read milestone source of truth
2. read current step
3. read latest milestone note
4. open the package related to that step
5. do one small verified change only
