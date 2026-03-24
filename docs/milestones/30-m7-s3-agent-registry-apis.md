# M7-S3: Agent Registry Public APIs

## Goal

In-memory agent registry-কে public `create/list/get` API দিয়ে usable করা।

## Changed Files

- `packages/agents/src/agent-registry.ts`
- `tests/unit/agent-registry.test.ts`

## What Was Added

### `packages/agents/src/agent-registry.ts`

New public methods on `AgentRegistryStore`:
- `create(input)`
- `list()`
- `get(agentId)`

Function-by-Function Why:
- `create(input)`
  - raw input থেকে normalized agent definition create করে
  - duplicate id block করে
  - registry-তে store করে
  - cloned stored result return করে
- `list()`
  - all stored agents cloned snapshot আকারে দেয়
- `get(agentId)`
  - single agent read করে
  - missing হলে `undefined`

Existing methods still available for low-level inspection:
- `seed(agent)`
- `contains(agentId)`
- `count()`
- `snapshot()`
- `snapshotById(agentId)`

## Duplicate Handling

If caller same id দিয়ে second time create করতে চায়:
- throws `Agent with id "<id>" already exists.`

This keeps registry deterministic and prevents silent overwrite.

### `tests/unit/agent-registry.test.ts`

Added coverage for:
- `create()` success path
- `list()` output
- `get()` existing/missing path
- duplicate id rejection

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

`M7-S4`: registry tests finalize করে milestone close করা।
