# M12-S1: AI Provider Interface

## Goal

AI provider milestone শুরু করার smallest useful step ছিল OpenAI-compatible first shape-এ request/response/provider contract define করা।

## Changed Files

- `packages/integrations/src/ai/provider-contract.ts`
- `packages/integrations/src/ai/index.ts`
- `packages/integrations/src/index.ts`
- `tests/unit/ai-provider-contract.test.ts`

## What Was Added

### `packages/integrations/src/ai/provider-contract.ts`

Purpose:
- AI provider adapter layer-এর shared interface define করা

Constants:
- `AI_PROVIDER_KINDS`
- `AI_MESSAGE_ROLES`

Main types:
- `AiProviderKind`
- `AiMessageRole`
- `AiProviderConfig`
- `AiMessage`
- `AiCompletionRequest`
- `AiCompletionResponse`
- `AiProvider`

Function-by-Function Why:
- `createAiCompletionRequest(input)`
  - provider config + messages clone করে
  - request object stable normalize করে
  - caller mutation leak কমায়

Current boundary:
- real HTTP transport এখনো নেই
- timeout normalization এখনো নেই
- mock/live adapter implementation এখনো নেই

### `packages/integrations/src/ai/index.ts`

Purpose:
- AI provider contract package API-তে expose করা

### `packages/integrations/src/index.ts`

Purpose:
- integrations root API-তে AI provider contract expose করা

### `tests/unit/ai-provider-contract.test.ts`

Purpose:
- supported provider kinds/roles verify করা
- request normalization clone behavior verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/ai-provider-contract.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `1` test file passed
- typecheck clean

## Next Safe Step

`M12-S2`: first provider adapter implement করা।
