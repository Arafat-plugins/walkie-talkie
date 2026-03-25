export const HOSTED_INSTALLER_CONTRACT_VERSION = "1" as const;

export const HOSTED_INSTALLER_CHANNELS = ["stable", "beta", "nightly"] as const;
export const HOSTED_INSTALLER_PLATFORMS = ["linux", "macos", "windows"] as const;
export const HOSTED_INSTALLER_ARCHITECTURES = ["x64", "arm64"] as const;

export type HostedInstallerChannel = (typeof HOSTED_INSTALLER_CHANNELS)[number];
export type HostedInstallerPlatform = (typeof HOSTED_INSTALLER_PLATFORMS)[number];
export type HostedInstallerArchitecture = (typeof HOSTED_INSTALLER_ARCHITECTURES)[number];

export type HostedInstallerReleaseAssumptions = {
  version: typeof HOSTED_INSTALLER_CONTRACT_VERSION;
  repoOwner: string;
  repoName: string;
  releaseTagPattern: string;
  defaultChannel: HostedInstallerChannel;
  installRootEnvVar: string;
  binDirectoryName: string;
  supportsOneLineScript: boolean;
  requiresNodePreinstalled: boolean;
  supportsRollback: boolean;
};

export type HostedInstallerArtifact = {
  platform: HostedInstallerPlatform;
  architecture: HostedInstallerArchitecture;
  fileName: string;
  downloadPath: string;
  checksumFileName?: string;
};

export type HostedInstallerReleaseManifest = {
  version: typeof HOSTED_INSTALLER_CONTRACT_VERSION;
  channel: HostedInstallerChannel;
  releaseTag: string;
  scriptPath: string;
  windowsScriptPath?: string;
  artifacts: HostedInstallerArtifact[];
};

export function createHostedInstallerReleaseAssumptions(input?: {
  repoOwner?: string;
  repoName?: string;
  releaseTagPattern?: string;
  defaultChannel?: HostedInstallerChannel;
  installRootEnvVar?: string;
  binDirectoryName?: string;
  supportsOneLineScript?: boolean;
  requiresNodePreinstalled?: boolean;
  supportsRollback?: boolean;
}): HostedInstallerReleaseAssumptions {
  return {
    version: HOSTED_INSTALLER_CONTRACT_VERSION,
    repoOwner: input?.repoOwner ?? "<github-owner>",
    repoName: input?.repoName ?? "walkie-talkie",
    releaseTagPattern: input?.releaseTagPattern ?? "v<version>",
    defaultChannel: input?.defaultChannel ?? "stable",
    installRootEnvVar: input?.installRootEnvVar ?? "WALKIE_INSTALL_ROOT",
    binDirectoryName: input?.binDirectoryName ?? ".walkie-talkie/bin",
    supportsOneLineScript: input?.supportsOneLineScript ?? true,
    requiresNodePreinstalled: input?.requiresNodePreinstalled ?? true,
    supportsRollback: input?.supportsRollback ?? true
  };
}

export function createHostedInstallerReleaseManifest(input: {
  channel?: HostedInstallerChannel;
  releaseTag: string;
  scriptPath?: string;
  windowsScriptPath?: string;
  artifacts?: HostedInstallerArtifact[];
}): HostedInstallerReleaseManifest {
  return {
    version: HOSTED_INSTALLER_CONTRACT_VERSION,
    channel: input.channel ?? "stable",
    releaseTag: input.releaseTag,
    scriptPath: input.scriptPath ?? "scripts/install.sh",
    windowsScriptPath: input.windowsScriptPath,
    artifacts: (input.artifacts ?? []).map((artifact) => ({
      ...artifact
    }))
  };
}

export function buildHostedInstallerContractSummary(input?: {
  assumptions?: HostedInstallerReleaseAssumptions;
  manifest?: HostedInstallerReleaseManifest;
}): string[] {
  const assumptions = input?.assumptions ?? createHostedInstallerReleaseAssumptions();
  const manifest =
    input?.manifest ??
    createHostedInstallerReleaseManifest({
      releaseTag: assumptions.releaseTagPattern
    });

  return [
    `Hosted installer contract version: ${assumptions.version}`,
    `Repository: ${assumptions.repoOwner}/${assumptions.repoName}`,
    `Default channel: ${assumptions.defaultChannel}`,
    `Release tag pattern: ${assumptions.releaseTagPattern}`,
    `Install root env var: ${assumptions.installRootEnvVar}`,
    `Bin directory: ${assumptions.binDirectoryName}`,
    `Requires preinstalled Node: ${assumptions.requiresNodePreinstalled ? "yes" : "no"}`,
    `Supports rollback: ${assumptions.supportsRollback ? "yes" : "no"}`,
    `Hosted shell script path: ${manifest.scriptPath}`,
    `Hosted Windows script path: ${manifest.windowsScriptPath ?? "[planned]"}`,
    `Artifacts declared: ${manifest.artifacts.length}`
  ];
}
