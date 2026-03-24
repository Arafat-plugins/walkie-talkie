# M17-S1: AI HTTP Transport Contract

## Goal

Real AI HTTP transport milestone-এর first step হিসেবে provider-agnostic HTTP request/response boundary define করা।

## Changed Files

- `packages/integrations/src/ai/http-transport.ts`
- `packages/integrations/src/ai/index.ts`
- `tests/unit/ai-http-transport.test.ts`

## What Was Added

### `packages/integrations/src/ai/http-transport.ts`

Purpose:
- provider contract-এর নিচে shared HTTP transport layer formalize করা

Main types:
- `AiHttpTransportMethod`
- `AiHttpTransportRequest`
- `AiHttpTransportResponse`
- `AiHttpTransport`

Main helpers:
- `buildAiHttpTransportUrl(provider, pathName)`
  - provider base URL + endpoint path join করে
- `buildAiHttpTransportHeaders(provider)`
  - JSON content type set করে
  - API key থাকলে bearer auth header add করে
- `createAiHttpTransportRequest(...)`
  - POST request contract normalize করে
  - payload JSON stringify করে
  - timeout default দেয়

Why this matters:
- next fetch-based transport implementation now has a stable input/output shape
- OpenAI-compatible adapter later generic transport layer reuse করতে পারবে
- future Anthropic/local/custom providers same request boundary use করতে পারবে

### `packages/integrations/src/ai/index.ts`

Purpose:
- new HTTP transport contract AI integration root-এ expose করা

### `tests/unit/ai-http-transport.test.ts`

Purpose:
- URL builder verify করা
- auth header behavior verify করা
- normalized request contract verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts tests/unit/ai-http-transport.test.ts tests/unit/openai-compatible-adapter.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `3` AI unit test files passed
- root typecheck clean

## Next Safe Step

`M17-S2`: fetch-based OpenAI-compatible transport implement করা।
