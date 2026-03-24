# M6-S1: Runtime Bootstrap Entry

## Goal

`packages/runtime`-এ minimal bootstrap entry তৈরি করা, যাতে runtime start-এর আগে config file resolve করে load করা যায় এবং caller typed success/failure result পায়।

## Changed Files

- `packages/runtime/src/bootstrap.ts`
- `packages/runtime/src/index.ts`
- `tests/unit/runtime-bootstrap.test.ts`

## What Was Added

### `packages/runtime/src/bootstrap.ts`

Purpose:
- runtime package-এর first public entrypoint দেওয়া
- config path resolve + validated config load একসাথে করা

Function-by-Function Why:
- `bootstrapRuntime(baseDirectory, fileName?)`
  - runtime boot-এর starting function
  - config path determine করে
  - config package-এর `loadConfigFile()` call করে
  - caller-কে clean union result দেয়:
    - success: config ready
    - failure: issue list ready

Types:
- `RuntimeBootstrapSuccess`
  - successful runtime bootstrap-এর return shape
- `RuntimeBootstrapFailure`
  - failed bootstrap-এর return shape
- `RuntimeBootstrapResult`
  - caller safe branching করতে পারে `ok` check দিয়ে

### `packages/runtime/src/index.ts`

Purpose:
- runtime package public API expose করা

### `tests/unit/runtime-bootstrap.test.ts`

Purpose:
- valid config file থাকলে bootstrap success হয় কিনা
- missing config file থাকলে bootstrap failure issue দেয় কিনা

## Call Flow

Runtime start
-> `bootstrapRuntime(baseDirectory)`
-> `resolveConfigPath(baseDirectory)`
-> `loadConfigFile(configPath)`
-> success config or issue list

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/runtime-bootstrap.test.ts tests/unit/config-parser.test.ts tests/unit/config-store.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Scope Boundary

This step does not yet:
- verify required runtime fields beyond config validation
- print readiness summary
- start any agent/pipeline process

Those come in:
- `M6-S2`
- `M6-S3`

## Next Safe Step

`M6-S2`: required config readiness checks add করা।
