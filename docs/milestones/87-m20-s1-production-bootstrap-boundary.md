# M20-S1: Production Bootstrap Boundary

## Summary

This step defines the production install/bootstrap boundary without prematurely turning the current install flow into a hosted installer.

## Added

- `packages/core/src/production-bootstrap-plan.ts`
  - stable production bootstrap plan contract
  - readable summary builder
- `scripts/install/production-bootstrap.ts`
  - local boundary script for plan/check output
- package scripts:
  - `npm run install:production:plan`
  - `npm run install:production:check`

## Why This Step Exists

The project already has a working local install flow:

- `npm run install:local`

But productization work needs a clear line between:

1. today's supported local install path
2. tomorrow's hosted release installer
3. future Windows installer path

This step adds that line explicitly.

## Boundaries

- No hosted download is performed yet
- No release bundle is fetched yet
- No one-line installer is claimed as supported yet

That hosted/distribution work remains intentionally deferred to `M21`.

## Verification

- unit coverage for the bootstrap plan contract
- integration coverage for package-script and boundary-script wiring
- manual check command output verified through `npm run install:production:check`
