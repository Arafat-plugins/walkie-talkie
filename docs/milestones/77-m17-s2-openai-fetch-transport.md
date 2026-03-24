# M17-S2: Fetch-Based OpenAI-Compatible Transport

## Goal

Shared AI HTTP transport contract-এর ওপর fetch-based OpenAI-compatible transport বসানো।

## Changed Files

- `packages/integrations/src/ai/http-transport.ts`
- `packages/integrations/src/ai/openai-compatible-http-transport.ts`
- `packages/integrations/src/ai/index.ts`
- `tests/unit/openai-compatible-http-transport.test.ts`

## What Was Added

### `packages/integrations/src/ai/http-transport.ts`

Purpose:
- generic HTTP request contract থেকে real `fetch`-driven transport implementation add করা

Main helper:
- `createFetchAiHttpTransport({ fetchImpl? })`
  - request method/headers/body pass করে
  - abort signal + timeout control করে
  - normalized `AiHttpTransportResponse` return করে

### `packages/integrations/src/ai/openai-compatible-http-transport.ts`

Purpose:
- OpenAI-compatible payloads-এর জন্য HTTP transport wrapper provide করা

Main helpers:
- `parseOpenAiCompatibleHttpTransportResponse(response)`
  - response `bodyText` JSON parse করে raw provider response দেয়
- `createFetchOpenAiCompatibleTransport({ fetchImpl?, timeoutMs? })`
  - `/chat/completions` endpoint request build করে
  - shared fetch transport use করে
  - parsed raw response return করে

Why this matters:
- next step-এ runtime provider wiring now only needs config/secrets injection
- adapter contract unchanged থেকেও live fetch path পাওয়া গেল

### `packages/integrations/src/ai/index.ts`

Purpose:
- new OpenAI-compatible fetch transport API expose করা

### `tests/unit/openai-compatible-http-transport.test.ts`

Purpose:
- fetch transport delegation verify করা
- OpenAI endpoint request shape verify করা
- JSON response parsing verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts tests/unit/ai-http-transport.test.ts tests/unit/openai-compatible-adapter.test.ts tests/unit/openai-compatible-http-transport.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` AI unit test files passed
- root typecheck clean

## Next Safe Step

`M17-S3`: runtime-এ provider secrets/config wiring add করা।
