# M17-S3: Runtime AI Provider Wiring

## Goal

Config secrets এবং provider settings থেকে runtime-ready default AI provider instance build করা।

## Changed Files

- `packages/runtime/src/provider-wiring.ts`
- `packages/runtime/src/index.ts`
- `tests/unit/runtime-ai-provider.test.ts`

## What Was Added

### `packages/runtime/src/provider-wiring.ts`

Purpose:
- runtime layer-এ config-driven default AI provider binding add করা

Main exports:
- `resolveDefaultAiProviderConfig(config)`
  - config provider settings -> runtime `AiProviderConfig`
- `resolveDefaultAiModel(config)`
  - config model or fallback model resolve করে
- `createRuntimeDefaultAiProvider({ config, fetchImpl?, timeoutMs? })`
  - config secrets/baseUrl/model read করে
  - fetch-based OpenAI-compatible transport wire করে
  - callable runtime provider + default model return করে

Why this matters:
- runtime now can instantiate a real provider from saved config
- later orchestration or agent execution layer doesn’t need to rebuild provider wiring logic

### `packages/runtime/src/index.ts`

Purpose:
- runtime provider wiring APIs package root-এ expose করা

### `tests/unit/runtime-ai-provider.test.ts`

Purpose:
- provider config mapping verify করা
- default model fallback verify করা
- injected fetch through runtime provider binding verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts tests/unit/ai-http-transport.test.ts tests/unit/openai-compatible-adapter.test.ts tests/unit/openai-compatible-http-transport.test.ts tests/unit/runtime-ai-provider.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `5` AI/runtime test files passed
- root typecheck clean

## Next Safe Step

`M17-S4`: transport-level retry/timeout integration using reliability contracts।
