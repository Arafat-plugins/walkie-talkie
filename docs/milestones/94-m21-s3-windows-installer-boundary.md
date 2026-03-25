# M21-S3: Windows Installer Boundary

## What changed

- added `scripts/install.ps1`
- added package scripts:
  - `install:hosted:windows:plan`
  - `install:hosted:windows:check`
- added integration coverage for the PowerShell boundary wiring

## Why this step exists

`M21-S2` added the Linux/macOS shell boundary, but the hosted installer story would still be incomplete without an explicit Windows path.

This step adds a PowerShell boundary so later release work can evolve a real Windows bootstrap flow from a stable contract instead of inventing one ad hoc.

## Current behavior

The PowerShell script currently:

- identifies the target platform as Windows
- detects `x64` and `arm64`
- exposes `-Check` and `-PrintPlan` modes
- checks whether the user is already inside a repository checkout
- if a repo checkout exists:
  - runs `npm install`
  - runs `npm run install:local`
- if a repo checkout does not exist:
  - exits with hosted-download guidance instead of pretending remote download already exists

## Safety boundary

This is still intentionally a boundary step:

- no hosted release artifact download
- no registry installer
- no MSI/exe packaging
- no automatic global release install yet

Those remain later `M21` work.

## Verification

Verified with:

```bash
node --test --experimental-strip-types tests/integration/install-shell-boundary.integration.test.ts tests/integration/install-powershell-boundary.integration.test.ts tests/integration/hosted-installer-boundary.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

Note:

- `pwsh` was not required for this verification pass
- current tests validate file presence, script wiring, and documented behavior
