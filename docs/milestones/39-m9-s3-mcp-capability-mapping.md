# M9-S3: MCP Capability Metadata Mapping

## Goal

Registered MCP servers থেকে capability metadata query করার helper layer add করা।

## Changed Files

- `packages/mcp/src/capability-map.ts`
- `packages/mcp/src/index.ts`
- `tests/unit/mcp-capability-map.test.ts`

## What Was Added

### `packages/mcp/src/capability-map.ts`

Purpose:
- capability id -> server ids map build করা
- server capability metadata query helpers দেওয়া

Function-by-Function Why:
- `buildMcpCapabilityMap(servers)`
  - all registered servers scan করে capability id অনুযায়ী server ids group করে
- `listServersForCapability(capabilityMap, capabilityId)`
  - কোন capability কোন servers দিতে পারে সেটা lookup করে
- `listCapabilitiesForServer(server)`
  - one server-এর exposed capability ids list করে
- `hasCapability(capabilityMap, capabilityId, serverId)`
  - specific server কোনো capability support করে কিনা check করে
- `uniqueSorted(values)`
  - deterministic capability mapping output দেয়

### `tests/unit/mcp-capability-map.test.ts`

Purpose:
- capability -> servers mapping ঠিক আছে কিনা
- server -> capability helpers ঠিক আছে কিনা
- missing capability graceful behavior check করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/mcp-contracts.test.ts tests/unit/mcp-registry.test.ts tests/unit/mcp-capability-map.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Next Safe Step

`M9-S4`: MCP tests finalize করে milestone close করা।
