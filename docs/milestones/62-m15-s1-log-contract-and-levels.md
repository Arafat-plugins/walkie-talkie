# M15-S1: Log Contract and Levels

## Goal

Reliability layer-এর জন্য shared logging contract define করা, যাতে later runtime, dashboard, retry, আর audit work একি level model use করতে পারে।

## Changed Files

- `packages/logging/src/log-contract.ts`
- `packages/logging/src/index.ts`
- `tests/unit/log-contract.test.ts`

## What Was Added

### `packages/logging/src/log-contract.ts`

Purpose:
- platform-wide logging shape standardize করা
- log severity ordering define করা
- minimal logger boundary provide করা

Main types:
- `LogLevel`
- `LogContext`
- `LogEntry`
- `Logger`

Function-by-Function Why:
- `createLogEntry(input)`
  - consistent timestamped log object বানায়
  - optional context clone করে caller mutation leak কমায়
- `isLogLevelEnabled(activeLevel, candidateLevel)`
  - configured threshold-এর নিচের logs skip করা যাবে কিনা সেটা decide করার base helper
  - later console/file logger implementations এই ordering reuse করতে পারবে
- `createNoopLogger()`
  - logger optional থাকা code path-এ safe default দেয়
  - test, bootstrap, or placeholder wiring-এ useful

Current standardized levels:
- `debug`
- `info`
- `warning`
- `error`

### `packages/logging/src/index.ts`

Purpose:
- logging contract APIs package root-এ expose করা

### `tests/unit/log-contract.test.ts`

Purpose:
- level ordering verify করা
- log entry shape verify করা
- threshold helper verify করা
- noop logger safety verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/log-contract.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `1` test file passed
- root typecheck clean

## Next Safe Step

`M15-S2`: failure report objects add করা।
