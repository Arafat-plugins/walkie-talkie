import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MCP_AUTH_TYPES,
  MCP_CONTRACT_VERSION,
  MCP_SERVER_STATUSES,
  MCP_TRANSPORTS,
  createMcpServerDefinition
} from "../../packages/mcp/src/index.ts";

test("mcp contract exports stable enum-like values", () => {
  assert.deepEqual(MCP_TRANSPORTS, ["stdio", "http", "sse"]);
  assert.deepEqual(MCP_SERVER_STATUSES, ["active", "paused", "disabled"]);
  assert.deepEqual(MCP_AUTH_TYPES, ["none", "token", "header"]);
  assert.equal(MCP_CONTRACT_VERSION, "1");
});

test("createMcpServerDefinition applies defaults and clones nested metadata", () => {
  const input = {
    id: "filesystem-mcp",
    name: "Filesystem MCP",
    connection: {
      transport: "stdio" as const,
      command: "npx",
      args: ["@modelcontextprotocol/server-filesystem", "/tmp"]
    },
    capabilities: [
      {
        id: "read-files",
        description: "Read local files"
      }
    ],
    tags: ["filesystem"]
  };

  const server = createMcpServerDefinition(input);

  assert.equal(server.version, "1");
  assert.equal(server.status, "active");
  assert.equal(server.auth.type, "none");
  assert.deepEqual(server.connection.args, ["@modelcontextprotocol/server-filesystem", "/tmp"]);
  assert.deepEqual(server.capabilities, [
    {
      id: "read-files",
      description: "Read local files"
    }
  ]);
  assert.deepEqual(server.tags, ["filesystem"]);

  input.connection.args[0] = "mutated";
  input.capabilities[0].id = "mutated-capability";
  input.tags.push("changed");

  assert.deepEqual(server.connection.args, ["@modelcontextprotocol/server-filesystem", "/tmp"]);
  assert.equal(server.capabilities[0]?.id, "read-files");
  assert.deepEqual(server.tags, ["filesystem"]);
});
