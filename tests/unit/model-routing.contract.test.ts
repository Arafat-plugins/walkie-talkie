import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ESCALATION_POLICIES,
  MODEL_ROUTING_MODES,
  MODEL_TIERS,
  createDefaultModelRoutingPolicy
} from "../../packages/core/src/index.ts";

test("model routing contract exports stable enum-like values", () => {
  assert.deepEqual(MODEL_ROUTING_MODES, ["tool-first", "cheap-first", "premium-always"]);
  assert.deepEqual(MODEL_TIERS, ["none", "small", "standard", "premium"]);
  assert.deepEqual(ESCALATION_POLICIES, [
    "never",
    "on-low-confidence",
    "on-failure",
    "manual-only"
  ]);
});

test("createDefaultModelRoutingPolicy returns cost-control oriented defaults", () => {
  assert.deepEqual(createDefaultModelRoutingPolicy(), {
    mode: "tool-first",
    defaultTier: "small",
    escalationPolicy: "on-low-confidence",
    allowToolBypass: true,
    dailyPremiumBudget: 20
  });
});
