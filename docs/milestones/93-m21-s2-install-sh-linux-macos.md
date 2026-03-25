# M21-S2: Linux/macOS `install.sh` Bootstrap Boundary

## What changed

- added `scripts/install.sh`
- added package scripts:
  - `install:hosted:shell:plan`
  - `install:hosted:shell:check`
- added integration coverage for the shell boundary wiring

## Why this step exists

`M21-S1` defined the hosted installer contract, but there was still no Linux/macOS shell entrypoint that matched the eventual one-line install direction.

This step adds the first real `install.sh` boundary so future hosted distribution work has a concrete shell bootstrap surface to evolve instead of starting from a blank file later.

## Current behavior

The shell script currently:

- detects Linux/macOS platform support
- detects `x64` and `arm64`
- verifies `node` and `npm`
- checks whether the user is already inside a repository checkout
- if a repo checkout exists:
  - runs `npm install`
  - runs `npm run install:local`
- if a repo checkout does not exist:
  - exits with hosted-download guidance instead of pretending remote download is already implemented

## Safety boundary

This is still intentionally a boundary step, not the full hosted installer:

- no remote repository download
- no release manifest fetch
- no Windows handling in this script
- no global release artifact install yet

That work remains in later `M21` steps.

## Verification

Verified with:

```bash
node --test --experimental-strip-types tests/integration/install-shell-boundary.integration.test.ts tests/integration/hosted-installer-boundary.integration.test.ts
npx tsc -p tsconfig.json --noEmit
bash scripts/install.sh --check
npm run install:hosted:shell:check
```
