# M4-S2: Terminal Prompt Flow Shell

## Goal

Onboarding schema use kore reusable terminal prompt shell build kora, jate next step e validation and install-flow integration add kora jay.

## Changed Files

- `packages/onboarding/src/prompt-shell.ts`
- `packages/onboarding/src/index.ts`
- `tests/unit/onboarding-prompt-shell.test.ts`

## Function-by-Function Why

### `buildPromptLines(question)`

File: `packages/onboarding/src/prompt-shell.ts`

Why:
- Single question ke deterministic terminal lines e convert kore.
- Label, help text, options, placeholder, default value ek jaygay format kore.

### `runOnboardingPromptShell(schema, io)`

File: `packages/onboarding/src/prompt-shell.ts`

Why:
- Prompt orchestration er shell hisebe question order follow kore answers collect kore.
- Real readline layer theke alada `io` interface use koray testable thake.

### `normalizeAnswer(question, rawAnswer)`

File: `packages/onboarding/src/prompt-shell.ts`

Why:
- Empty input hole default apply kore.
- `confirm` question ke boolean e normalize kore.

## Verification Executed

- `node --test --experimental-strip-types tests/unit/onboarding-question-schema.test.ts tests/unit/onboarding-prompt-shell.test.ts`

Result:
- tests: 2
- pass: 2
- fail: 0

## Outcome

`packages/onboarding` এখন schema-driven prompt shell ready.
`M4-S3` এ answer validation add করা যাবে without changing prompt orchestration shape.

