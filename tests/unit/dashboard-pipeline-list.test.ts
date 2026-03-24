import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDashboardPipelineSummary,
  createDashboardPipelineListModel
} from "../../apps/dashboard/src/index.ts";

test("createDashboardPipelineListModel summarizes pipelines for dashboard list view", () => {
  const model = createDashboardPipelineListModel({
    pipelines: [
      {
        version: "1",
        id: "telegram-cursor-check",
        name: "Telegram Cursor Check",
        description: "Checks whether cursor exists.",
        startNodeId: "trigger-1",
        nodes: [
          { id: "trigger-1", type: "trigger", label: "Trigger" },
          { id: "agent-1", type: "agent", label: "Agent" },
          { id: "skill-1", type: "skill", label: "Skill" },
          { id: "response-1", type: "response", label: "Response" }
        ],
        edges: [
          { id: "edge-1", from: "trigger-1", to: "agent-1", type: "default" },
          { id: "edge-2", from: "agent-1", to: "skill-1", type: "default" },
          { id: "edge-3", from: "skill-1", to: "response-1", type: "default" }
        ],
        tags: ["telegram", "demo"]
      }
    ]
  });

  assert.deepEqual(model.pipelines, [
    {
      id: "telegram-cursor-check",
      title: "Telegram Cursor Check",
      subtitle: "Checks whether cursor exists.",
      meta: ["nodes=4", "edges=3", "start=trigger-1", "tags=2"]
    }
  ]);
});

test("buildDashboardPipelineSummary returns readable pipeline line", () => {
  const summary = buildDashboardPipelineSummary({
    pipelines: [
      {
        id: "p1",
        title: "Telegram Cursor Check",
        subtitle: "",
        meta: []
      }
    ]
  });

  assert.deepEqual(summary, ["Pipelines: Telegram Cursor Check"]);
});
