import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildMcpCapabilityMap,
  createMcpServerDefinition,
  hasCapability,
  listCapabilitiesForServer,
  listServersForCapability
} from "../../packages/mcp/src/index.ts";

test("buildMcpCapabilityMap maps capability ids to server ids", () => {
  const servers = [
    createMcpServerDefinition({
      id: "filesystem-mcp",
      name: "Filesystem MCP",
      connection: {
        transport: "stdio",
        command: "npx",
        args: ["filesystem-mcp"]
      },
      capabilities: [
        { id: "read-files" },
        { id: "write-files" }
      ]
    }),
    createMcpServerDefinition({
      id: "database-mcp",
      name: "Database MCP",
      connection: {
        transport: "stdio",
        command: "npx",
        args: ["database-mcp"]
      },
      capabilities: [
        { id: "query-db" },
        { id: "read-files" }
      ]
    })
  ];

  const capabilityMap = buildMcpCapabilityMap(servers);

  assert.deepEqual(listServersForCapability(capabilityMap, "read-files"), [
    "database-mcp",
    "filesystem-mcp"
  ]);
  assert.deepEqual(listServersForCapability(capabilityMap, "query-db"), ["database-mcp"]);
  assert.deepEqual(listServersForCapability(capabilityMap, "missing"), []);
});

test("capability helper functions expose server capability metadata", () => {
  const server = createMcpServerDefinition({
    id: "calendar-mcp",
    name: "Calendar MCP",
    connection: {
      transport: "http",
      url: "http://localhost:8080/mcp"
    },
    capabilities: [
      { id: "list-events" },
      { id: "create-event" }
    ]
  });

  const capabilityMap = buildMcpCapabilityMap([server]);

  assert.deepEqual(listCapabilitiesForServer(server), ["list-events", "create-event"]);
  assert.equal(hasCapability(capabilityMap, "list-events", "calendar-mcp"), true);
  assert.equal(hasCapability(capabilityMap, "delete-event", "calendar-mcp"), false);
});
