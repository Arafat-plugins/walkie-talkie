# M9-S2: MCP Registry

## Goal

MCP server definitions store করার জন্য in-memory registry add করা, with register/unregister support।

## Changed Files

- `packages/mcp/src/mcp-registry.ts`
- `packages/mcp/src/index.ts`
- `tests/unit/mcp-registry.test.ts`

## What Was Added

### `packages/mcp/src/mcp-registry.ts`

Purpose:
- MCP server definitions in-memory store করা
- cloned snapshots return করা
- registration/unregistration behavior define করা

Function-by-Function Why:
- `cloneMcpServerDefinition(server)`
  - nested connection/auth/capability/tag structures clone করে
- `InMemoryMcpRegistry`
  - base storage class
  - protected methods:
    - `store(server)`
    - `read(serverId)`
    - `readAll()`
    - `has(serverId)`
    - `remove(serverId)`
- `McpRegistryStore`
  - public registry API
  - `register(input)`
    - normalized server create করে store করে
    - duplicate id block করে
  - `unregister(serverId)`
    - remove success/failure boolean দেয়
  - `list()`
    - all server snapshots দেয়
  - `get(serverId)`
    - single server snapshot দেয়

### `tests/unit/mcp-registry.test.ts`

Purpose:
- register/list/get/unregister success path
- duplicate protection
- cloned snapshot safety

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/mcp-contracts.test.ts tests/unit/mcp-registry.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Next Safe Step

`M9-S3`: capability metadata mapping add করা।
