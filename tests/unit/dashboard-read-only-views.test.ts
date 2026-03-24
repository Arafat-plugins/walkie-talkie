import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDashboardReadOnlySummary,
  createDashboardReadOnlyViewsModel
} from "../../apps/dashboard/src/index.ts";

test("createDashboardReadOnlyViewsModel summarizes agents, skills, and mcp servers", () => {
  const model = createDashboardReadOnlyViewsModel({
    agents: [
      {
        version: "1",
        id: "router-agent",
        name: "Router Agent",
        status: "active",
        executionMode: "assisted",
        prompt: "Route tasks.",
        model: {
          provider: "primary-openai",
          model: "gpt-4o-mini"
        },
        skills: [{ skillId: "cursor-check-skill", required: true }],
        triggers: [{ kind: "telegram", event: "telegram.message.received" }],
        tags: []
      }
    ],
    skills: [
      {
        version: "1",
        id: "cursor-check-skill",
        name: "Cursor Check Skill",
        status: "active",
        executionMode: "async",
        description: "Checks cursor availability.",
        parameters: [],
        tags: [],
        handler: async () => ({ ok: true, output: "unused" })
      }
    ],
    mcpServers: [
      {
        version: "1",
        id: "filesystem-mcp",
        name: "Filesystem MCP",
        status: "active",
        connection: {
          transport: "stdio",
          command: "npx",
          args: ["filesystem-mcp"]
        },
        auth: {
          type: "none"
        },
        capabilities: [{ id: "read-files" }],
        tags: []
      }
    ]
  });

  assert.deepEqual(model.agents, [
    {
      id: "router-agent",
      title: "Router Agent",
      subtitle: "Route tasks.",
      meta: ["status=active", "mode=assisted", "triggers=1", "skills=1"]
    }
  ]);
  assert.deepEqual(model.skills, [
    {
      id: "cursor-check-skill",
      title: "Cursor Check Skill",
      subtitle: "Checks cursor availability.",
      meta: ["status=active", "execution=async", "parameters=0"]
    }
  ]);
  assert.deepEqual(model.mcpServers, [
    {
      id: "filesystem-mcp",
      title: "Filesystem MCP",
      subtitle: "stdio transport",
      meta: ["status=active", "capabilities=1", "auth=none"]
    }
  ]);
});

test("buildDashboardReadOnlySummary returns readable section lines", () => {
  const summary = buildDashboardReadOnlySummary({
    agents: [{ id: "a1", title: "Router Agent", subtitle: "", meta: [] }],
    skills: [{ id: "s1", title: "Cursor Check Skill", subtitle: "", meta: [] }],
    mcpServers: [{ id: "m1", title: "Filesystem MCP", subtitle: "", meta: [] }]
  });

  assert.deepEqual(summary, [
    "Agents: Router Agent",
    "Skills: Cursor Check Skill",
    "MCP: Filesystem MCP"
  ]);
});
