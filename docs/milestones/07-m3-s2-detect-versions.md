# M3-S2: Detect Node.js and npm Versions

## Goal

`packages/core` e real dependency detection logic add kora, jate Node.js/npm presence and versions check kora jay.

## Changed Files

- `packages/core/src/dependency-checker.ts`
- `packages/core/src/index.ts`

## Function-by-Function Why

### `normalizeVersion(raw)`

Why:
- `v24.13.1` er moto output ke clean semantic form e ante.

### `parseVersion(version)`

Why:
- Version comparison er age numeric tuple e normalize korte.

### `isVersionSupported(detected, min)`

Why:
- Minimum version gate enforce korte.

### `detectDependencyVersion(name)`

Why:
- System command execute kore raw detected version anar single point.
- Empty output fallback (npm package.json path) support kore.

### `SystemDependencyChecker.check(requirements)`

Why:
- Multiple requirement ek shathe evaluate kore summary return kore.

### `SystemDependencyChecker.checkOne(requirement)`

Why:
- Per dependency result standardize kore (`ok`, `missing`, `unsupported_version`, `error`).

## Verification Run

Executed:
- `node --experimental-strip-types --input-type=module -e "...SystemDependencyChecker..."`

Observed summary:
- node: `ok` (24.13.1)
- npm: `ok` (11.8.0)
- `hasBlockingIssue: false`

## Out of Scope

- User-facing failure guidance text strategy (M3-S3)
- CLI install flow wiring (M3-S4)
- Automated tests (M3-S5)

