# M4-S5: Onboarding Flow Tests

## Goal

Onboarding shell + validation + install integration flow er jonno direct success/failure test coverage add kora.

## Changed Files

- `packages/onboarding/src/flow.ts`
- `packages/onboarding/src/index.ts`
- `apps/cli/src/commands/install.ts`
- `tests/integration/onboarding-flow.integration.test.ts`

## Function-by-Function Why

### `executeOnboardingFlow(io, schema?)`

File: `packages/onboarding/src/flow.ts`

Why:
- Prompt shell and validation ke single reusable orchestration function e compose kore.
- Install command and tests duijai same flow reuse korte pare.

### `runOnboardingFlow()` update

File: `apps/cli/src/commands/install.ts`

Why:
- CLI layer e prompt wiring thake, but validation/prompt orchestration onboarding package-e move hoy.
- Install command slim hoy, testable orchestration centralize hoy.

## Verification Executed

- `node --test --experimental-strip-types tests/unit/onboarding-question-schema.test.ts tests/unit/onboarding-prompt-shell.test.ts tests/unit/onboarding-answer-validation.test.ts tests/integration/onboarding-flow.integration.test.ts tests/integration/onboarding-install.integration.test.ts tests/integration/cli-routing.integration.test.ts tests/cli/install.command.test.ts`

Result:
- tests: 7
- pass: 7
- fail: 0

## Outcome

M4 onboarding milestone now has:
- schema
- prompt shell
- validation
- install integration
- direct flow tests

