import assert from "node:assert/strict";
import { test } from "node:test";

import { McpRegistryStore } from "../../packages/mcp/src/index.ts";

function createServerInput(id: string, name: string) {
  return {
    id,
    name,
    connection: {
      transport: "stdio" as const,
      command: "npx",
      args: ["demo-mcp-server"]
    },
    tags: ["demo"]
  };
}

test("McpRegistryStore register/list/get/unregister work for in-memory servers", () => {
  const registry = new McpRegistryStore();

  const registered = registry.register(createServerInput("filesystem-mcp", "Filesystem MCP"));
  assert.equal(registered.id, "filesystem-mcp");
  assert.equal(registry.list().length, 1);
  assert.equal(registry.get("filesystem-mcp")?.name, "Filesystem MCP");

  assert.equal(registry.unregister("filesystem-mcp"), true);
  assert.equal(registry.get("filesystem-mcp"), undefined);
  assert.equal(registry.list().length, 0);
  assert.equal(registry.unregister("filesystem-mcp"), false);
});

test("McpRegistryStore blocks duplicate ids and returns cloned snapshots", () => {
  const registry = new McpRegistryStore();

  registry.register(createServerInput("database-mcp", "Database MCP"));

  assert.throws(() => registry.register(createServerInput("database-mcp", "Database MCP Duplicate")), /already exists/);

  const listed = registry.list();
  listed[0].connection.args?.push("mutated");
  listed[0].tags.push("changed");

  const freshRead = registry.get("database-mcp");
  assert.deepEqual(freshRead?.connection.args, ["demo-mcp-server"]);
  assert.deepEqual(freshRead?.tags, ["demo"]);
});

test("McpRegistryStore seed/count/snapshot support restored server state", () => {
  const registry = new McpRegistryStore();

  registry.seed({
    version: "1",
    id: "restored-mcp",
    name: "Restored MCP",
    status: "active",
    connection: {
      transport: "stdio",
      command: "node",
      args: ["server.js"]
    },
    auth: {
      type: "none"
    },
    capabilities: [],
    tags: ["restored"]
  });

  assert.equal(registry.contains("restored-mcp"), true);
  assert.equal(registry.count(), 1);
  assert.equal(registry.snapshot()[0]?.id, "restored-mcp");
  assert.equal(registry.snapshotById("restored-mcp")?.name, "Restored MCP");
});
