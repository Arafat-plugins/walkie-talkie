# M21-S1: Hosted Installer Contract and Release Assumptions

## Summary

This step defines the hosted installer contract before adding the real shell installer.

The goal is to prevent the later `install.sh` step from hardcoding assumptions without a shared release shape.

## Added

- `packages/core/src/hosted-installer-contract.ts`
  - installer channels
  - supported platforms
  - supported architectures
  - release assumptions contract
  - release manifest contract
  - readable contract summary
- `scripts/install/hosted-installer-contract.ts`
  - boundary check script

## Package Scripts

- `npm run install:hosted:plan`
- `npm run install:hosted:check`

## Scope Boundary

This step does **not** download anything.

It only defines:

- what a hosted installer release assumes
- what a hosted release manifest should contain
- what today is still pending

## Why This Matters

The next steps can now safely build:

- Linux/macOS `install.sh`
- Windows installer boundary
- release build linking strategy

without redefining release metadata from scratch.
