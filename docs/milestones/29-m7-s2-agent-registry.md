# M7-S2: In-Memory Agent Registry

## Goal

Agent definitions store করার জন্য minimal in-memory registry base তৈরি করা।

## Changed Files

- `packages/agents/src/agent-registry.ts`
- `packages/agents/src/index.ts`
- `tests/unit/agent-registry.test.ts`

## What Was Added

### `packages/agents/src/agent-registry.ts`

Purpose:
- agent definitions in-memory store করা
- cloned read access দেওয়া যাতে external mutation registry state corrupt না করে

Function-by-Function Why:
- `cloneAgentDefinition(agent)`
  - nested arrays/objects clone করে registry snapshot safe রাখে
- `InMemoryAgentRegistry`
  - base storage class
  - protected methods:
    - `store(agent)`
    - `read(agentId)`
    - `readAll()`
    - `has(agentId)`
    - `size()`
  - intent: `M7-S3` public API এর base হওয়া
- `AgentRegistryStore`
  - tiny public wrapper for current step verification
  - methods:
    - `seed(agent)`
    - `contains(agentId)`
    - `count()`
    - `snapshot()`
    - `snapshotById(agentId)`

Important boundary:
- This step focuses on storage behavior only
- public create/list/get API shape next step `M7-S3`-এ finalize হবে

### `packages/agents/src/index.ts`

Purpose:
- registry exports expose করা

### `tests/unit/agent-registry.test.ts`

Purpose:
- multiple agents store করা যায় কিনা
- snapshot reads correct কিনা
- returned objects mutate করলে registry state change না হয় কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/agent-contracts.test.ts tests/unit/agent-registry.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Next Safe Step

`M7-S3`: create/list/get APIs add করা।
