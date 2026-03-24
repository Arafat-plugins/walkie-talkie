import type { DashboardStatusCard } from "../app/shell.ts";
import {
  buildAuditEventSummary,
  createAuditEvent,
  type AuditEvent
} from "../../../../packages/logging/src/index.ts";
import type { RuntimeRunHistoryEntry } from "../../../../packages/runtime/src/index.ts";

export type DashboardLogItem = {
  id: string;
  title: string;
  detail: string;
  tone: "success" | "warning" | "neutral";
};

export type DashboardAuditItem = {
  id: string;
  title: string;
  detail: string;
  tone: "success" | "warning" | "neutral";
};

export type DashboardStatusLogPanelModel = {
  statusCards: DashboardStatusCard[];
  latestRun?: DashboardLogItem;
  recentRuns: DashboardLogItem[];
  recentAudit: DashboardAuditItem[];
};

function summarizeRun(entry: RuntimeRunHistoryEntry): DashboardLogItem {
  const tone = entry.status === "success" ? "success" : entry.status === "failed" ? "warning" : "neutral";

  return {
    id: entry.runId,
    title: `${entry.pipelineName} [${entry.status}]`,
    detail: `${entry.triggerEventName} @ ${entry.startedAt}`,
    tone
  };
}

function summarizeAudit(event: AuditEvent): DashboardAuditItem {
  const tone =
    event.outcome === "success"
      ? "success"
      : event.outcome === "failure" || event.outcome === "blocked"
        ? "warning"
        : "neutral";

  const lines = buildAuditEventSummary(event);

  return {
    id: event.id,
    title: `${event.category}/${event.action} [${event.outcome}]`,
    detail: lines.slice(2).join(" | "),
    tone
  };
}

export function createDashboardStatusLogPanelModel(input: {
  statusCards: DashboardStatusCard[];
  runHistory: RuntimeRunHistoryEntry[];
  auditEvents?: AuditEvent[];
}): DashboardStatusLogPanelModel {
  const recentRuns = input.runHistory.map((entry) => summarizeRun(entry));
  const recentAudit = (input.auditEvents ?? []).map((event) => summarizeAudit(event));

  return {
    statusCards: input.statusCards.map((card) => ({ ...card })),
    latestRun: recentRuns[0],
    recentRuns,
    recentAudit
  };
}

export function buildDashboardStatusLogSummary(model: DashboardStatusLogPanelModel): string[] {
  return [
    `Status Cards: ${model.statusCards.map((card) => `${card.title}=${card.value}`).join(" | ")}`,
    `Latest Run: ${model.latestRun ? model.latestRun.title : "none"}`,
    `Recent Runs: ${model.recentRuns.map((run) => run.title).join(", ") || "none"}`,
    `Recent Audit: ${model.recentAudit.map((item) => item.title).join(", ") || "none"}`
  ];
}

function renderLogItem(item: DashboardLogItem | DashboardAuditItem): string {
  return `
    <article class="wt-log-item wt-log-item--${item.tone}" data-log-id="${item.id}">
      <h3 class="wt-log-item__title">${item.title}</h3>
      <p class="wt-log-item__detail">${item.detail}</p>
    </article>
  `.trim();
}

export function createDashboardDemoStatusLogPanelModel(): DashboardStatusLogPanelModel {
  return createDashboardStatusLogPanelModel({
    statusCards: [
      { id: "readiness", title: "Runtime Readiness", value: "Foundations Ready", tone: "success" },
      { id: "integrations", title: "Connected Integrations", value: "Telegram + AI Skeleton", tone: "neutral" },
      { id: "risk", title: "Attention Needed", value: "Live transports pending", tone: "warning" }
    ],
    runHistory: [
      {
        runId: "telegram-cursor-check:2026-03-23T09:00:00.000Z",
        pipelineId: "telegram-cursor-check",
        pipelineName: "Telegram Cursor Check",
        triggerKind: "telegram",
        triggerEventName: "telegram.message.received",
        status: "success",
        startedAt: "2026-03-23T09:00:00.000Z",
        finishedAt: "2026-03-23T09:00:03.000Z"
      },
      {
        runId: "dashboard-ops-briefing:2026-03-23T09:15:00.000Z",
        pipelineId: "dashboard-ops-briefing",
        pipelineName: "Dashboard Ops Briefing",
        triggerKind: "dashboard",
        triggerEventName: "dashboard.refresh",
        status: "blocked",
        startedAt: "2026-03-23T09:15:00.000Z",
        finishedAt: "2026-03-23T09:15:01.000Z",
        error: "Live transport metrics unavailable."
      }
    ],
    auditEvents: [
      createAuditEvent({
        id: "audit-telegram-receive",
        category: "integration",
        action: "telegram.receive",
        outcome: "success",
        actor: { type: "integration", id: "telegram" },
        target: { kind: "trigger", id: "telegram.message.received" },
        now: () => "2026-03-23T09:00:00.000Z"
      }),
      createAuditEvent({
        id: "audit-dashboard-blocked",
        category: "runtime",
        action: "dashboard.refresh",
        outcome: "blocked",
        actor: { type: "system", id: "walkie-talkie" },
        target: { kind: "pipeline", id: "dashboard-ops-briefing" },
        now: () => "2026-03-23T09:15:01.000Z"
      })
    ]
  });
}

export function buildDashboardStatusLogPanelMarkup(model: DashboardStatusLogPanelModel): string {
  return `
    <section class="wt-status-panel">
      <div class="wt-section__header">
        <p class="wt-section__eyebrow">Operations</p>
        <h2 class="wt-section__title">Status and Logs</h2>
        <p class="wt-section__body">
          Runs and audit signals surface the most recent orchestration activity while live transport work is still landing.
        </p>
      </div>
      <div class="wt-status-grid">
        <div class="wt-status-column">
          <h3 class="wt-status-column__title">Latest Run</h3>
          ${model.latestRun ? renderLogItem(model.latestRun) : '<p class="wt-status-empty">No runs yet.</p>'}
          <div class="wt-status-list">
            ${model.recentRuns.map((run) => renderLogItem(run)).join("")}
          </div>
        </div>
        <div class="wt-status-column">
          <h3 class="wt-status-column__title">Audit Trail</h3>
          <div class="wt-status-list">
            ${model.recentAudit.length > 0
              ? model.recentAudit.map((item) => renderLogItem(item)).join("")
              : '<p class="wt-status-empty">No audit signals yet.</p>'}
          </div>
        </div>
      </div>
    </section>
  `.trim();
}
