# Walkie-Talkie Master Milestones (Source of Truth)

## Purpose

This file is the single source of truth for project progress.
All implementation must follow this file milestone-by-milestone.

## Working Contract

- Always execute one tiny real step at a time.
- Do not jump to next milestone until current milestone is marked done.
- After each step, update `Current Milestone`, `Current Step`, and `Done Log`.
- For each completed step, append `work files:` with touched file paths in the step line.
- If context is lost, resume by reading this file first.

## Global Status

- Project: Walkie-Talkie
- Mode: Milestone-based incremental delivery
- Current Milestone: `M20`
- Current Step: `M20-S2`
- Last Completed Milestone: `M18`

## Milestone Map

### M1: Foundation Structure and Architecture Docs

Status: `DONE`

Steps:
- M1-S1 Create base folder tree.
- M1-S2 Add architecture foundation doc.
- M1-S3 Add folder map doc.
- M1-S4 Add initial roadmap.

Done Criteria:
- Empty structure exists.
- Folder responsibilities documented.
- Next milestone is clearly defined.

### M2: CLI Install Command Skeleton

Status: `DONE`

Steps:
- [x] M2-S1 Setup minimal CLI package scaffolding. work files: `package.json`, `tsconfig.base.json`, `apps/cli/package.json`, `apps/cli/tsconfig.json`, `apps/cli/src/index.ts`
- [x] M2-S2 Add `walkie-talkie install` command registration. work files: `apps/cli/src/commands/install.ts`, `apps/cli/src/index.ts`, `docs/milestones/02-m2-s2-cli-command-registration.md`
- [x] M2-S3 Command prints deterministic scaffold message and exits `0`. work files: `apps/cli/src/commands/install.ts`, `docs/milestones/03-m2-s3-install-output.md`
- [x] M2-S4 Add CLI smoke test for command success. work files: `apps/cli/src/index.ts`, `apps/cli/package.json`, `apps/cli/tsconfig.json`, `tests/cli/install.command.test.ts`, `docs/milestones/04-m2-s4-cli-smoke-test.md`
- [x] M2-S5 Document run instructions. work files: `README.md`, `docs/milestones/05-m2-s5-run-instructions.md`

Done Criteria:
- Install command exists.
- Command returns success.
- Smoke test passes.

### M3: Dependency Checker (Node.js and npm)

Status: `DONE`

Steps:
- [x] M3-S1 Create dependency check contracts in `packages/core`. work files: `packages/core/src/dependency-checker.contract.ts`, `packages/core/src/index.ts`, `docs/milestones/06-m3-s1-dependency-contracts.md`
- [x] M3-S2 Detect Node.js and npm presence/versions. work files: `packages/core/src/dependency-checker.ts`, `packages/core/src/index.ts`, `docs/milestones/07-m3-s2-detect-versions.md`
- [x] M3-S3 Add failure guidance output. work files: `packages/core/src/dependency-guidance.ts`, `packages/core/src/index.ts`, `docs/milestones/08-m3-s3-failure-guidance.md`
- [x] M3-S4 Wire checker to install command. work files: `apps/cli/src/commands/install.ts`, `apps/cli/src/index.ts`, `tests/cli/install.command.test.ts`, `docs/milestones/09-m3-s4-wire-checker-to-install.md`
- [x] M3-S5 Add unit + CLI integration tests. work files: `tests/unit/dependency-checker.test.ts`, `tests/unit/dependency-guidance.test.ts`, `tests/integration/cli-routing.integration.test.ts`, `docs/milestones/10-m3-s5-tests.md`
- [x] M3-S6 Add real CLI executable path (`dist` build + bin + shebang) for `walkie-talkie install`. work files: `apps/cli/src/index.ts`, `apps/cli/package.json`, `apps/cli/tsconfig.build.json`, `package.json`, `package-lock.json`, `docs/milestones/11-m3-s6-cli-executable-path.md`
- [x] M3-S7 Add local installable workflow (`npm link` / `npm install -g .`) and verification commands. work files: `package.json`, `README.md`, `apps/cli/src/index.ts`, `apps/cli/bin/walkie-talkie.js`, `apps/cli/package.json`, `docs/milestones/12-m3-s7-local-installable-workflow.md`
- [x] M3-S8 Add install bootstrap step inside command (`npm install`/workspace bootstrap for Walkie-Talkie deps). work files: `apps/cli/src/commands/install.ts`, `tests/cli/install.command.test.ts`, `tests/integration/cli-routing.integration.test.ts`, `docs/milestones/13-m3-s8-install-bootstrap.md`

Done Criteria:
- Missing dependency detected correctly.
- User gets actionable guidance.
- CLI handles pass/fail branches safely.
- `walkie-talkie install` can be executed as an installed command (not source-only run).
- Install command can bootstrap Walkie-Talkie project dependencies.

### M4: Onboarding Wizard Shell

Status: `DONE`

Steps:
- [x] M4-S1 Define onboarding question schema. work files: `packages/onboarding/src/question-schema.ts`, `packages/onboarding/src/index.ts`, `tests/unit/onboarding-question-schema.test.ts`, `docs/milestones/14-m4-s1-onboarding-question-schema.md`
- [x] M4-S2 Build terminal prompt flow shell. work files: `packages/onboarding/src/prompt-shell.ts`, `packages/onboarding/src/index.ts`, `tests/unit/onboarding-prompt-shell.test.ts`, `docs/milestones/15-m4-s2-terminal-prompt-shell.md`
- [x] M4-S3 Add validation for required answers. work files: `packages/onboarding/src/answer-validation.ts`, `packages/onboarding/src/index.ts`, `tests/unit/onboarding-answer-validation.test.ts`, `docs/milestones/16-m4-s3-answer-validation.md`
- [x] M4-S4 Integrate with install flow. work files: `apps/cli/src/commands/install.ts`, `tests/cli/install.command.test.ts`, `tests/integration/cli-routing.integration.test.ts`, `tests/integration/onboarding-install.integration.test.ts`, `docs/milestones/17-m4-s4-install-flow-integration.md`
- [x] M4-S5 Add onboarding flow tests. work files: `packages/onboarding/src/flow.ts`, `packages/onboarding/src/index.ts`, `apps/cli/src/commands/install.ts`, `tests/integration/onboarding-flow.integration.test.ts`, `docs/milestones/18-m4-s5-onboarding-flow-tests.md`

Done Criteria:
- Wizard asks core questions.
- Invalid input is handled.
- Result object is produced for config writer.

### M5: Config Validation and Persistence

Status: `DONE`

Steps:
- [x] M5-S1 Define config schema in `config/schema`. work files: `config/schema/walkie-talkie.config.schema.json`, `docs/milestones/19-m5-s1-config-schema.md`
- [x] M5-S2 Implement parser + validator in `packages/config`. work files: `packages/config/src/schema.ts`, `packages/config/src/config-parser.ts`, `packages/config/src/index.ts`, `tests/unit/config-parser.test.ts`, `docs/milestones/20-m5-s2-config-parser-validator.md`
- [x] M5-S3 Implement config writer and reader. work files: `packages/config/src/config-store.ts`, `packages/config/src/index.ts`, `tests/unit/config-store.test.ts`, `docs/milestones/21-m5-s3-config-writer-reader.md`
- [x] M5-S4 Add secure secrets handling strategy (initial). work files: `packages/config/src/secrets.ts`, `packages/config/src/index.ts`, `tests/unit/config-secrets.test.ts`, `docs/milestones/22-m5-s4-secrets-handling.md`
- [x] M5-S5 Add tests for valid/invalid configs. work files: `tests/unit/config-parser.test.ts`, `tests/unit/config-store.test.ts`, `tests/unit/config-secrets.test.ts`, `docs/milestones/23-m5-s5-config-tests.md`

Done Criteria:
- Config save/load works.
- Invalid config fails with clear error.
- Secrets are not carelessly printed.

### M6: Runtime Bootstrap (Initial)

Status: `DONE`

Steps:
- [x] M6-S1 Create runtime bootstrap entry in `packages/runtime`. work files: `packages/runtime/src/bootstrap.ts`, `packages/runtime/src/index.ts`, `tests/unit/runtime-bootstrap.test.ts`, `docs/milestones/24-m6-s1-runtime-bootstrap-entry.md`
- [x] M6-S2 Verify required config before start. work files: `packages/runtime/src/readiness.ts`, `packages/runtime/src/bootstrap.ts`, `packages/runtime/src/index.ts`, `tests/unit/runtime-bootstrap.test.ts`, `docs/milestones/25-m6-s2-runtime-readiness-checks.md`
- [x] M6-S3 Print runtime readiness summary. work files: `packages/runtime/src/bootstrap.ts`, `tests/unit/runtime-bootstrap.test.ts`, `docs/milestones/26-m6-s3-runtime-readiness-summary.md`
- [x] M6-S4 Add bootstrap smoke tests. work files: `tests/integration/runtime-bootstrap-smoke.test.ts`, `docs/milestones/27-m6-s4-runtime-bootstrap-smoke-tests.md`

Done Criteria:
- System can complete basic ready-check boot.
- Fail-fast on missing critical config.

### M7: Agent Registry Core

Status: `DONE`

Steps:
- [x] M7-S1 Define agent contracts. work files: `packages/agents/src/agent-contract.ts`, `packages/agents/src/index.ts`, `tests/unit/agent-contracts.test.ts`, `docs/milestones/28-m7-s1-agent-contracts.md`
- [x] M7-S2 Implement in-memory agent registry. work files: `packages/agents/src/agent-registry.ts`, `packages/agents/src/index.ts`, `tests/unit/agent-registry.test.ts`, `docs/milestones/29-m7-s2-agent-registry.md`
- [x] M7-S3 Add create/list/get APIs. work files: `packages/agents/src/agent-registry.ts`, `tests/unit/agent-registry.test.ts`, `docs/milestones/30-m7-s3-agent-registry-apis.md`
- [x] M7-S4 Add tests. work files: `tests/unit/agent-registry.test.ts`, `docs/milestones/31-m7-s4-agent-registry-tests.md`

### M8: Skill Registry Core

Status: `DONE`

Steps:
- [x] M8-S1 Define skill contracts. work files: `packages/skills/src/skill-contract.ts`, `packages/skills/src/index.ts`, `tests/unit/skill-contracts.test.ts`, `docs/milestones/32-m8-s1-skill-contracts.md`
- [x] M8-S2 Implement skill registry + loader. work files: `packages/skills/src/skill-registry.ts`, `packages/skills/src/index.ts`, `tests/unit/skill-registry.test.ts`, `docs/milestones/33-m8-s2-skill-registry-loader.md`
- [x] M8-S3 Validate skill interface. work files: `packages/skills/src/skill-validation.ts`, `packages/skills/src/skill-registry.ts`, `packages/skills/src/index.ts`, `tests/unit/skill-validation.test.ts`, `tests/unit/skill-registry.test.ts`, `docs/milestones/35-m8-s3-skill-interface-validation.md`
- [x] M8-S4 Add tests. work files: `tests/integration/skill-registry-smoke.test.ts`, `docs/milestones/36-m8-s4-skill-tests.md`

### M9: MCP Registry Core

Status: `DONE`

Steps:
- [x] M9-S1 Define MCP server contract. work files: `packages/mcp/src/mcp-contract.ts`, `packages/mcp/src/index.ts`, `tests/unit/mcp-contracts.test.ts`, `docs/milestones/37-m9-s1-mcp-contracts.md`
- [x] M9-S2 Implement MCP registration/unregistration. work files: `packages/mcp/src/mcp-registry.ts`, `packages/mcp/src/index.ts`, `tests/unit/mcp-registry.test.ts`, `docs/milestones/38-m9-s2-mcp-registry.md`
- [x] M9-S3 Add capability metadata mapping. work files: `packages/mcp/src/capability-map.ts`, `packages/mcp/src/index.ts`, `tests/unit/mcp-capability-map.test.ts`, `docs/milestones/39-m9-s3-mcp-capability-mapping.md`
- [x] M9-S4 Add tests. work files: `tests/integration/mcp-registry-smoke.test.ts`, `docs/milestones/40-m9-s4-mcp-tests.md`

### M10: Pipeline Engine Core

Status: `DONE`

Steps:
- [x] M10-S1 Define pipeline node/edge contract. work files: `packages/pipeline/src/pipeline-contract.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-contracts.test.ts`, `docs/milestones/41-m10-s1-pipeline-contracts.md`
- [x] M10-S2 Implement sequential execution path. work files: `packages/pipeline/src/sequential-path.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-sequential-path.test.ts`, `docs/milestones/42-m10-s2-sequential-execution-path.md`
- [x] M10-S3 Implement basic branching support. work files: `packages/pipeline/src/branching-path.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-branching-path.test.ts`, `docs/milestones/43-m10-s3-basic-branching-support.md`
- [x] M10-S4 Error handling and execution report. work files: `packages/pipeline/src/execution-report.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-execution-report.test.ts`, `docs/milestones/44-m10-s4-execution-report.md`
- [x] M10-S5 Add integration tests. work files: `tests/integration/pipeline-engine-smoke.test.ts`, `docs/milestones/45-m10-s5-pipeline-integration-tests.md`

### M11: Telegram Integration

Status: `DONE`

Steps:
- [x] M11-S1 Create Telegram adapter skeleton. work files: `packages/integrations/src/telegram/telegram-adapter.ts`, `packages/integrations/src/telegram/index.ts`, `packages/integrations/src/index.ts`, `tests/unit/telegram-adapter.test.ts`, `docs/milestones/46-m11-s1-telegram-adapter-skeleton.md`
- [x] M11-S2 Add webhook/polling mode abstraction. work files: `packages/integrations/src/telegram/telegram-delivery-mode.ts`, `packages/integrations/src/telegram/telegram-adapter.ts`, `packages/integrations/src/telegram/index.ts`, `tests/unit/telegram-adapter.test.ts`, `docs/milestones/47-m11-s2-telegram-delivery-modes.md`
- [x] M11-S3 Map incoming message to trigger contract. work files: `packages/core/src/trigger-event.contract.ts`, `packages/core/src/index.ts`, `packages/integrations/src/telegram/telegram-trigger.ts`, `packages/integrations/src/telegram/index.ts`, `tests/unit/telegram-trigger.test.ts`, `docs/milestones/48-m11-s3-telegram-trigger-mapping.md`
- [x] M11-S4 Add connector tests with fixtures. work files: `tests/fixtures/telegram/message-update.json`, `tests/fixtures/telegram/callback-update.json`, `tests/integration/telegram-connector-smoke.test.ts`, `docs/milestones/49-m11-s4-telegram-connector-fixtures.md`

### M12: AI Provider Integration (OpenAI-Compatible First)

Status: `DONE`

Steps:
- [x] M12-S1 Define provider interface. work files: `packages/integrations/src/ai/provider-contract.ts`, `packages/integrations/src/ai/index.ts`, `packages/integrations/src/index.ts`, `tests/unit/ai-provider-contract.test.ts`, `docs/milestones/50-m12-s1-ai-provider-interface.md`
- [x] M12-S2 Implement first provider adapter. work files: `packages/integrations/src/ai/openai-compatible-adapter.ts`, `packages/integrations/src/ai/index.ts`, `tests/unit/openai-compatible-adapter.test.ts`, `docs/milestones/51-m12-s2-openai-compatible-adapter.md`
- [x] M12-S3 Add timeout/error normalization. work files: `packages/integrations/src/ai/provider-contract.ts`, `packages/integrations/src/ai/openai-compatible-adapter.ts`, `tests/unit/openai-compatible-adapter.test.ts`, `docs/milestones/52-m12-s3-provider-error-normalization.md`
- [x] M12-S4 Add tests and mock fixtures. work files: `tests/fixtures/ai/openai-compatible-request.json`, `tests/fixtures/ai/openai-compatible-response.json`, `tests/integration/ai-provider-smoke.test.ts`, `docs/milestones/53-m12-s4-ai-provider-fixtures.md`

### M13: End-to-End Orchestration Path (CLI Trigger)

Status: `DONE`

Steps:
- [x] M13-S1 Connect trigger -> pipeline -> agent/skill. work files: `packages/runtime/src/orchestration.ts`, `packages/runtime/src/index.ts`, `tests/integration/trigger-pipeline-agent-skill.integration.test.ts`, `docs/milestones/54-m13-s1-trigger-pipeline-agent-skill.md`
- [x] M13-S2 Add config-driven flow binding. work files: `packages/config/src/schema.ts`, `packages/config/src/config-parser.ts`, `config/schema/walkie-talkie.config.schema.json`, `packages/runtime/src/flow-binding.ts`, `packages/runtime/src/index.ts`, `tests/unit/config-parser.test.ts`, `tests/integration/config-driven-orchestration.integration.test.ts`, `docs/milestones/55-m13-s2-config-driven-flow-binding.md`
- [x] M13-S3 Add minimal run history capture. work files: `packages/runtime/src/run-history.ts`, `packages/runtime/src/index.ts`, `tests/integration/run-history.integration.test.ts`, `docs/milestones/56-m13-s3-run-history.md`
- [x] M13-S4 Add E2E verification scenario. work files: `tests/integration/orchestration-e2e.integration.test.ts`, `docs/milestones/57-m13-s4-orchestration-e2e.md`

### M14: Dashboard Foundation

Status: `DONE`

Steps:
- [x] M14-S1 Setup dashboard app shell. work files: `apps/dashboard/package.json`, `apps/dashboard/tsconfig.json`, `apps/dashboard/src/app/shell.ts`, `apps/dashboard/src/index.ts`, `tests/unit/dashboard-shell.test.ts`, `docs/milestones/58-m14-s1-dashboard-shell.md`
- [x] M14-S2 Add read-only views for agents/skills/mcp. work files: `apps/dashboard/src/features/read-only-views.ts`, `apps/dashboard/src/index.ts`, `apps/dashboard/tsconfig.json`, `tests/unit/dashboard-read-only-views.test.ts`, `docs/milestones/59-m14-s2-dashboard-read-only-views.md`
- [x] M14-S3 Add pipeline list view. work files: `apps/dashboard/src/features/pipeline-list-view.ts`, `apps/dashboard/src/index.ts`, `tests/unit/dashboard-pipeline-list.test.ts`, `docs/milestones/60-m14-s3-dashboard-pipeline-list.md`
- [x] M14-S4 Add basic status/log panel. work files: `apps/dashboard/src/features/status-log-panel.ts`, `apps/dashboard/src/index.ts`, `tests/unit/dashboard-status-log-panel.test.ts`, `docs/milestones/61-m14-s4-dashboard-status-log-panel.md`

### M15: Reliability Layer (Logging, Retry-Ready, Audit Base)

Status: `DONE`

Steps:
- [x] M15-S1 Standardize log contract and levels. work files: `packages/logging/src/log-contract.ts`, `packages/logging/src/index.ts`, `tests/unit/log-contract.test.ts`, `docs/milestones/62-m15-s1-log-contract-and-levels.md`
- [x] M15-S2 Add failure report objects. work files: `packages/logging/src/failure-report.ts`, `packages/logging/src/index.ts`, `tests/unit/failure-report.test.ts`, `docs/milestones/63-m15-s2-failure-report-objects.md`
- [x] M15-S3 Prepare retry policy interface (implementation later). work files: `packages/logging/src/retry-policy.ts`, `packages/logging/src/index.ts`, `tests/unit/retry-policy.test.ts`, `docs/milestones/64-m15-s3-retry-policy-interface.md`
- [x] M15-S4 Add audit event model and storage interface. work files: `packages/logging/src/audit-event.ts`, `packages/logging/src/index.ts`, `tests/unit/audit-event.test.ts`, `docs/milestones/65-m15-s4-audit-event-model.md`

Done Criteria:
- shared log contract exists
- failure reports are structured
- retry policy interface is prepared
- audit event model and storage boundary are defined

### M16: Live Telegram Transport

Status: `DONE`

Steps:
- [x] M16-S1 Define Telegram runtime config contract for live mode. work files: `packages/integrations/src/telegram/telegram-runtime-config.ts`, `packages/integrations/src/telegram/index.ts`, `packages/config/src/schema.ts`, `packages/config/src/config-parser.ts`, `packages/runtime/src/readiness.ts`, `config/schema/walkie-talkie.config.schema.json`, `tests/unit/config-parser.test.ts`, `tests/unit/runtime-bootstrap.test.ts`, `tests/unit/telegram-runtime-config.test.ts`, `docs/milestones/71-m16-s1-telegram-runtime-config-contract.md`
- [x] M16-S2 Implement Telegram Bot API client for send/poll operations. work files: `packages/integrations/src/telegram/telegram-bot-api.ts`, `packages/integrations/src/telegram/index.ts`, `tests/unit/telegram-bot-api.test.ts`, `docs/milestones/72-m16-s2-telegram-bot-api-client.md`
- [x] M16-S3 Add polling runner with trigger event handoff into runtime orchestration. work files: `packages/integrations/src/telegram/telegram-polling-runner.ts`, `packages/integrations/src/telegram/index.ts`, `tests/integration/telegram-polling-runner.integration.test.ts`, `docs/milestones/73-m16-s3-telegram-polling-runner.md`
- [x] M16-S4 Add webhook mode contract and handler boundary. work files: `packages/integrations/src/telegram/telegram-webhook-handler.ts`, `packages/integrations/src/telegram/index.ts`, `tests/integration/telegram-webhook-handler.integration.test.ts`, `docs/milestones/74-m16-s4-telegram-webhook-handler.md`
- [x] M16-S5 Add live transport smoke tests with mocked network fixtures. work files: `tests/fixtures/telegram/get-updates-response.json`, `tests/fixtures/telegram/send-message-response.json`, `tests/integration/telegram-live-transport-smoke.test.ts`, `docs/milestones/75-m16-s5-telegram-live-transport-smoke.md`

Done Criteria:
- bot token can be loaded from config
- polling runner can turn real updates into trigger events
- outgoing Telegram replies can be sent through a real client boundary
- webhook and polling modes have stable runtime contracts

### M17: Real AI HTTP Transport

Status: `DONE`

Steps:
- [x] M17-S1 Define live HTTP transport contract for AI providers. work files: `packages/integrations/src/ai/http-transport.ts`, `packages/integrations/src/ai/index.ts`, `tests/unit/ai-http-transport.test.ts`, `docs/milestones/76-m17-s1-ai-http-transport-contract.md`
- [x] M17-S2 Implement fetch-based OpenAI-compatible transport. work files: `packages/integrations/src/ai/http-transport.ts`, `packages/integrations/src/ai/openai-compatible-http-transport.ts`, `packages/integrations/src/ai/index.ts`, `tests/unit/openai-compatible-http-transport.test.ts`, `docs/milestones/77-m17-s2-openai-fetch-transport.md`
- [x] M17-S3 Load provider secrets/config into runtime provider wiring. work files: `packages/runtime/src/provider-wiring.ts`, `packages/runtime/src/index.ts`, `tests/unit/runtime-ai-provider.test.ts`, `docs/milestones/78-m17-s3-runtime-ai-provider-wiring.md`
- [x] M17-S4 Add transport-level retry/timeout integration using reliability contracts. work files: `packages/integrations/src/ai/openai-compatible-adapter.ts`, `tests/unit/openai-compatible-adapter.test.ts`, `docs/milestones/79-m17-s4-ai-retry-timeout-integration.md`
- [x] M17-S5 Add live adapter smoke tests with mocked HTTP fixtures. work files: `tests/integration/ai-live-http-transport-smoke.test.ts`, `docs/milestones/80-m17-s5-ai-live-http-smoke.md`

Done Criteria:
- provider adapter can execute real HTTP calls
- runtime can load provider config and secrets safely
- timeout/retry behavior is wired through shared reliability contracts

### M18: Persistent Storage and State

Status: `DONE`

Steps:
- [x] M18-S1 Define storage contracts for entities, runs, and audit data. work files: `packages/shared/src/storage-contract.ts`, `packages/shared/src/index.ts`, `tests/unit/storage-contract.test.ts`, `docs/milestones/81-m18-s1-storage-contracts.md`
- [x] M18-S2 Implement file-based persistence for agents/skills/pipelines. work files: `packages/shared/src/entity-file-storage.ts`, `packages/shared/src/index.ts`, `.gitignore`, `tests/unit/entity-file-storage.test.ts`, `docs/milestones/83-m18-s2-entity-file-persistence.md`
- [x] M18-S3 Persist run history and audit events. work files: `packages/shared/src/runtime-file-storage.ts`, `packages/shared/src/index.ts`, `tests/unit/runtime-file-storage.test.ts`, `docs/milestones/84-m18-s3-runtime-file-persistence.md`
- [x] M18-S4 Add config/runtime state loading from persistent storage. work files: `packages/runtime/src/persistent-state.ts`, `packages/runtime/src/index.ts`, `packages/logging/src/audit-event.ts`, `packages/runtime/src/run-history.ts`, `packages/skills/src/skill-registry.ts`, `packages/mcp/src/mcp-registry.ts`, `tests/unit/persistent-state.test.ts`, `tests/unit/audit-event.test.ts`, `tests/unit/skill-registry.test.ts`, `tests/unit/mcp-registry.test.ts`, `docs/milestones/85-m18-s4-persistent-state-loading.md`
- [x] M18-S5 Add persistence integration tests. work files: `tests/integration/persistent-storage.integration.test.ts`, `docs/milestones/86-m18-s5-persistence-integration-tests.md`

Done Criteria:
- registries can be restored from disk-backed storage
- runs and audit entries survive process restarts
- persistence layer has deterministic test coverage

### M19: Rendered Dashboard UI

Status: `DONE`

Priority Note:
- User requested dashboard-first execution before live transport work.

Steps:
- [x] M19-S1 Choose dashboard runtime/render stack and add app bootstrap. work files: `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/src/main.ts`, `apps/dashboard/src/index.ts`, `apps/dashboard/index.html`, `apps/dashboard/tsconfig.build.json`, `apps/dashboard/package.json`, `package.json`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/66-m19-s1-dashboard-runtime-bootstrap.md`
- [x] M19-S2 Render overview shell from current dashboard models. work files: `apps/dashboard/src/app/shell.ts`, `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/index.html`, `tests/unit/dashboard-shell.test.ts`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/67-m19-s2-dashboard-overview-shell.md`
- [x] M19-S3 Render read-only views for agents/skills/MCP/pipelines. work files: `apps/dashboard/src/features/platform-sections.ts`, `apps/dashboard/src/app/shell.ts`, `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/src/index.ts`, `apps/dashboard/index.html`, `tests/unit/dashboard-platform-sections.test.ts`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/68-m19-s3-dashboard-read-only-sections.md`
- [x] M19-S4 Render status/log panel from run history and audit data. work files: `apps/dashboard/src/features/status-log-panel.ts`, `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/index.html`, `tests/unit/dashboard-status-log-panel.test.ts`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/69-m19-s4-dashboard-status-log-render.md`
- [x] M19-S5 Add dashboard smoke tests and local run command. work files: `apps/dashboard/scripts/serve.mjs`, `package.json`, `README.md`, `tests/integration/dashboard-serve-smoke.test.ts`, `docs/milestones/70-m19-s5-dashboard-smoke-and-serve.md`

Done Criteria:
- dashboard can render in a browser
- current read-only models are visible in the UI
- local dashboard run command is documented and verified

### M20: Productization and Operations

Status: `PENDING`

Steps:
- [x] M20-S1 Add production install/bootstrap plan and installer script boundary. work files: `packages/core/src/production-bootstrap-plan.ts`, `packages/core/src/index.ts`, `scripts/install/production-bootstrap.ts`, `package.json`, `README.md`, `tests/unit/production-bootstrap-plan.test.ts`, `tests/integration/production-bootstrap-boundary.integration.test.ts`, `docs/milestones/87-m20-s1-production-bootstrap-boundary.md`
- M20-S2 Add background worker/scheduler runtime contract.
- M20-S3 Add secret management upgrade path and env loading policy.
- M20-S4 Add operator safety controls (budgets, approvals, allowlists).
- M20-S5 Add release-readiness checklist and deployment docs.

Done Criteria:
- production deployment path is documented and scaffolded
- long-running/background execution shape is defined
- operational safety controls have clear contracts
- release checklist exists for next delivery stage

### M21: One-Line Installer and Distribution

Status: `PENDING`

Purpose Note:
- User wants GitHub-hosted one-line install support similar to `curl ... | bash`, without overloading the base install flow.

Steps:
- M21-S1 Define hosted installer contract and release assumptions.
- M21-S2 Add `scripts/install.sh` for Linux/macOS bootstrap.
- M21-S3 Add Windows installer boundary (`install.ps1` or equivalent plan).
- M21-S4 Add global CLI install/link strategy for release builds.
- M21-S5 Add installer smoke docs, safety notes, and rollback/update guidance.

Done Criteria:
- hosted one-line installer path is documented
- Linux/macOS bootstrap script exists
- Windows installer path is defined
- release build install flow is clear and testable
- installer safety/rollback rules are documented

## Done Log

- 2026-03-13: M1 completed (structure + architecture docs).
- 2026-03-13: M2-S1 completed (root workspace + CLI package scaffold + TS config + CLI entry file).
- 2026-03-13: M2-S2 completed (install command module + registry + command resolver and runner flow).
- 2026-03-13: M2-S3 completed (deterministic install output and explicit success exit contract).
- 2026-03-21: Install persistence patch added (onboarding answers now save to `walkie-talkie.config.json` and runtime summary runs after save). work files: `apps/cli/src/commands/install.ts`, `tests/integration/install-config-persistence.integration.test.ts`, `docs/milestones/34-install-config-persistence-patch.md`
- 2026-03-21: M8-S2 completed (skill registry + handler loader).
- 2026-03-19: M8-S1 completed (skill contracts and handler signature).
- 2026-03-19: M7-S4 completed (agent registry test coverage; M7 done).
- 2026-03-19: M7-S3 completed (agent registry public create/list/get APIs).
- 2026-03-19: M7-S2 completed (in-memory agent registry storage layer).
- 2026-03-19: M7-S1 completed (agent contracts and defaulting helper).
- 2026-03-19: M6-S4 completed (runtime bootstrap smoke coverage; M6 done).
- 2026-03-19: M6-S3 completed (runtime bootstrap summary contract).
- 2026-03-19: M6-S2 completed (runtime readiness checks for startup-critical config).
- 2026-03-18: M6-S1 completed (runtime bootstrap entry + initial success/failure contract).
- 2026-03-17: M5-S5 completed (broader valid/invalid config coverage).
- 2026-03-16: M5-S4 completed (initial secrets registry + masking helpers).
- 2026-03-15: M5-S3 completed (config writer + reader persistence layer).
- 2026-03-15: M5-S2 completed (config parser + validator contract in packages/config).
- 2026-03-13: M2-S4 completed (CLI smoke test added and passing).
- 2026-03-13: M2-S5 completed (run instructions documented in README and milestone note).
- 2026-03-13: M3-S1 completed (dependency checker contracts defined in packages/core).
- 2026-03-14: M3-S2 completed (Node.js and npm detection logic added with version check support).
- 2026-03-14: M3-S3 completed (failure guidance mapper added for dependency health results).
- 2026-03-14: M3-S4 completed (install command now runs dependency checker and prints guidance).
- 2026-03-14: M3-S5 completed (unit and integration test coverage added for dependency gate flow).
- 2026-03-14: M3-S6 completed (dist build path, shebang entrypoint, and executable bin mapping configured).
- 2026-03-14: M3-S7 completed (local installable command workflow verified via npm link).
- 2026-03-14: M3-S8 completed (install command now runs npm install bootstrap automatically after dependency checks).
- 2026-03-14: M4-S1 completed (onboarding question schema contract added in packages/onboarding with deterministic test coverage).
- 2026-03-14: M4-S2 completed (terminal prompt shell added with deterministic prompt rendering and answer collection tests).
- 2026-03-15: M4-S3 completed (onboarding answer validation added for required fields and select choices).
- 2026-03-15: M4-S4 completed (install flow now wires onboarding shell and validation after dependency/bootstrap success).
- 2026-03-15: M4-S5 completed (onboarding orchestration extracted and direct flow tests added).
- 2026-03-15: M5-S1 completed (config JSON schema defined for project, runtime, providers, and bootstrap settings).
- 2026-03-21: M8-S3 completed (skill interface runtime validation).
- 2026-03-21: M8-S4 completed (skill registry smoke coverage; M8 done).
- 2026-03-21: M9-S1 completed (MCP server contracts and normalized creation helper).
- 2026-03-21: M9-S2 completed (MCP registry register/unregister/list/get).
- 2026-03-21: M9-S3 completed (MCP capability metadata mapping helpers).
- 2026-03-21: M9-S4 completed (MCP smoke coverage; M9 done).
- 2026-03-21: M10-S1 completed (pipeline graph contracts and normalized creation helper).
- 2026-03-21: M10-S2 completed (sequential pipeline path resolver with ambiguity/cycle guards). work files: `packages/pipeline/src/sequential-path.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-sequential-path.test.ts`, `docs/milestones/42-m10-s2-sequential-execution-path.md`
- 2026-03-21: M10-S3 completed (branch discovery with linear prefix and outgoing branch options). work files: `packages/pipeline/src/branching-path.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-branching-path.test.ts`, `docs/milestones/43-m10-s3-basic-branching-support.md`
- 2026-03-21: M10-S4 completed (execution report helpers for planned/running/success/failed/blocked states). work files: `packages/pipeline/src/execution-report.ts`, `packages/pipeline/src/index.ts`, `tests/unit/pipeline-execution-report.test.ts`, `docs/milestones/44-m10-s4-execution-report.md`
- 2026-03-21: M10-S5 completed (pipeline integration smoke coverage; M10 done). work files: `tests/integration/pipeline-engine-smoke.test.ts`, `docs/milestones/45-m10-s5-pipeline-integration-tests.md`
- 2026-03-21: M11-S1 completed (Telegram adapter skeleton with normalize + reply helpers). work files: `packages/integrations/src/telegram/telegram-adapter.ts`, `packages/integrations/src/telegram/index.ts`, `packages/integrations/src/index.ts`, `tests/unit/telegram-adapter.test.ts`, `docs/milestones/46-m11-s1-telegram-adapter-skeleton.md`
- 2026-03-21: M11-S2 completed (Telegram webhook/polling delivery mode abstraction). work files: `packages/integrations/src/telegram/telegram-delivery-mode.ts`, `packages/integrations/src/telegram/telegram-adapter.ts`, `packages/integrations/src/telegram/index.ts`, `tests/unit/telegram-adapter.test.ts`, `docs/milestones/47-m11-s2-telegram-delivery-modes.md`
- 2026-03-21: M11-S3 completed (Telegram incoming message mapped to shared trigger event contract). work files: `packages/core/src/trigger-event.contract.ts`, `packages/core/src/index.ts`, `packages/integrations/src/telegram/telegram-trigger.ts`, `packages/integrations/src/telegram/index.ts`, `tests/unit/telegram-trigger.test.ts`, `docs/milestones/48-m11-s3-telegram-trigger-mapping.md`
- 2026-03-21: M11-S4 completed (Telegram connector fixture-based smoke coverage; M11 done). work files: `tests/fixtures/telegram/message-update.json`, `tests/fixtures/telegram/callback-update.json`, `tests/integration/telegram-connector-smoke.test.ts`, `docs/milestones/49-m11-s4-telegram-connector-fixtures.md`
- 2026-03-21: M12-S1 completed (AI provider interface and OpenAI-compatible request/response contract). work files: `packages/integrations/src/ai/provider-contract.ts`, `packages/integrations/src/ai/index.ts`, `packages/integrations/src/index.ts`, `tests/unit/ai-provider-contract.test.ts`, `docs/milestones/50-m12-s1-ai-provider-interface.md`
- 2026-03-21: M12-S2 completed (OpenAI-compatible adapter with injected transport and normalized response mapping). work files: `packages/integrations/src/ai/openai-compatible-adapter.ts`, `packages/integrations/src/ai/index.ts`, `tests/unit/openai-compatible-adapter.test.ts`, `docs/milestones/51-m12-s2-openai-compatible-adapter.md`
- 2026-03-21: M12-S3 completed (AI provider timeout/transport/response errors normalized to stable adapter failures). work files: `packages/integrations/src/ai/provider-contract.ts`, `packages/integrations/src/ai/openai-compatible-adapter.ts`, `tests/unit/openai-compatible-adapter.test.ts`, `docs/milestones/52-m12-s3-provider-error-normalization.md`
- 2026-03-21: M12-S4 completed (AI provider fixture-based smoke coverage; M12 done). work files: `tests/fixtures/ai/openai-compatible-request.json`, `tests/fixtures/ai/openai-compatible-response.json`, `tests/integration/ai-provider-smoke.test.ts`, `docs/milestones/53-m12-s4-ai-provider-fixtures.md`
- 2026-03-21: M13-S1 completed (first orchestration slice: trigger event through pipeline, agent, and skill). work files: `packages/runtime/src/orchestration.ts`, `packages/runtime/src/index.ts`, `tests/integration/trigger-pipeline-agent-skill.integration.test.ts`, `docs/milestones/54-m13-s1-trigger-pipeline-agent-skill.md`
- 2026-03-21: M13-S2 completed (config-driven flow binding and pipeline resolution from runtime config). work files: `packages/config/src/schema.ts`, `packages/config/src/config-parser.ts`, `config/schema/walkie-talkie.config.schema.json`, `packages/runtime/src/flow-binding.ts`, `packages/runtime/src/index.ts`, `tests/unit/config-parser.test.ts`, `tests/integration/config-driven-orchestration.integration.test.ts`, `docs/milestones/55-m13-s2-config-driven-flow-binding.md`
- 2026-03-21: M13-S3 completed (minimal in-memory run history capture for config-driven orchestration). work files: `packages/runtime/src/run-history.ts`, `packages/runtime/src/index.ts`, `tests/integration/run-history.integration.test.ts`, `docs/milestones/56-m13-s3-run-history.md`
- 2026-03-21: M13-S4 completed (end-to-end orchestration verification scenario; M13 done). work files: `tests/integration/orchestration-e2e.integration.test.ts`, `docs/milestones/57-m13-s4-orchestration-e2e.md`
- 2026-03-21: M14-S1 completed (dashboard app shell scaffold with navigation and status cards). work files: `apps/dashboard/package.json`, `apps/dashboard/tsconfig.json`, `apps/dashboard/src/app/shell.ts`, `apps/dashboard/src/index.ts`, `tests/unit/dashboard-shell.test.ts`, `docs/milestones/58-m14-s1-dashboard-shell.md`
- 2026-03-21: M14-S2 completed (dashboard read-only view models for agents, skills, and MCP). work files: `apps/dashboard/src/features/read-only-views.ts`, `apps/dashboard/src/index.ts`, `apps/dashboard/tsconfig.json`, `tests/unit/dashboard-read-only-views.test.ts`, `docs/milestones/59-m14-s2-dashboard-read-only-views.md`
- 2026-03-21: M14-S3 completed (dashboard pipeline list view model). work files: `apps/dashboard/src/features/pipeline-list-view.ts`, `apps/dashboard/src/index.ts`, `tests/unit/dashboard-pipeline-list.test.ts`, `docs/milestones/60-m14-s3-dashboard-pipeline-list.md`
- 2026-03-21: M14-S4 completed (dashboard status/log panel model; M14 done). work files: `apps/dashboard/src/features/status-log-panel.ts`, `apps/dashboard/src/index.ts`, `tests/unit/dashboard-status-log-panel.test.ts`, `docs/milestones/61-m14-s4-dashboard-status-log-panel.md`
- 2026-03-21: M15-S1 completed (shared logging contract, ordered levels, threshold helper, and noop logger). work files: `packages/logging/src/log-contract.ts`, `packages/logging/src/index.ts`, `tests/unit/log-contract.test.ts`, `docs/milestones/62-m15-s1-log-contract-and-levels.md`
- 2026-03-21: M15-S2 completed (shared failure report object, failure-to-log mapping, and readable failure summary helpers). work files: `packages/logging/src/failure-report.ts`, `packages/logging/src/index.ts`, `tests/unit/failure-report.test.ts`, `docs/milestones/63-m15-s2-failure-report-objects.md`
- 2026-03-21: M15-S3 completed (retry policy contract with backoff strategy, delay calculation, and retry decision helpers). work files: `packages/logging/src/retry-policy.ts`, `packages/logging/src/index.ts`, `tests/unit/retry-policy.test.ts`, `docs/milestones/64-m15-s3-retry-policy-interface.md`
- 2026-03-22: M15-S4 completed (audit event model, audit summaries, and storage interface; M15 done). work files: `packages/logging/src/audit-event.ts`, `packages/logging/src/index.ts`, `tests/unit/audit-event.test.ts`, `docs/milestones/65-m15-s4-audit-event-model.md`
- 2026-03-22: M19-S1 completed (browser/vanilla-dom dashboard bootstrap, static HTML entry, and emitted build path). work files: `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/src/main.ts`, `apps/dashboard/src/index.ts`, `apps/dashboard/index.html`, `apps/dashboard/tsconfig.build.json`, `apps/dashboard/package.json`, `package.json`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/66-m19-s1-dashboard-runtime-bootstrap.md`
- 2026-03-22: M19-S2 completed (rendered dashboard overview shell with nav, hero, and status cards). work files: `apps/dashboard/src/app/shell.ts`, `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/index.html`, `tests/unit/dashboard-shell.test.ts`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/67-m19-s2-dashboard-overview-shell.md`
- 2026-03-22: M19-S3 completed (read-only platform sections rendered for agents, skills, MCP, and pipelines). work files: `apps/dashboard/src/features/platform-sections.ts`, `apps/dashboard/src/app/shell.ts`, `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/src/index.ts`, `apps/dashboard/index.html`, `tests/unit/dashboard-platform-sections.test.ts`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/68-m19-s3-dashboard-read-only-sections.md`
- 2026-03-23: M19-S4 completed (rendered dashboard operations panel from run history and audit data, with visible log/audit cards). work files: `apps/dashboard/src/features/status-log-panel.ts`, `apps/dashboard/src/app/bootstrap.ts`, `apps/dashboard/index.html`, `tests/unit/dashboard-status-log-panel.test.ts`, `tests/unit/dashboard-bootstrap.test.ts`, `docs/milestones/69-m19-s4-dashboard-status-log-render.md`
- 2026-03-23: M19-S5 completed (one-command local dashboard serve flow, readiness check script, and smoke coverage; M19 done). work files: `apps/dashboard/scripts/serve.mjs`, `package.json`, `README.md`, `tests/integration/dashboard-serve-smoke.test.ts`, `docs/milestones/70-m19-s5-dashboard-smoke-and-serve.md`
- 2026-03-23: M16-S1 completed (Telegram live-mode runtime contract added across config, validation, and readiness gates). work files: `packages/integrations/src/telegram/telegram-runtime-config.ts`, `packages/integrations/src/telegram/index.ts`, `packages/config/src/schema.ts`, `packages/config/src/config-parser.ts`, `packages/runtime/src/readiness.ts`, `config/schema/walkie-talkie.config.schema.json`, `tests/unit/config-parser.test.ts`, `tests/unit/runtime-bootstrap.test.ts`, `tests/unit/telegram-runtime-config.test.ts`, `docs/milestones/71-m16-s1-telegram-runtime-config-contract.md`
- 2026-03-24: M16-S2 completed (transport-injected Telegram Bot API client added for getUpdates/sendMessage with normalized failures). work files: `packages/integrations/src/telegram/telegram-bot-api.ts`, `packages/integrations/src/telegram/index.ts`, `tests/unit/telegram-bot-api.test.ts`, `docs/milestones/72-m16-s2-telegram-bot-api-client.md`
- 2026-03-24: M16-S3 completed (polling runner now turns getUpdates payloads into Telegram triggers and config-driven orchestration runs). work files: `packages/integrations/src/telegram/telegram-polling-runner.ts`, `packages/integrations/src/telegram/index.ts`, `tests/integration/telegram-polling-runner.integration.test.ts`, `docs/milestones/73-m16-s3-telegram-polling-runner.md`
- 2026-03-24: M16-S4 completed (webhook handler boundary added with path validation, optional secret-token check, and orchestration handoff). work files: `packages/integrations/src/telegram/telegram-webhook-handler.ts`, `packages/integrations/src/telegram/index.ts`, `tests/integration/telegram-webhook-handler.integration.test.ts`, `docs/milestones/74-m16-s4-telegram-webhook-handler.md`
- 2026-03-24: M16-S5 completed (fixture-driven smoke coverage added for live Telegram polling/send transport path; M16 done). work files: `tests/fixtures/telegram/get-updates-response.json`, `tests/fixtures/telegram/send-message-response.json`, `tests/integration/telegram-live-transport-smoke.test.ts`, `docs/milestones/75-m16-s5-telegram-live-transport-smoke.md`
- 2026-03-24: M17-S1 completed (shared AI HTTP request/response transport contract added for provider adapters). work files: `packages/integrations/src/ai/http-transport.ts`, `packages/integrations/src/ai/index.ts`, `tests/unit/ai-http-transport.test.ts`, `docs/milestones/76-m17-s1-ai-http-transport-contract.md`
- 2026-03-24: M17-S2 completed (fetch-based OpenAI-compatible transport added on top of shared AI HTTP request contract). work files: `packages/integrations/src/ai/http-transport.ts`, `packages/integrations/src/ai/openai-compatible-http-transport.ts`, `packages/integrations/src/ai/index.ts`, `tests/unit/openai-compatible-http-transport.test.ts`, `docs/milestones/77-m17-s2-openai-fetch-transport.md`
- 2026-03-24: M17-S3 completed (runtime now resolves default AI provider config, model, and callable provider binding from saved config). work files: `packages/runtime/src/provider-wiring.ts`, `packages/runtime/src/index.ts`, `tests/unit/runtime-ai-provider.test.ts`, `docs/milestones/78-m17-s3-runtime-ai-provider-wiring.md`
- 2026-03-24: M17-S4 completed (AI adapter now composes shared timeout and retry contracts, retrying only retryable transport/timeout failures). work files: `packages/integrations/src/ai/openai-compatible-adapter.ts`, `tests/unit/openai-compatible-adapter.test.ts`, `docs/milestones/79-m17-s4-ai-retry-timeout-integration.md`
- 2026-03-24: M17-S5 completed (live AI fetch transport now has integration smoke coverage across runtime wiring and retry recovery; M17 done). work files: `tests/integration/ai-live-http-transport-smoke.test.ts`, `docs/milestones/80-m17-s5-ai-live-http-smoke.md`
- 2026-03-24: M18-S1 completed (shared storage contracts added for entities, run history, and audit data). work files: `packages/shared/src/storage-contract.ts`, `packages/shared/src/index.ts`, `tests/unit/storage-contract.test.ts`, `docs/milestones/81-m18-s1-storage-contracts.md`
- 2026-03-24: Telegram webhook runtime patch added (local HTTP webhook server boundary + auto setWebhook registration helper). work files: `packages/integrations/src/telegram/telegram-runtime-config.ts`, `packages/integrations/src/telegram/telegram-bot-api.ts`, `packages/integrations/src/telegram/telegram-webhook-server.ts`, `tests/unit/telegram-webhook-server.test.ts`, `docs/milestones/82-telegram-webhook-runtime-patch.md`
- 2026-03-24: M18-S2 completed (file-based entity persistence added for agents, skills, MCP servers, and pipelines). work files: `packages/shared/src/entity-file-storage.ts`, `packages/shared/src/index.ts`, `.gitignore`, `tests/unit/entity-file-storage.test.ts`, `docs/milestones/83-m18-s2-entity-file-persistence.md`
- 2026-03-24: M18-S3 completed (file-based runtime persistence added for run history and audit events). work files: `packages/shared/src/runtime-file-storage.ts`, `packages/shared/src/index.ts`, `tests/unit/runtime-file-storage.test.ts`, `docs/milestones/84-m18-s3-runtime-file-persistence.md`
- 2026-03-24: M18-S4 completed (persistent runtime bootstrap now restores config, entity state, run history, and audit data from disk-backed snapshots). work files: `packages/runtime/src/persistent-state.ts`, `packages/runtime/src/index.ts`, `packages/logging/src/audit-event.ts`, `packages/runtime/src/run-history.ts`, `packages/skills/src/skill-registry.ts`, `packages/mcp/src/mcp-registry.ts`, `tests/unit/persistent-state.test.ts`, `tests/unit/audit-event.test.ts`, `tests/unit/skill-registry.test.ts`, `tests/unit/mcp-registry.test.ts`, `docs/milestones/85-m18-s4-persistent-state-loading.md`
- 2026-03-24: M18-S5 completed (save-and-restore persistence path now has integration coverage across config, entity state, run history, and audit data; M18 done). work files: `tests/integration/persistent-storage.integration.test.ts`, `docs/milestones/86-m18-s5-persistence-integration-tests.md`
- 2026-03-24: M20-S1 completed (production bootstrap plan and local installer boundary script added without overloading the supported local install flow). work files: `packages/core/src/production-bootstrap-plan.ts`, `packages/core/src/index.ts`, `scripts/install/production-bootstrap.ts`, `package.json`, `README.md`, `tests/unit/production-bootstrap-plan.test.ts`, `tests/integration/production-bootstrap-boundary.integration.test.ts`, `docs/milestones/87-m20-s1-production-bootstrap-boundary.md`
- 2026-03-24: Added future milestone M21 for GitHub-hosted one-line installer and release distribution planning.

## Current Next Tiny Step

Execute only this now:
- `M20-S2` Add background worker/scheduler runtime contract.

## Resume Instruction (Use This Prompt)

`Open docs/milestones/01-master-milestones.md and continue from Current Step only. Update status after completing the step.`
