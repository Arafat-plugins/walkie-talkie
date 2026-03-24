# M15-S4: Audit Event Model and Storage Interface

## Goal

Reliability layer complete করার জন্য shared audit event object and storage boundary define করা, যাতে later runtime, dashboard, and compliance-style history capture consistent shape use করতে পারে।

## Changed Files

- `packages/logging/src/audit-event.ts`
- `packages/logging/src/index.ts`
- `tests/unit/audit-event.test.ts`

## What Was Added

### `packages/logging/src/audit-event.ts`

Purpose:
- audit trail-এর structured event shape define করা
- actor/target metadata standardize করা
- storage interface define করা

Main constants and types:
- `AUDIT_EVENT_ACTOR_TYPES`
- `AUDIT_EVENT_OUTCOMES`
- `AuditEventActor`
- `AuditEventTarget`
- `AuditEvent`
- `AuditEventStoreFilter`
- `AuditEventStore`

Function-by-Function Why:
- `createAuditEvent(input)`
  - normalized audit event object বানায়
  - default outcome `success` apply করে
  - actor/target/metadata clone করে mutation leak কমায়
- `buildAuditEventSummary(event)`
  - readable audit lines দেয়
  - later CLI/debug/dashboard previews-এ useful
- `createNoopAuditEventStore()`
  - storage optional থাকা code path-এ safe default দেয়
  - placeholder wiring/tests-এ useful

Important boundary:
- এই step persistent audit storage implement করে না
- শুধু shared event model + storage interface define করে

### `packages/logging/src/index.ts`

Purpose:
- audit event APIs logging package root-এ expose করা

### `tests/unit/audit-event.test.ts`

Purpose:
- normalized audit object verify করা
- readable summary verify করা
- noop store safety verify করা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/log-contract.test.ts tests/unit/failure-report.test.ts tests/unit/retry-policy.test.ts tests/unit/audit-event.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `4` test files passed
- root typecheck clean

## Next Safe Step

Current milestone roadmap complete.  
If new work starts, add a new milestone or post-M15 patch step first.
