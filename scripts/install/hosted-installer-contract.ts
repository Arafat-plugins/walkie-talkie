import {
  buildHostedInstallerContractSummary,
  createHostedInstallerReleaseAssumptions,
  createHostedInstallerReleaseManifest
} from "../../packages/core/src/index.ts";

export function runHostedInstallerContractCheck(args: string[]): { ok: true; lines: string[] } {
  const assumptions = createHostedInstallerReleaseAssumptions();
  const manifest = createHostedInstallerReleaseManifest({
    releaseTag: assumptions.releaseTagPattern
  });

  const lines = [
    ...buildHostedInstallerContractSummary({
      assumptions,
      manifest
    }),
    "Boundary status: contract-only",
    "No hosted installer script is downloaded in this step.",
    "Linux/macOS install.sh implementation remains planned under M21-S2.",
    "Windows installer boundary remains planned under M21-S3."
  ];

  if (args.includes("--check")) {
    lines.push("Check mode: hosted installer assumptions and manifest shape are defined.");
  }

  return {
    ok: true,
    lines
  };
}

const invokedScriptPath = process.argv[1]?.replaceAll("\\", "/");

if (invokedScriptPath?.endsWith("/scripts/install/hosted-installer-contract.ts")) {
  const result = runHostedInstallerContractCheck(process.argv.slice(2));
  for (const line of result.lines) {
    console.log(line);
  }
}
