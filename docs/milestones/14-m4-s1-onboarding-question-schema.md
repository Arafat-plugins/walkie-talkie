# M4-S1: Onboarding Question Schema

## Goal

Install/onboarding flow er jonno deterministic question schema define kora, jeta next step e terminal prompt shell use korte parbe.

## Changed Files

- `packages/onboarding/src/question-schema.ts`
- `packages/onboarding/src/index.ts`
- `tests/unit/onboarding-question-schema.test.ts`

## Function-by-Function Why

### `getDefaultOnboardingQuestionSchema()`

File: `packages/onboarding/src/question-schema.ts`

Why:
- Onboarding question list ke single source of truth hisebe expose kore.
- Question order deterministic rakhe, jate CLI flow and tests same contract use korte pare.
- Returned object clone kore, jate caller default schema mutate korte na pare.

## Schema Coverage

Defined core prompts:
- project identity
- primary trigger choice
- provider secret input
- example pipeline bootstrap confirmation

## Verification Executed

- `node --test --experimental-strip-types tests/unit/onboarding-question-schema.test.ts`

## Outcome

`packages/onboarding` e first schema contract ready, so `M4-S2` e terminal prompt shell build kora jabe without inventing question shape again.
