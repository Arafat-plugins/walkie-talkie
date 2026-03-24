# M4-S3: Onboarding Answer Validation

## Goal

Onboarding prompt shell theke collected answer set validate kora, jate required field and select choices deterministic bhabe check kora jay.

## Changed Files

- `packages/onboarding/src/answer-validation.ts`
- `packages/onboarding/src/index.ts`
- `tests/unit/onboarding-answer-validation.test.ts`

## Function-by-Function Why

### `validateOnboardingAnswers(schema, answers)`

File: `packages/onboarding/src/answer-validation.ts`

Why:
- Onboarding answer set ke schema against validate kore.
- Next step e install flow integration er age reusable validation result contract dei.

### `validateRequired(question, answer)`

File: `packages/onboarding/src/answer-validation.ts`

Why:
- Required question er empty answer detect kore friendly issue message toiri kore.

### `validateSelectOption(question, answer)`

File: `packages/onboarding/src/answer-validation.ts`

Why:
- `select` type answer allowed option-er moddhe ache naki check kore.

## Verification Executed

- `node --test --experimental-strip-types tests/unit/onboarding-question-schema.test.ts tests/unit/onboarding-prompt-shell.test.ts tests/unit/onboarding-answer-validation.test.ts`

Result:
- tests: 3
- pass: 3
- fail: 0

## Outcome

Onboarding package এখন schema + prompt shell + validation তিন layer-এ split.
`M4-S4` e install command-er shathe onboarding flow integrate kora যাবে without inventing validation rules again.

