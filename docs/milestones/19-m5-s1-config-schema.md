# M5-S1: Config Schema Definition

## Goal

Walkie-Talkie config file-er contract ke `config/schema` e explicit JSON Schema hisebe define kora.

## Changed Files

- `config/schema/walkie-talkie.config.schema.json`

## Schema Coverage

Current schema defines:
- `version`
- `project.name`
- `project.primaryTrigger`
- `runtime.environment`
- `runtime.logLevel`
- `providers.defaultAi`
- optional `providers.telegram`
- `bootstrap.createExamplePipeline`

## Why This Step Matters

- Onboarding answers and future config writer ekhon same contract target korte parbe.
- M5-S2 parser/validator likhar age schema shape freeze hoye gelo.
- Future config drift কমবে কারণ required fields clearly documented.

## Verification Executed

- JSON parse verification with Node.js

## Outcome

Config contract now exists as a source of truth in `config/schema`.

