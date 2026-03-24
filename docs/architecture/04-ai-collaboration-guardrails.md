# AI Collaboration Guardrails

## Purpose

Future-এ Claude বা অন্য AI model দিয়ে skills, agents, pipeline, dashboard code generate/update করতে হলে architecture break না করার জন্য এই guardrails follow করতে হবে।

## Required Read Order

Any external AI collaborator must read in this order:

1. `docs/milestones/01-master-milestones.md`
2. `docs/milestones/STATUS.md`
3. latest relevant docs in `docs/milestones/`
4. related files in the current step package

## Working Rules

- current step ছাড়া next step touch করা যাবে না
- milestone source of truth break করা যাবে না
- docs/status update ছাড়া step complete ধরা যাবে না
- changed behavior হলে tests/typecheck mandatory
- existing package boundaries respect করতে হবে

## Non-Negotiables

- no giant code dump across multiple milestones
- no silent architecture rewrite
- no bypass of config/runtime/install contracts
- no direct copy of external project architecture without justification
- no premium model for every simple operational question

## File-Level Expectations

Every completed step should leave behind:
- changed files
- function-level rationale
- verification commands
- next safe step

For every major tool/agent/skill/pipeline/integration later:
- execution-facing documentation
- file-to-file trace
- function call chain
- prompt source documentation

## Safe Prompt Pattern

Recommended prompt for another AI:

`Read master milestones, status, latest milestone docs, and current-step source files. Do only the current step. Do not skip ahead. Update docs and status after completion. Run relevant tests/typecheck.`

## Why This Helps

These guardrails make the project:
- resumable
- reviewable
- less likely to drift
- safer for multi-AI collaboration

## Companion Docs

For fast onboarding and structure recovery also read:
- `docs/architecture/06-ai-handoff-playbook.md`
- `docs/architecture/07-system-map.md`
