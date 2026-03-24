import assert from "node:assert/strict";
import { test } from "node:test";

import { createPipelineDefinition, resolveSequentialExecutionPath } from "../../packages/pipeline/src/index.ts";

function createDemoPipeline() {
  return createPipelineDefinition({
    id: "telegram-demo-pipeline",
    name: "Telegram Demo Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent" },
      { id: "skill-1", type: "skill", label: "Server Check Skill" },
      { id: "response-1", type: "response", label: "Telegram Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });
}

test("resolveSequentialExecutionPath returns ordered steps for a simple linear pipeline", () => {
  const result = resolveSequentialExecutionPath(createDemoPipeline());

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.deepEqual(
    result.steps.map((step) => step.node.id),
    ["trigger-1", "agent-1", "skill-1", "response-1"]
  );
  assert.equal(result.steps[1]?.viaEdge?.id, "edge-1");
  assert.equal(result.steps[3]?.viaEdge?.id, "edge-3");
});

test("resolveSequentialExecutionPath fails when start node is missing", () => {
  const pipeline = createPipelineDefinition({
    id: "broken-start-pipeline",
    name: "Broken Start Pipeline",
    startNodeId: "missing-start",
    nodes: [{ id: "agent-1", type: "agent", label: "Agent" }],
    edges: []
  });

  const result = resolveSequentialExecutionPath(pipeline);
  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.match(result.error, /start node/);
});

test("resolveSequentialExecutionPath fails when multiple default edges create ambiguity", () => {
  const pipeline = createPipelineDefinition({
    id: "ambiguous-pipeline",
    name: "Ambiguous Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Agent One" },
      { id: "agent-2", type: "agent", label: "Agent Two" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "trigger-1", to: "agent-2", type: "default" }
    ]
  });

  const result = resolveSequentialExecutionPath(pipeline);
  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.match(result.error, /multiple default edges/);
});

test("resolveSequentialExecutionPath fails when a cycle is detected", () => {
  const pipeline = createPipelineDefinition({
    id: "cycle-pipeline",
    name: "Cycle Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Agent" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "trigger-1", type: "default" }
    ]
  });

  const result = resolveSequentialExecutionPath(pipeline);
  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.match(result.error, /cycle/);
});
