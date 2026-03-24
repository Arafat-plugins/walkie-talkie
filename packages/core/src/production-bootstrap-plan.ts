export const PRODUCTION_BOOTSTRAP_PLAN_VERSION = "1" as const;

export const PRODUCTION_BOOTSTRAP_PHASES = [
  "preflight",
  "workspace-bootstrap",
  "cli-activation",
  "guided-setup"
] as const;

export type ProductionBootstrapPhase = (typeof PRODUCTION_BOOTSTRAP_PHASES)[number];

export type ProductionBootstrapStep = {
  id: ProductionBootstrapPhase;
  title: string;
  description: string;
  automatedBy: "local-script" | "hosted-installer" | "user";
  outputs: string[];
};

export type ProductionBootstrapPlan = {
  version: typeof PRODUCTION_BOOTSTRAP_PLAN_VERSION;
  localEntryCommand: string;
  hostedEntryCommand: string;
  windowsEntryCommand: string;
  steps: ProductionBootstrapStep[];
};

export function createProductionBootstrapPlan(): ProductionBootstrapPlan {
  return {
    version: PRODUCTION_BOOTSTRAP_PLAN_VERSION,
    localEntryCommand: "npm run install:local",
    hostedEntryCommand: "curl -fsSL <hosted-install-url> | bash",
    windowsEntryCommand: "powershell -ExecutionPolicy Bypass -File .\\scripts\\install\\install.ps1",
    steps: [
      {
        id: "preflight",
        title: "Preflight",
        description: "Verify Node.js, npm, writable paths, and runtime prerequisites before bootstrap.",
        automatedBy: "local-script",
        outputs: ["dependency report", "install guidance"]
      },
      {
        id: "workspace-bootstrap",
        title: "Workspace Bootstrap",
        description: "Install workspace dependencies and prepare generated build artifacts.",
        automatedBy: "local-script",
        outputs: ["node_modules", "built CLI artifacts"]
      },
      {
        id: "cli-activation",
        title: "CLI Activation",
        description: "Expose the walkie-talkie command for local use and later global release flows.",
        automatedBy: "local-script",
        outputs: ["linked walkie-talkie command"]
      },
      {
        id: "guided-setup",
        title: "Guided Setup",
        description: "Run minimal onboarding now, while live integrations stay in separate setup flows.",
        automatedBy: "user",
        outputs: ["walkie-talkie.config.json", "runtime readiness summary"]
      }
    ]
  };
}

export function buildProductionBootstrapPlanSummary(plan = createProductionBootstrapPlan()): string[] {
  return [
    `Production bootstrap plan version: ${plan.version}`,
    `Local entry: ${plan.localEntryCommand}`,
    `Hosted entry boundary: ${plan.hostedEntryCommand}`,
    `Windows entry boundary: ${plan.windowsEntryCommand}`,
    ...plan.steps.map(
      (step) =>
        `- ${step.id}: ${step.title} (${step.automatedBy}) -> ${step.outputs.join(", ")}`
    )
  ];
}
