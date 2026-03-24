# M9-S4: MCP Registry Tests

## Goal

MCP registry + capability metadata layer-এর unit + smoke coverage finalize করে `M9` close করা।

## Changed Files

- `tests/integration/mcp-registry-smoke.test.ts`

## What Was Added

### `tests/integration/mcp-registry-smoke.test.ts`

Smoke scenario:
- register multiple MCP servers
- build capability map from registry list
- unregister one server
- rebuild capability map
- verify capability availability changes

Why this matters:
- unit tests single functions cover করছিল
- এই smoke test registry state + capability mapping together verify করে

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/mcp-contracts.test.ts tests/unit/mcp-registry.test.ts tests/unit/mcp-capability-map.test.ts tests/integration/mcp-registry-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## M9 Outcome

After `M9`, MCP core now has:
- MCP server contracts
- normalized server creation helper
- register/unregister/list/get registry
- capability metadata mapping
- smoke coverage for registry + capability map flow

This is enough to start `M10` pipeline engine work.

## Next Safe Step

`M10-S1`: pipeline node/edge contract define করা।
