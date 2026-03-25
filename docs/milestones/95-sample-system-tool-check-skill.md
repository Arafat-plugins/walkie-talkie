# Skill Patch: Built-In System Tool Check Skill

## What changed

- added a built-in skill factory:
  - `createSystemToolCheckSkill()`
- added executable lookup helper:
  - `findSystemToolExecutablePath()`
- exported the skill from the public `packages/skills` index
- added unit and integration coverage

## Why this patch exists

The platform already had skill contracts, registry support, orchestration, and persistence boundaries.

What it did not yet have was a concrete built-in skill that demonstrates how a real skill can:

- validate input
- touch the local machine
- return normalized output
- run through the registry path

This patch gives the system a practical starting point for future user-facing skill creation flows.

## Behavior

The skill expects:

- `input.tool` or `input.command` as a non-empty string

It returns:

- the requested tool name
- whether it is installed
- the resolved executable path when found
- the skill id that produced the result
- the current platform

## Verification

Verified with:

```bash
node --test --experimental-strip-types tests/unit/system-tool-check-skill.test.ts tests/integration/system-tool-check-skill.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

## Tracker impact

- current main milestone remains unchanged
- this is a capability patch on top of the existing skills foundation
