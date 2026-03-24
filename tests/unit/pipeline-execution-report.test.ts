import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createPipelineDefinition,
  createPipelineExecutionReport,
  createPipelineResolutionFailureReport,
  markPipelineExecutionCompleted,
  markPipelineExecutionFailed,
  markPipelineExecutionStepCompleted,
  resolveSequentialExecutionPath
} from "../../packages/pipeline/src/index.ts";

function createLinearPipeline() {
  return createPipelineDefinition({
    id: "telegram-health-pipeline",
    name: "Telegram Health Pipeline",
    startNodeId: "trigger-1",
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger" },
      { id: "agent-1", type: "agent", label: "Agent" },
      { id: "response-1", type: "response", label: "Response" }
    ],
    edges: [
      { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
      { id: "edge-2", from: "agent-1", to: "response-1", type: "default" }
    ]
  });
}

test("createPipelineExecutionReport builds planned step list from sequential steps", () => {
  const pipeline = createLinearPipeline();
  const path = resolveSequentialExecutionPath(pipeline);

  assert.equal(path.ok, true);
  if (!path.ok) {
    return;
  }

  const report = createPipelineExecutionReport(pipeline, path.steps, () => "2026-03-21T10:00:00.000Z");

  assert.equal(report.status, "planned");
  assert.equal(report.startedAt, "2026-03-21T10:00:00.000Z");
  assert.deepEqual(
    report.steps.map((step) => [step.nodeId, step.status, step.viaEdgeId]),
    [
      ["trigger-1", "planned", undefined],
      ["agent-1", "planned", "edge-1"],
      ["response-1", "planned", "edge-2"]
    ]
  );
});

test("markPipelineExecutionStepCompleted marks a single step and sets report to running", () => {
  const pipeline = createLinearPipeline();
  const path = resolveSequentialExecutionPath(pipeline);

  assert.equal(path.ok, true);
  if (!path.ok) {
    return;
  }

  const report = createPipelineExecutionReport(pipeline, path.steps, () => "2026-03-21T10:00:00.000Z");
  const updated = markPipelineExecutionStepCompleted(report, "trigger-1");

  assert.equal(updated.status, "running");
  assert.deepEqual(
    updated.steps.map((step) => step.status),
    ["completed", "planned", "planned"]
  );
});

test("markPipelineExecutionFailed marks current step failed and remaining steps blocked", () => {
  const pipeline = createLinearPipeline();
  const path = resolveSequentialExecutionPath(pipeline);

  assert.equal(path.ok, true);
  if (!path.ok) {
    return;
  }

  const report = createPipelineExecutionReport(pipeline, path.steps, () => "2026-03-21T10:00:00.000Z");
  const running = markPipelineExecutionStepCompleted(report, "trigger-1");
  const failed = markPipelineExecutionFailed(
    running,
    "agent-1",
    "Agent execution failed.",
    () => "2026-03-21T10:05:00.000Z"
  );

  assert.equal(failed.status, "failed");
  assert.equal(failed.finishedAt, "2026-03-21T10:05:00.000Z");
  assert.equal(failed.error, "Agent execution failed.");
  assert.deepEqual(
    failed.steps.map((step) => [step.nodeId, step.status, step.error]),
    [
      ["trigger-1", "completed", undefined],
      ["agent-1", "failed", "Agent execution failed."],
      ["response-1", "blocked", undefined]
    ]
  );
});

test("markPipelineExecutionCompleted completes remaining planned steps and finalizes report", () => {
  const pipeline = createLinearPipeline();
  const path = resolveSequentialExecutionPath(pipeline);

  assert.equal(path.ok, true);
  if (!path.ok) {
    return;
  }

  const report = createPipelineExecutionReport(pipeline, path.steps, () => "2026-03-21T10:00:00.000Z");
  const running = markPipelineExecutionStepCompleted(report, "trigger-1");
  const completed = markPipelineExecutionCompleted(running, () => "2026-03-21T10:07:00.000Z");

  assert.equal(completed.status, "success");
  assert.equal(completed.finishedAt, "2026-03-21T10:07:00.000Z");
  assert.deepEqual(
    completed.steps.map((step) => step.status),
    ["completed", "completed", "completed"]
  );
});

test("createPipelineResolutionFailureReport captures pre-execution block state", () => {
  const pipeline = createLinearPipeline();
  const report = createPipelineResolutionFailureReport(
    pipeline,
    "Pipeline start node was not found.",
    () => "2026-03-21T10:09:00.000Z"
  );

  assert.equal(report.status, "blocked");
  assert.equal(report.startedAt, "2026-03-21T10:09:00.000Z");
  assert.equal(report.finishedAt, "2026-03-21T10:09:00.000Z");
  assert.equal(report.error, "Pipeline start node was not found.");
  assert.deepEqual(report.steps, []);
});
