import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildProductionBootstrapPlanSummary,
  createProductionBootstrapPlan
} from "../../packages/core/src/index.ts";

test("createProductionBootstrapPlan returns stable bootstrap phases and entry boundaries", () => {
  const plan = createProductionBootstrapPlan();

  assert.equal(plan.version, "1");
  assert.equal(plan.localEntryCommand, "npm run install:local");
  assert.equal(plan.steps.length, 4);
  assert.deepEqual(
    plan.steps.map((step) => step.id),
    ["preflight", "workspace-bootstrap", "cli-activation", "guided-setup"]
  );
});

test("buildProductionBootstrapPlanSummary returns readable production bootstrap lines", () => {
  const lines = buildProductionBootstrapPlanSummary();

  assert.deepEqual(lines, [
    "Production bootstrap plan version: 1",
    "Local entry: npm run install:local",
    "Hosted entry boundary: curl -fsSL <hosted-install-url> | bash",
    "Windows entry boundary: powershell -ExecutionPolicy Bypass -File .\\scripts\\install\\install.ps1",
    "- preflight: Preflight (local-script) -> dependency report, install guidance",
    "- workspace-bootstrap: Workspace Bootstrap (local-script) -> node_modules, built CLI artifacts",
    "- cli-activation: CLI Activation (local-script) -> linked walkie-talkie command",
    "- guided-setup: Guided Setup (user) -> walkie-talkie.config.json, runtime readiness summary"
  ]);
});
