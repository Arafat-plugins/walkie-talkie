# M8-S1: Skill Contracts

## Goal

Skill registry শুরু করার আগে skill object-এর stable contract define করা।

## Changed Files

- `packages/skills/src/skill-contract.ts`
- `packages/skills/src/index.ts`
- `tests/unit/skill-contracts.test.ts`

## What Was Added

### `packages/skills/src/skill-contract.ts`

Purpose:
- future skill registry, loader, runtime execution, এবং dashboard inspection-এর জন্য same skill shape provide করা

Constants:
- `SKILL_CONTRACT_VERSION`
- `SKILL_EXECUTION_MODES`
- `SKILL_STATUSES`

Main types:
- `SkillExecutionMode`
  - `sync` or `async`
- `SkillStatus`
  - active / deprecated / disabled
- `SkillParameterDefinition`
  - skill input contract
- `SkillExecutionContext`
  - runtime execution context
- `SkillExecutionResult`
  - handler result shape
- `SkillHandler`
  - async handler signature
- `SkillDefinition`
  - canonical stored skill shape
- `SkillDefinitionInput`
  - creation-time input shape

Function-by-Function Why:
- `createSkillDefinition(input)`
  - defaults apply করে
  - metadata arrays clone করে
  - canonical skill object normalize করে

### `packages/skills/src/index.ts`

Purpose:
- skills package public API expose করা

### `tests/unit/skill-contracts.test.ts`

Purpose:
- contract constants stable আছে কিনা
- `createSkillDefinition()` defaults apply করে কিনা
- metadata arrays clone হয় কিনা
- handler signature expected result দেয় কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/skill-contracts.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- test pass
- typecheck clean

## Next Safe Step

`M8-S2`: skill registry + loader implement করা।
