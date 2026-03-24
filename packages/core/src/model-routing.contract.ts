export const MODEL_ROUTING_MODES = ["tool-first", "cheap-first", "premium-always"] as const;

export const MODEL_TIERS = ["none", "small", "standard", "premium"] as const;

export const ESCALATION_POLICIES = [
  "never",
  "on-low-confidence",
  "on-failure",
  "manual-only"
] as const;

export type ModelRoutingMode = (typeof MODEL_ROUTING_MODES)[number];
export type ModelTier = (typeof MODEL_TIERS)[number];
export type EscalationPolicy = (typeof ESCALATION_POLICIES)[number];

export type ModelRoutingPolicy = {
  mode: ModelRoutingMode;
  defaultTier: ModelTier;
  escalationPolicy: EscalationPolicy;
  allowToolBypass: boolean;
  dailyPremiumBudget?: number;
};

export type RoutingDecision =
  | {
      path: "tool";
      reason: string;
    }
  | {
      path: "model";
      tier: Exclude<ModelTier, "none">;
      reason: string;
    };

export function createDefaultModelRoutingPolicy(): ModelRoutingPolicy {
  return {
    mode: "tool-first",
    defaultTier: "small",
    escalationPolicy: "on-low-confidence",
    allowToolBypass: true,
    dailyPremiumBudget: 20
  };
}
