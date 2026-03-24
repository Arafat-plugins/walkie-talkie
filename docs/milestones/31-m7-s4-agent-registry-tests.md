# M7-S4: Agent Registry Tests

## Goal

Agent registry API-এর safety behavior stronger test coverage দিয়ে lock করা, then `M7` close করা।

## Changed Files

- `tests/unit/agent-registry.test.ts`

## What Was Added

Additional coverage:
- `create()` returned object mutate করলে registry state change না হয়
- `list()` returned array/object mutate করলে registry state change না হয়

Why this matters:
- registry callers later হতে পারে:
  - CLI commands
  - dashboard UI
  - orchestration layer
- এরা returned object accidentally mutate করলে stored state corrupt হওয়া চলবে না

This step confirms:
- duplicate protection works
- create/list/get APIs work
- registry snapshots are defensive copies

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/agent-contracts.test.ts tests/unit/agent-registry.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## M7 Outcome

After `M7`, agent core now has:
- agent contracts
- normalized creation helper
- in-memory registry storage
- public create/list/get APIs
- defensive test coverage

This is enough to start `M8` skill registry work.

## Next Safe Step

`M8-S1`: skill contracts define করা।
