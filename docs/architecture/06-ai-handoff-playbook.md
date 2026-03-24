# AI Handoff Playbook

## Purpose

এই file-এর কাজ হলো future-এ অন্য কোনো AI model বা teammate এলে খুব দ্রুত project context recover করতে সাহায্য করা।

Target:
- current step কী
- source of truth কোন file
- কোন order-এ read করতে হবে
- code edit করার আগে কী confirm করতে হবে
- completion মানে কী

## Mandatory Read Order

Any collaborator must read these in order:

1. `docs/milestones/01-master-milestones.md`
2. `docs/milestones/STATUS.md`
3. latest relevant step docs inside `docs/milestones/`
4. related files in the current package
5. relevant architecture docs in `docs/architecture/`

## Source of Truth Rules

- milestone file is the execution source of truth
- `STATUS.md` is the quick resume pointer
- current step ছাড়া next step touch করা যাবে না
- cross-cutting support docs can be added, but main milestone state must not be skipped

## Minimal Repo Mental Model

### Apps

- `apps/cli`
  - install/setup entrypoint
  - onboarding + config bootstrap trigger
- `apps/dashboard`
  - browser-visible control plane
  - read-only/rendered UI foundation

### Packages

- `packages/core`
  - shared contracts and helper utilities
- `packages/config`
  - config schema, parse, validate, read, write, secret handling
- `packages/runtime`
  - bootstrap, orchestration, flow binding, run history
- `packages/agents`
  - agent contract and registry
- `packages/skills`
  - skill contract, validation, registry
- `packages/mcp`
  - MCP contract, registry, capability mapping
- `packages/pipeline`
  - pipeline graph, path resolution, execution reporting
- `packages/integrations`
  - Telegram + AI provider boundaries
- `packages/logging`
  - logs, failures, retry policy contract, audit events
- `packages/onboarding`
  - onboarding question flow and validation

## What “Complete” Means For Any Step

A step is only complete when all of these are true:

1. the requested code exists
2. relevant tests/typecheck/build verification ran
3. milestone step doc exists or is updated
4. `01-master-milestones.md` is updated
5. `STATUS.md` is updated
6. next safe step is stated clearly

## What To Leave Behind After Every Meaningful Change

- changed files list
- function-level rationale
- verification commands
- current status
- next safe step

## Safe Editing Rules

- prefer existing contracts over inventing new ones
- avoid architecture rewrites inside small steps
- add comments only when they save real reading time
- if a feature is not live yet, say so explicitly
- if a UI is demo/read-only, say so explicitly

## Expected Collaboration Pattern

When another AI is asked to continue work, it should:

1. identify the current step
2. read only the minimum relevant files
3. implement one small real change
4. verify it
5. update docs and trackers
6. stop at the next step boundary

## Recommended Prompt For Another AI

```text
Open docs/milestones/01-master-milestones.md and docs/milestones/STATUS.md first.
Then read the latest relevant milestone docs and the source files related to the current step.
Do only the current step.
Do not skip ahead.
After implementation, run relevant tests/typecheck/build verification.
Then update the milestone doc, 01-master-milestones.md, and STATUS.md.
Finally, summarize what changed, what was verified, and what the next step is.
```

## If Context Is Still Unclear

Open next:

- `docs/architecture/04-ai-collaboration-guardrails.md`
- `docs/architecture/05-execution-docs-framework.md`
- `docs/architecture/07-system-map.md`

## Why This Works

This playbook keeps the project:

- resumable
- inspectable
- easier for multi-AI collaboration
- less likely to drift structurally

