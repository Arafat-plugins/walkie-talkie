import assert from "node:assert/strict";
import { test } from "node:test";

import { createAgentDefinition } from "../../packages/agents/src/index.ts";
import { createAuditEvent } from "../../packages/logging/src/index.ts";
import { createMcpServerDefinition } from "../../packages/mcp/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import {
  STORAGE_CONTRACT_VERSION,
  createEntityStorageSnapshot,
  createNoopWalkieTalkieStorageAdapter,
  createRuntimeStorageSnapshot
} from "../../packages/shared/src/index.ts";
import { createSkillDefinition } from "../../packages/skills/src/index.ts";

test("createEntityStorageSnapshot clones entity snapshots with defaults", () => {
  const agent = createAgentDefinition({
    id: "agent-1",
    name: "Router",
    prompt: "Route tasks.",
    model: {
      provider: "default-ai",
      model: "gpt-4o-mini"
    },
    tags: ["ops"]
  });
  const skill = createSkillDefinition({
    id: "skill-1",
    name: "Cursor Check",
    handler: async () => ({
      ok: true,
      output: "ready"
    }),
    tags: ["server"]
  });
  const server = createMcpServerDefinition({
    id: "mcp-1",
    name: "Filesystem MCP",
    connection: {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem"]
    },
    capabilities: [
      {
        id: "fs.read",
        description: "Read Files"
      }
    ]
  });
  const pipeline = createPipelineDefinition({
    id: "pipeline-1",
    name: "Ops Pipeline",
    startNodeId: "trigger-1",
    nodes: [{ id: "trigger-1", type: "trigger", label: "Trigger" }],
    edges: [],
    tags: ["ops"]
  });

  const snapshot = createEntityStorageSnapshot({
    agents: [agent],
    skills: [skill],
    mcpServers: [server],
    pipelines: [pipeline],
    now: () => "2026-03-24T18:00:00.000Z"
  });

  assert.equal(snapshot.version, STORAGE_CONTRACT_VERSION);
  assert.equal(snapshot.updatedAt, "2026-03-24T18:00:00.000Z");
  assert.equal(snapshot.agents[0]?.id, "agent-1");
  assert.equal(snapshot.skills[0]?.id, "skill-1");
  assert.equal(snapshot.mcpServers[0]?.id, "mcp-1");
  assert.equal(snapshot.pipelines[0]?.id, "pipeline-1");

  snapshot.agents[0]?.tags.push("mutated");
  snapshot.skills[0]?.parameters.push({
    name: "changed",
    type: "string",
    required: false
  });
  snapshot.mcpServers[0]?.capabilities.push({
    id: "fs.write",
    description: "Write Files"
  });
  snapshot.pipelines[0]?.nodes.push({
    id: "agent-2",
    type: "agent",
    label: "Extra Agent"
  });

  assert.deepEqual(agent.tags, ["ops"]);
  assert.deepEqual(skill.parameters, []);
  assert.equal(server.capabilities.length, 1);
  assert.equal(pipeline.nodes.length, 1);
});

test("createRuntimeStorageSnapshot clones run and audit data", () => {
  const snapshot = createRuntimeStorageSnapshot({
    runs: [
      {
        runId: "run-1",
        pipelineId: "pipeline-1",
        pipelineName: "Ops Pipeline",
        triggerKind: "telegram",
        triggerEventName: "telegram.message.received",
        status: "success",
        startedAt: "2026-03-24T18:05:00.000Z",
        finishedAt: "2026-03-24T18:05:01.000Z"
      }
    ],
    auditEvents: [
      createAuditEvent({
        id: "audit-1",
        category: "pipeline",
        action: "execute",
        target: {
          kind: "pipeline",
          id: "pipeline-1"
        },
        metadata: {
          approved: true
        },
        now: () => "2026-03-24T18:05:01.000Z"
      })
    ],
    now: () => "2026-03-24T18:06:00.000Z"
  });

  assert.equal(snapshot.version, STORAGE_CONTRACT_VERSION);
  assert.equal(snapshot.updatedAt, "2026-03-24T18:06:00.000Z");
  assert.equal(snapshot.runs[0]?.runId, "run-1");
  assert.equal(snapshot.auditEvents[0]?.id, "audit-1");

  if (snapshot.auditEvents[0]?.metadata) {
    snapshot.auditEvents[0].metadata.approved = false;
  }

  assert.equal(snapshot.runs.length, 1);
  assert.equal(snapshot.auditEvents[0]?.metadata?.approved, false);
});

test("createNoopWalkieTalkieStorageAdapter returns empty snapshots", async () => {
  const adapter = createNoopWalkieTalkieStorageAdapter();

  const entities = await adapter.loadEntities();
  const runtime = await adapter.loadRuntimeData();

  assert.equal(entities.version, STORAGE_CONTRACT_VERSION);
  assert.deepEqual(entities.agents, []);
  assert.deepEqual(entities.skills, []);
  assert.deepEqual(entities.mcpServers, []);
  assert.deepEqual(entities.pipelines, []);
  assert.equal(runtime.version, STORAGE_CONTRACT_VERSION);
  assert.deepEqual(runtime.runs, []);
  assert.deepEqual(runtime.auditEvents, []);

  await adapter.saveEntities(entities);
  await adapter.saveRuntimeData(runtime);
});
