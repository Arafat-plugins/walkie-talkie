import assert from "node:assert/strict";
import { test } from "node:test";

import {
  APPROVAL_CHANNELS,
  OPERATOR_SAFETY_CONTRACT_VERSION,
  SAFETY_RISK_LEVELS,
  buildOperatorSafetySummary,
  createOperatorSafetyProfile,
  evaluateOperatorSafety
} from "../../packages/runtime/src/index.ts";

test("operator safety contract exports stable risk levels and channels", () => {
  assert.equal(OPERATOR_SAFETY_CONTRACT_VERSION, "1");
  assert.deepEqual(SAFETY_RISK_LEVELS, ["low", "medium", "high", "critical"]);
  assert.deepEqual(APPROVAL_CHANNELS, ["cli", "dashboard", "telegram"]);
});

test("createOperatorSafetyProfile applies defaults and clones policy data", () => {
  const profile = createOperatorSafetyProfile({
    budgets: {
      maxRuntimeMs: 30000,
      maxAiCallsPerRun: 3
    },
    allowlists: {
      skillIds: ["skill-1"],
      mcpServerIds: ["mcp-1"],
      integrationIds: ["telegram"],
      modelIds: ["gpt-4o-mini"],
      triggerKinds: ["telegram"]
    },
    approvals: {
      channels: ["telegram", "dashboard"],
      requireApprovalForRiskLevels: ["medium", "high", "critical"],
      requireApprovalForAutonomousAgents: true,
      defaultTimeoutMs: 600000
    }
  });

  assert.deepEqual(profile, {
    version: "1",
    budgets: {
      maxRuntimeMs: 30000,
      maxAiCallsPerRun: 3,
      maxToolCallsPerRun: undefined,
      maxBackgroundJobsPerHour: undefined
    },
    allowlists: {
      skillIds: ["skill-1"],
      mcpServerIds: ["mcp-1"],
      integrationIds: ["telegram"],
      modelIds: ["gpt-4o-mini"],
      triggerKinds: ["telegram"]
    },
    approvals: {
      requireApprovalForRiskLevels: ["medium", "high", "critical"],
      requireApprovalForAutonomousAgents: true,
      channels: ["telegram", "dashboard"],
      defaultTimeoutMs: 600000
    }
  });
});

test("evaluateOperatorSafety blocks when allowlist or budget rules are violated", () => {
  const profile = createOperatorSafetyProfile({
    budgets: {
      maxRuntimeMs: 30000,
      maxAiCallsPerRun: 2,
      maxToolCallsPerRun: 1
    },
    allowlists: {
      skillIds: ["allowed-skill"],
      integrationIds: ["telegram"],
      modelIds: ["gpt-4o-mini"]
    }
  });

  const decision = evaluateOperatorSafety(profile, {
    skillId: "blocked-skill",
    integrationId: "discord",
    modelId: "gpt-5",
    runtimeMs: 45000,
    aiCalls: 4,
    toolCalls: 2
  });

  assert.deepEqual(decision, {
    allowed: false,
    requiresApproval: false,
    approvalChannels: [],
    reasons: [
      'Skill "blocked-skill" is not in the operator allowlist.',
      'Integration "discord" is not in the operator allowlist.',
      'Model "gpt-5" is not in the operator allowlist.',
      "Runtime budget exceeded (45000ms > 30000ms).",
      "AI call budget exceeded (4 > 2).",
      "Tool call budget exceeded (2 > 1)."
    ]
  });
});

test("evaluateOperatorSafety requires approval for risky or autonomous runs when otherwise allowed", () => {
  const profile = createOperatorSafetyProfile({
    approvals: {
      channels: ["telegram"],
      requireApprovalForRiskLevels: ["high", "critical"],
      requireApprovalForAutonomousAgents: true
    }
  });

  const riskyDecision = evaluateOperatorSafety(profile, {
    riskLevel: "critical",
    autonomousAgent: false,
    modelId: "gpt-4o-mini"
  });
  const autonomousDecision = evaluateOperatorSafety(profile, {
    riskLevel: "low",
    autonomousAgent: true
  });

  assert.deepEqual(riskyDecision, {
    allowed: true,
    requiresApproval: true,
    approvalChannels: ["telegram"],
    reasons: []
  });
  assert.deepEqual(autonomousDecision, {
    allowed: true,
    requiresApproval: true,
    approvalChannels: ["telegram"],
    reasons: []
  });
});

test("buildOperatorSafetySummary returns readable safety policy lines", () => {
  const profile = createOperatorSafetyProfile({
    allowlists: {
      skillIds: ["skill-1", "skill-2"],
      mcpServerIds: ["mcp-1"],
      integrationIds: ["telegram"],
      modelIds: ["gpt-4o-mini"],
      triggerKinds: ["telegram", "schedule"]
    },
    approvals: {
      channels: ["dashboard", "telegram"],
      defaultTimeoutMs: 120000,
      requireApprovalForAutonomousAgents: true
    }
  });

  assert.deepEqual(buildOperatorSafetySummary(profile), [
    "Operator safety profile version: 1",
    "Approval channels: dashboard, telegram",
    "Approval timeout: 120000ms",
    "Require approval for autonomy: yes",
    "Skill allowlist size: 2",
    "MCP allowlist size: 1",
    "Integration allowlist size: 1",
    "Model allowlist size: 1",
    "Trigger allowlist size: 2"
  ]);
});
