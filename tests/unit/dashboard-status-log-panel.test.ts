import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDashboardStatusLogPanelMarkup,
  buildDashboardStatusLogSummary,
  createDashboardDemoStatusLogPanelModel,
  createDashboardShellModel,
  createDashboardStatusLogPanelModel
} from "../../apps/dashboard/src/index.ts";

test("createDashboardStatusLogPanelModel summarizes latest and recent runs with status cards", () => {
  const shell = createDashboardShellModel();
  const model = createDashboardStatusLogPanelModel({
    statusCards: shell.statusCards,
    runHistory: [
      {
        runId: "telegram-cursor-check:2026-03-21T16:00:00.000Z",
        pipelineId: "telegram-cursor-check",
        pipelineName: "Telegram Cursor Check",
        triggerKind: "telegram",
        triggerEventName: "telegram.message.received",
        status: "success",
        startedAt: "2026-03-21T16:00:00.000Z",
        finishedAt: "2026-03-21T16:00:00.000Z"
      },
      {
        runId: "unresolved:2026-03-21T16:05:00.000Z",
        pipelineId: "unresolved",
        pipelineName: "Unresolved Pipeline",
        triggerKind: "telegram",
        triggerEventName: "telegram.command.received",
        status: "blocked",
        startedAt: "2026-03-21T16:05:00.000Z",
        finishedAt: "2026-03-21T16:05:00.000Z",
        error: "No flow binding matched trigger."
      }
    ]
  });

  assert.equal(model.latestRun?.title, "Telegram Cursor Check [success]");
  assert.deepEqual(
    model.recentRuns.map((run) => [run.id, run.tone]),
    [
      ["telegram-cursor-check:2026-03-21T16:00:00.000Z", "success"],
      ["unresolved:2026-03-21T16:05:00.000Z", "neutral"]
    ]
  );
  assert.equal(model.statusCards.length, 3);
});

test("buildDashboardStatusLogSummary returns readable log panel lines", () => {
  const summary = buildDashboardStatusLogSummary({
    statusCards: [
      { id: "readiness", title: "Runtime Readiness", value: "Foundations Ready", tone: "success" }
    ],
    latestRun: {
      id: "r1",
      title: "Telegram Cursor Check [success]",
      detail: "telegram.message.received @ 2026-03-21T16:00:00.000Z",
      tone: "success"
    },
    recentRuns: [
      {
        id: "r1",
        title: "Telegram Cursor Check [success]",
        detail: "",
        tone: "success"
      }
    ],
    recentAudit: []
  });

  assert.deepEqual(summary, [
    "Status Cards: Runtime Readiness=Foundations Ready",
    "Latest Run: Telegram Cursor Check [success]",
    "Recent Runs: Telegram Cursor Check [success]",
    "Recent Audit: none"
  ]);
});

test("createDashboardDemoStatusLogPanelModel builds demo runs and audit items", () => {
  const model = createDashboardDemoStatusLogPanelModel();

  assert.equal(model.recentRuns.length, 2);
  assert.equal(model.recentAudit.length, 2);
  assert.equal(model.latestRun?.title, "Telegram Cursor Check [success]");
});

test("buildDashboardStatusLogPanelMarkup renders latest run and audit entries", () => {
  const markup = buildDashboardStatusLogPanelMarkup(createDashboardDemoStatusLogPanelModel());

  assert.match(markup, /<h2 class="wt-section__title">Status and Logs<\/h2>/);
  assert.match(markup, /Telegram Cursor Check \[success\]/);
  assert.match(markup, /integration\/telegram.receive \[success\]/);
  assert.match(markup, /wt-status-grid/);
});
