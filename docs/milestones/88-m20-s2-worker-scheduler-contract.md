# M20-S2: Background Worker and Scheduler Contract

## Summary

This step adds the shared contract for long-running background execution.

It does not start a real worker process yet.
Instead, it locks the shape that future schedulers, queue workers, retention cleanup jobs, retry runners, and approval flows can reuse.

## Added

- `packages/runtime/src/worker-contract.ts`
  - task kinds
  - task sources
  - queue priorities
  - worker statuses
  - task definition contract
  - queued job envelope contract
  - worker runtime config contract
  - readable worker summary helper

## Why This Matters

Several planned product features depend on the same background execution shape:

- scheduled Telegram polling
- daily design proposals
- retrying failed jobs
- trash retention cleanup
- approval follow-up notifications

This contract keeps those future implementations aligned instead of growing ad hoc.

## Scope Boundary

- no real scheduler loop yet
- no queue persistence yet
- no worker lease manager yet

Those pieces will build on top of this contract later.
