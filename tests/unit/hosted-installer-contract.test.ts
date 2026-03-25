import assert from "node:assert/strict";
import { test } from "node:test";

import {
  HOSTED_INSTALLER_ARCHITECTURES,
  HOSTED_INSTALLER_CHANNELS,
  HOSTED_INSTALLER_CONTRACT_VERSION,
  HOSTED_INSTALLER_PLATFORMS,
  buildHostedInstallerContractSummary,
  createHostedInstallerReleaseAssumptions,
  createHostedInstallerReleaseManifest
} from "../../packages/core/src/index.ts";

test("hosted installer contract exports stable enums", () => {
  assert.equal(HOSTED_INSTALLER_CONTRACT_VERSION, "1");
  assert.deepEqual(HOSTED_INSTALLER_CHANNELS, ["stable", "beta", "nightly"]);
  assert.deepEqual(HOSTED_INSTALLER_PLATFORMS, ["linux", "macos", "windows"]);
  assert.deepEqual(HOSTED_INSTALLER_ARCHITECTURES, ["x64", "arm64"]);
});

test("createHostedInstallerReleaseAssumptions applies defaults", () => {
  assert.deepEqual(createHostedInstallerReleaseAssumptions(), {
    version: "1",
    repoOwner: "<github-owner>",
    repoName: "walkie-talkie",
    releaseTagPattern: "v<version>",
    defaultChannel: "stable",
    installRootEnvVar: "WALKIE_INSTALL_ROOT",
    binDirectoryName: ".walkie-talkie/bin",
    supportsOneLineScript: true,
    requiresNodePreinstalled: true,
    supportsRollback: true
  });
});

test("createHostedInstallerReleaseManifest builds stable hosted manifest shape", () => {
  assert.deepEqual(
    createHostedInstallerReleaseManifest({
      channel: "beta",
      releaseTag: "v0.2.0-beta.1",
      scriptPath: "releases/install.sh",
      windowsScriptPath: "releases/install.ps1",
      artifacts: [
        {
          platform: "linux",
          architecture: "x64",
          fileName: "walkie-talkie-linux-x64.tar.gz",
          downloadPath: "releases/v0.2.0-beta.1/walkie-talkie-linux-x64.tar.gz",
          checksumFileName: "walkie-talkie-linux-x64.sha256"
        }
      ]
    }),
    {
      version: "1",
      channel: "beta",
      releaseTag: "v0.2.0-beta.1",
      scriptPath: "releases/install.sh",
      windowsScriptPath: "releases/install.ps1",
      artifacts: [
        {
          platform: "linux",
          architecture: "x64",
          fileName: "walkie-talkie-linux-x64.tar.gz",
          downloadPath: "releases/v0.2.0-beta.1/walkie-talkie-linux-x64.tar.gz",
          checksumFileName: "walkie-talkie-linux-x64.sha256"
        }
      ]
    }
  );
});

test("buildHostedInstallerContractSummary returns readable release assumptions", () => {
  assert.deepEqual(buildHostedInstallerContractSummary(), [
    "Hosted installer contract version: 1",
    "Repository: <github-owner>/walkie-talkie",
    "Default channel: stable",
    "Release tag pattern: v<version>",
    "Install root env var: WALKIE_INSTALL_ROOT",
    "Bin directory: .walkie-talkie/bin",
    "Requires preinstalled Node: yes",
    "Supports rollback: yes",
    "Hosted shell script path: scripts/install.sh",
    "Hosted Windows script path: [planned]",
    "Artifacts declared: 0"
  ]);
});
