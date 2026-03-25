# Usage:
# - pwsh -File scripts/install.ps1 -Check
# - pwsh -File scripts/install.ps1 -PrintPlan
param(
  [switch]$Check,
  [switch]$PrintPlan
)

$InstallRoot = if ($env:WALKIE_INSTALL_ROOT) { $env:WALKIE_INSTALL_ROOT } else { Join-Path $HOME ".walkie-talkie" }
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Get-PlatformName {
  return "windows"
}

function Get-ArchitectureName {
  switch ($env:PROCESSOR_ARCHITECTURE) {
    "AMD64" { return "x64" }
    "ARM64" { return "arm64" }
    default { return "unsupported" }
  }
}

function Write-Summary {
  Write-Output "Walkie-Talkie install.ps1 boundary"
  Write-Output "Platform: $(Get-PlatformName)"
  Write-Output "Architecture: $(Get-ArchitectureName)"
  Write-Output "Install root: $InstallRoot"
  Write-Output "Repo root: $ProjectRoot"
}

function Write-Plan {
  Write-Output "Planned bootstrap steps:"
  Write-Output "1. verify Windows support"
  Write-Output "2. verify node and npm availability"
  Write-Output "3. detect whether a repo checkout is present"
  Write-Output "4. if repo exists: run npm install"
  Write-Output "5. if repo exists: run npm run install:local"
  Write-Output "6. if repo does not exist: exit with hosted-download-not-yet-wired guidance"
}

function Test-RepoCheckout {
  $packageJsonPath = Join-Path $ProjectRoot "package.json"

  if (-not (Test-Path $packageJsonPath)) {
    return $false
  }

  $content = Get-Content $packageJsonPath -Raw
  return $content -match '"name": "walkie-talkie-workspace"'
}

function Write-HostedBoundaryMessage {
  Write-Output "Hosted download/bootstrap is not wired yet in this step."
  Write-Output "Current supported path:"
  Write-Output "1. clone the repository"
  Write-Output "2. cd into walkie-talkie"
  Write-Output "3. run: npm run install:local"
  Write-Output ""
  Write-Output "The hosted release download path will be completed in later M21 steps."
}

function Invoke-RepoBootstrap {
  Write-Output "Repo checkout detected at $ProjectRoot"
  Write-Output "Running npm install..."
  Push-Location $ProjectRoot
  npm install
  Write-Output "Running local install flow..."
  npm run install:local
  Pop-Location
  Write-Output "Walkie-Talkie bootstrap completed."
}

if ($Check) {
  Write-Summary
  Write-Output "Check mode: install.ps1 boundary is present."
  exit 0
}

if ($PrintPlan) {
  Write-Summary
  Write-Plan
  exit 0
}

if ((Get-ArchitectureName) -eq "unsupported") {
  Write-Error "install.ps1 currently supports x64 and arm64 only."
  exit 1
}

Write-Summary

if (Test-RepoCheckout) {
  Invoke-RepoBootstrap
  exit 0
}

Write-HostedBoundaryMessage
exit 1
