import assert from "node:assert/strict";
import { test } from "node:test";

import type { DependencyCheckSummary } from "../../packages/core/src/dependency-checker.contract.ts";
import { buildDependencyGuidance } from "../../packages/core/src/dependency-guidance.ts";

test("buildDependencyGuidance maps health states to actionable messages", () => {
  const summary: DependencyCheckSummary = {
    hasBlockingIssue: true,
    results: [
      { name: "node", health: "missing" },
      {
        name: "npm",
        health: "unsupported_version",
        detectedVersion: "9.0.0",
        message: "Requires >= 10.0.0, found 9.0.0."
      },
      { name: "node", health: "error", message: "Command failed." }
    ]
  };

  const guidance = buildDependencyGuidance(summary);

  assert.equal(guidance.length, 3);
  assert.equal(guidance[0].severity, "error");
  assert.ok(guidance[0].message.includes("node is missing"));
  assert.equal(guidance[1].severity, "error");
  assert.ok(guidance[1].message.includes("unsupported"));
  assert.equal(guidance[2].severity, "error");
  assert.ok(guidance[2].message.includes("Could not verify"));
});

test("buildDependencyGuidance returns info message for healthy dependency", () => {
  const summary: DependencyCheckSummary = {
    hasBlockingIssue: false,
    results: [{ name: "npm", health: "ok", detectedVersion: "11.8.0" }]
  };

  const guidance = buildDependencyGuidance(summary);

  assert.equal(guidance.length, 1);
  assert.equal(guidance[0].severity, "info");
  assert.equal(guidance[0].message, "npm is ready (v11.8.0).");
});

