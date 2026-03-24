# M8-S2: Skill Registry and Loader

## Goal

Skill definitions store করার জন্য in-memory registry add করা এবং registered skill handler load করার path দেওয়া।

## Changed Files

- `packages/skills/src/skill-registry.ts`
- `packages/skills/src/index.ts`
- `tests/unit/skill-registry.test.ts`

## What Was Added

### `packages/skills/src/skill-registry.ts`

Purpose:
- skill definitions in-memory store করা
- skill metadata read করা
- handler load করা

Function-by-Function Why:
- `cloneSkillDefinition(skill)`
  - parameters/tags clone করে returned snapshots safe রাখে
- `InMemorySkillRegistry`
  - base storage class
  - protected methods:
    - `store(skill)`
    - `read(skillId)`
    - `readAll()`
    - `has(skillId)`
- `SkillRegistryStore`
  - current public registry API
  - `register(input)`
    - normalized skill definition create করে store করে
    - duplicate id block করে
  - `list()`
    - all skills cloned snapshot আকারে দেয়
  - `get(skillId)`
    - single skill metadata দেয়
  - `load(skillId)`
    - execution-ready handler দেয়

## Loader Boundary

Current loader behavior:
- skill id থেকে handler resolve করে
- missing skill হলে `undefined`

Validation of handler/interface correctness next step `M8-S3`-এ tighter হবে।

### `tests/unit/skill-registry.test.ts`

Purpose:
- register/list/get/load success path
- handler load করে execute করা যায় কিনা
- duplicate protection
- cloned snapshots state safe রাখে কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/skill-contracts.test.ts tests/unit/skill-registry.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Next Safe Step

`M8-S3`: skill interface validation add করা।
