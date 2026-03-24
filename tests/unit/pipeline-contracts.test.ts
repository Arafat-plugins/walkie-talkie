import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PIPELINE_CONTRACT_VERSION,
  PIPELINE_EDGE_TYPES,
  PIPELINE_NODE_TYPES,
  createPipelineDefinition
} from "../../packages/pipeline/src/index.ts";

test("pipeline contract exports stable enum-like values", () => {
  assert.deepEqual(PIPELINE_NODE_TYPES, ["trigger", "agent", "skill", "mcp", "condition", "response"]);
  assert.deepEqual(PIPELINE_EDGE_TYPES, ["default", "success", "failure", "conditional"]);
  assert.equal(PIPELINE_CONTRACT_VERSION, "1");
});

test("createPipelineDefinition applies version and clones graph structures", () => {
  const input = {
    id: "telegram-check-pipeline",
    name: "Telegram Check Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger" as const,
        label: "Telegram Trigger",
        config: {
          refId: "telegram-adapter"
        }
      },
      {
        id: "agent-1",
        type: "agent" as const,
        label: "Router Agent",
        config: {
          refId: "router-agent"
        }
      }
    ],
    edges: [
      {
        id: "edge-1",
        from: "trigger-1",
        to: "agent-1",
        type: "default" as const
      }
    ],
    tags: ["telegram"]
  };

  const pipeline = createPipelineDefinition(input);

  assert.equal(pipeline.version, "1");
  assert.equal(pipeline.startNodeId, "trigger-1");
  assert.deepEqual(pipeline.tags, ["telegram"]);
  assert.equal(pipeline.nodes[0]?.config?.refId, "telegram-adapter");
  assert.equal(pipeline.edges[0]?.to, "agent-1");

  input.nodes[0].config.refId = "mutated";
  input.edges[0].to = "mutated-edge";
  input.tags.push("changed");

  assert.equal(pipeline.nodes[0]?.config?.refId, "telegram-adapter");
  assert.equal(pipeline.edges[0]?.to, "agent-1");
  assert.deepEqual(pipeline.tags, ["telegram"]);
});
