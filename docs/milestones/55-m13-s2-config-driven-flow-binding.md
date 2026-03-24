# M13-S2: Config-Driven Flow Binding

## Goal

Pipeline selection hardcoded না রেখে config থেকে trigger -> pipeline binding resolve করা।

## Changed Files

- `packages/config/src/schema.ts`
- `packages/config/src/config-parser.ts`
- `config/schema/walkie-talkie.config.schema.json`
- `packages/runtime/src/flow-binding.ts`
- `packages/runtime/src/index.ts`
- `tests/unit/config-parser.test.ts`
- `tests/integration/config-driven-orchestration.integration.test.ts`

## What Was Added

### `packages/config/src/schema.ts`

Purpose:
- config type-এ `runtime.flowBindings` add করা

New config shape:
- `runtime.flowBindings[]`
  - `triggerKind`
  - `eventName?`
  - `pipelineId`

### `packages/config/src/config-parser.ts`

Purpose:
- flow binding array validation add করা

New validations:
- `runtime.flowBindings` array হতে হবে
- `triggerKind` valid trigger kind হতে হবে
- `eventName` থাকলে non-empty string হতে হবে
- `pipelineId` non-empty string হতে হবে

### `config/schema/walkie-talkie.config.schema.json`

Purpose:
- JSON schema-তেও runtime flow binding support reflect করা

### `packages/runtime/src/flow-binding.ts`

Purpose:
- config-driven pipeline resolution + orchestration entry add করা

Main types:
- `ResolvedFlowBinding`
- `ConfigDrivenRuntimeInput`

Function-by-Function Why:
- `resolveConfigDrivenFlowBinding(config, trigger)`
  - matching flow binding খুঁজে দেয়
- `resolvePipelineForTrigger({ config, trigger, pipelines })`
  - primary trigger match verify করে
  - binding resolve করে
  - pipeline id থেকে actual pipeline resolve করে
- `executeConfiguredTriggerPipeline(input)`
  - config-driven resolution করে
  - resolved pipeline থাকলে existing `executeTriggerPipeline()` call করে
  - match না পেলে blocked report return করে

### `packages/runtime/src/index.ts`

Purpose:
- config-driven flow binding API runtime package-এ expose করা

### `tests/unit/config-parser.test.ts`

Purpose:
- valid flow binding config accept verify করা
- invalid flow binding issues verify করা

### `tests/integration/config-driven-orchestration.integration.test.ts`

Purpose:
- config flow binding থেকে pipeline select verify করা
- config-driven orchestration success path verify করা
- missing match path blocked verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/config-parser.test.ts tests/integration/config-driven-orchestration.integration.test.ts tests/integration/trigger-pipeline-agent-skill.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` test files passed
- typecheck clean

## Next Safe Step

`M13-S3`: minimal run history capture add করা।
