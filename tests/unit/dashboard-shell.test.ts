import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDashboardShellMarkup,
  buildDashboardShellSummary,
  createDashboardShellModel
} from "../../apps/dashboard/src/index.ts";

test("createDashboardShellModel returns default shell with key dashboard sections", () => {
  const model = createDashboardShellModel();

  assert.equal(model.appName, "Walkie-Talkie");
  assert.equal(model.title, "Control Plane");
  assert.deepEqual(
    model.navItems.map((item) => item.id),
    ["overview", "agents", "skills", "mcp", "pipelines", "logs", "config"]
  );
  assert.deepEqual(
    model.statusCards.map((card) => [card.id, card.tone]),
    [
      ["readiness", "success"],
      ["integrations", "neutral"],
      ["risk", "warning"]
    ]
  );
});

test("buildDashboardShellSummary returns readable shell overview lines", () => {
  const summary = buildDashboardShellSummary(
    createDashboardShellModel({
      title: "Ops Desk"
    })
  );

  assert.deepEqual(summary, [
    "Walkie-Talkie: Ops Desk",
    "Observe agents, integrations, pipelines, and runtime health from one place.",
    "Nav: Overview, Agents, Skills, MCP, Pipelines, Logs, Config",
    "Cards: Runtime Readiness=Foundations Ready | Connected Integrations=Telegram + AI Skeleton | Attention Needed=Live transports pending"
  ]);
});

test("buildDashboardShellMarkup renders nav items and status cards", () => {
  const markup = buildDashboardShellMarkup(createDashboardShellModel());

  assert.match(markup, /wt-sidebar__title">Control Plane/);
  assert.match(markup, /data-nav-id="overview"/);
  assert.match(markup, /data-card-id="readiness"/);
  assert.match(markup, /Operators stay close to every moving part/);
});
