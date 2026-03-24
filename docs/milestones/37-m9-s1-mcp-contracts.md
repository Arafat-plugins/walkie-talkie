# M9-S1: MCP Server Contracts

## Goal

MCP registry শুরু করার আগে MCP server object-এর stable contract define করা।

## Changed Files

- `packages/mcp/src/mcp-contract.ts`
- `packages/mcp/src/index.ts`
- `tests/unit/mcp-contracts.test.ts`

## What Was Added

### `packages/mcp/src/mcp-contract.ts`

Purpose:
- future MCP registry, capability mapping, runtime tool binding, এবং dashboard inspection-এর জন্য same server shape provide করা

Constants:
- `MCP_CONTRACT_VERSION`
- `MCP_TRANSPORTS`
- `MCP_SERVER_STATUSES`
- `MCP_AUTH_TYPES`

Main types:
- `McpTransport`
- `McpServerStatus`
- `McpAuthType`
- `McpServerAuth`
- `McpServerCapability`
- `McpServerConnection`
- `McpServerDefinition`
- `McpServerDefinitionInput`

Function-by-Function Why:
- `createMcpServerDefinition(input)`
  - defaults apply করে
  - connection args clone করে
  - auth/capabilities/tags normalize করে
  - canonical MCP server object shape দেয়

### `packages/mcp/src/index.ts`

Purpose:
- mcp package public API expose করা

### `tests/unit/mcp-contracts.test.ts`

Purpose:
- contract constants stable আছে কিনা
- `createMcpServerDefinition()` defaults apply করে কিনা
- nested metadata clone হয় কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/mcp-contracts.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- test pass
- typecheck clean

## Next Safe Step

`M9-S2`: MCP registration/unregistration implement করা।
