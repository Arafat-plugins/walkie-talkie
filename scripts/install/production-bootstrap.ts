import { buildProductionBootstrapPlanSummary, createProductionBootstrapPlan } from "../../packages/core/src/index.ts";

function buildBoundaryNotes(): string[] {
  return [
    "Boundary status: scaffold-only",
    "This script does not download release bundles yet.",
    "Hosted one-line install remains planned under milestone M21.",
    "Use the local entry command today for the supported install path."
  ];
}

export function runProductionBootstrapBoundary(args: string[]): { ok: true; lines: string[] } {
  const plan = createProductionBootstrapPlan();
  const lines = [
    ...buildProductionBootstrapPlanSummary(plan),
    ...buildBoundaryNotes()
  ];

  if (args.includes("--check")) {
    lines.push("Check mode: boundary is present and ready for future hosted installer wiring.");
  }

  return {
    ok: true,
    lines
  };
}

const invokedScriptPath = process.argv[1]?.replaceAll("\\", "/");

if (invokedScriptPath?.endsWith("/scripts/install/production-bootstrap.ts")) {
  const result = runProductionBootstrapBoundary(process.argv.slice(2));
  for (const line of result.lines) {
    console.log(line);
  }
}
