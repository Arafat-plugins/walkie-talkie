# M8-S3: Skill Interface Validation

## Goal

Invalid skill interface registry-তে ঢোকার আগেই block করা।

## Changed Files

- `packages/skills/src/skill-validation.ts`
- `packages/skills/src/skill-registry.ts`
- `packages/skills/src/index.ts`
- `tests/unit/skill-validation.test.ts`
- `tests/unit/skill-registry.test.ts`

## What Was Added

### `packages/skills/src/skill-validation.ts`

Purpose:
- skill input runtime validation করা

Function-by-Function Why:
- `validateSkillDefinitionInput(input)`
  - registry register path-এর আগে skill shape validate করে
  - current checks:
    - non-empty `id`
    - non-empty `name`
    - `handler` is a function
    - parameter name must be non-empty
    - parameter type must be valid
    - parameter required must be boolean
    - duplicate parameter names are blocked
- `validateParameter(...)`
  - per-parameter validation isolate করে
- `isNonEmptyString(...)`
  - repeated string checks centralize করে
- `pushIssue(...)`
  - issue collection consistent রাখে

### `packages/skills/src/skill-registry.ts`

Change:
- `register(input)` এখন first `validateSkillDefinitionInput(input)` call করে
- invalid skill হলে error throw করে

### Tests

`tests/unit/skill-validation.test.ts`
- valid skill input
- empty id/name + missing handler
- invalid parameter shape + duplicate parameter names

`tests/unit/skill-registry.test.ts`
- registry invalid skill reject করে কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/skill-contracts.test.ts tests/unit/skill-validation.test.ts tests/unit/skill-registry.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Next Safe Step

`M8-S4`: registry and validation tests finalize করে milestone close করা।
