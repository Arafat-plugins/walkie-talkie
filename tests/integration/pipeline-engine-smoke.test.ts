import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createPipelineDefinition,
  createPipelineExecutionReport,
  markPipelineExecutionCompleted,
  markPipelineExecutionStepCompleted,
  resolveBranchingExecutionPath,
  resolveSequentialExecutionPath
} from "../../packages/pipeline/src/index.ts";

test("pipeline engine smoke: linear pipeline resolves and completes through report lifecycle", () => {
  const pipeline = createPipelineDefinition({
    id: "telegram-health-smoke",
    name: "Telegram Health Smoke",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Router Agent" },
      { id: "skill-1", type: "skill", label: "Health Skill" },
      { id: "response-1", type: "response", label: "Reply Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
      { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
    ]
  });

  const plan = resolveSequentialExecutionPath(pipeline);
  assert.equal(plan.ok, true);
  if (!plan.ok) {
    return;
  }

  let report = createPipelineExecutionReport(pipeline, plan.steps, () => "2026-03-21T11:00:00.000Z");

  for (const step of plan.steps) {
    report = markPipelineExecutionStepCompleted(report, step.node.id);
  }

  report = markPipelineExecutionCompleted(report, () => "2026-03-21T11:01:00.000Z");

  assert.equal(report.status, "success");
  assert.equal(report.finishedAt, "2026-03-21T11:01:00.000Z");
  assert.deepEqual(
    report.steps.map((step) => [step.nodeId, step.status]),
    [
      ["trigger-1", "completed"],
      ["agent-1", "completed"],
      ["skill-1", "completed"],
      ["response-1", "completed"]
    ]
  );
});

test("pipeline engine smoke: branch discovery returns linear prefix and options for routing", () => {
  const pipeline = createPipelineDefinition({
    id: "telegram-branch-smoke",
    name: "Telegram Branch Smoke",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Telegram Trigger" },
      { id: "agent-1", type: "agent", label: "Routing Agent" },
      { id: "skill-1", type: "skill", label: "Tool Skill" },
      { id: "response-1", type: "response", label: "Fallback Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "skill-1", type: "success" },
      { id: "edge-3", from: "agent-1", to: "response-1", type: "failure" }
    ]
  });

  const plan = resolveBranchingExecutionPath(pipeline);

  assert.equal(plan.ok, true);
  if (!plan.ok) {
    return;
  }

  assert.deepEqual(
    plan.steps.map((step) => step.node.id),
    ["trigger-1", "agent-1"]
  );
  assert.equal(plan.branch?.fromNode.id, "agent-1");
  assert.deepEqual(
    plan.branch?.options.map((option) => `${option.edge.type}:${option.node.id}`),
    ["success:skill-1", "failure:response-1"]
  );
});
