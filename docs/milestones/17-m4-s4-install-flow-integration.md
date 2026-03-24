# M4-S4: Integrate Onboarding With Install Flow

## Goal

Dependency/bootstrap success er por onboarding shell ke install command flow er moddhe wire kora.

## Changed Files

- `apps/cli/src/commands/install.ts`
- `tests/cli/install.command.test.ts`
- `tests/integration/cli-routing.integration.test.ts`
- `tests/integration/onboarding-install.integration.test.ts`

## Function-by-Function Why

### `createTerminalPromptIO()`

File: `apps/cli/src/commands/install.ts`

Why:
- Real terminal stdin/stdout ke onboarding shell-er `OnboardingPromptIO` contract e map kore.

### `runOnboardingFlow()`

File: `apps/cli/src/commands/install.ts`

Why:
- Schema load kore prompt shell run kore.
- Collected answers validate kore.
- Success hole deterministic onboarding summary print kore.

### `executeInstallCommand()` update

File: `apps/cli/src/commands/install.ts`

Why:
- Dependency check + bootstrap success er por onboarding stage execute kore.
- `WALKIE_SKIP_ONBOARDING=1` diye tests and non-interactive paths stable rakhe.

## Verification Executed

- `node --test --experimental-strip-types tests/unit/onboarding-question-schema.test.ts tests/unit/onboarding-prompt-shell.test.ts tests/unit/onboarding-answer-validation.test.ts tests/integration/onboarding-install.integration.test.ts tests/integration/cli-routing.integration.test.ts tests/cli/install.command.test.ts`

Result:
- tests: 6
- pass: 6
- fail: 0

## Outcome

`walkie-talkie install` এখন onboarding stage-aware.
`M4-S5` e interactive onboarding flow-er more direct tests add kora যাবে.

