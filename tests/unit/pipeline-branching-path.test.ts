import assert from "node:assert/strict";
import { test } from "node:test";

import { createPipelineDefinition, resolveBranchingExecutionPath } from "../../packages/pipeline/src/index.ts";

test("resolveBranchingExecutionPath returns branch options after linear prefix", () => {
  const pipeline = createPipelineDefinition({
    id: "conditional-router-pipeline",
    name: "Conditional Router Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent" },
      { id: "skill-1", type: "skill", label: "Success Skill" },
      { id: "response-1", type: "response", label: "Failure Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "success" },
      { id: "edge-3", from: "agent-1", to: "response-1", type: "failure" }
    ]
  });

  const result = resolveBranchingExecutionPath(pipeline);

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.deepEqual(
    result.steps.map((step) => step.node.id),
    ["trigger-1", "agent-1"]
  );
  assert.equal(result.branch?.fromNode.id, "agent-1");
  assert.deepEqual(
    result.branch?.options.map((option) => `${option.edge.type}:${option.node.id}`),
    ["success:skill-1", "failure:response-1"]
  );
});

test("resolveBranchingExecutionPath returns terminal linear path when no branch exists", () => {
  const pipeline = createPipelineDefinition({
    id: "linear-pipeline",
    name: "Linear Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "response-1", type: "response", label: "Response" }
    ],
    edges: [{ id: "edge-1", from: "trigger-1", to: "response-1", type: "default" }]
  });

  const result = resolveBranchingExecutionPath(pipeline);

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.branch, undefined);
  assert.deepEqual(
    result.steps.map((step) => step.node.id),
    ["trigger-1", "response-1"]
  );
});

test("resolveBranchingExecutionPath fails when a branch points to a missing node", () => {
  const pipeline = createPipelineDefinition({
    id: "missing-branch-node-pipeline",
    name: "Missing Branch Node Pipeline",
    startNodeId: "trigger-1",
    nodes: [{ id: "trigger-1", type: "trigger", label: "Trigger" }],
    edges: [{ id: "edge-1", from: "trigger-1", to: "missing-response", type: "failure" }]
  });

  const result = resolveBranchingExecutionPath(pipeline);
  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.match(result.error, /missing node/);
});

test("resolveBranchingExecutionPath fails when a branch creates a cycle", () => {
  const pipeline = createPipelineDefinition({
    id: "cycle-branch-pipeline",
    name: "Cycle Branch Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Agent" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "trigger-1", type: "failure" }
    ]
  });

  const result = resolveBranchingExecutionPath(pipeline);
  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.match(result.error, /cycle/);
});
