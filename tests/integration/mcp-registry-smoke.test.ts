import assert from "node:assert/strict";
import { test } from "node:test";

import { buildMcpCapabilityMap, McpRegistryStore } from "../../packages/mcp/src/index.ts";

test("mcp registry smoke: register -> map capabilities -> unregister updates availability", () => {
  const registry = new McpRegistryStore();

  registry.register({
    id: "filesystem-mcp",
    name: "Filesystem MCP",
    connection: {
      transport: "stdio",
      command: "npx",
      args: ["filesystem-mcp"]
    },
    capabilities: [{ id: "read-files" }, { id: "write-files" }]
  });

  registry.register({
    id: "database-mcp",
    name: "Database MCP",
    connection: {
      transport: "stdio",
      command: "npx",
      args: ["database-mcp"]
    },
    capabilities: [{ id: "query-db" }, { id: "read-files" }]
  });

  const firstMap = buildMcpCapabilityMap(registry.list());
  assert.deepEqual(firstMap.get("read-files"), ["database-mcp", "filesystem-mcp"]);
  assert.deepEqual(firstMap.get("query-db"), ["database-mcp"]);

  registry.unregister("database-mcp");

  const secondMap = buildMcpCapabilityMap(registry.list());
  assert.deepEqual(secondMap.get("read-files"), ["filesystem-mcp"]);
  assert.equal(secondMap.has("query-db"), false);
});
