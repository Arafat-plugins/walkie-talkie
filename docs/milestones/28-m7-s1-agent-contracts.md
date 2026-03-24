# M7-S1: Agent Contracts

## Goal

Agent registry শুরু করার আগে agent object-এর stable contract define করা।

## Changed Files

- `packages/agents/src/agent-contract.ts`
- `packages/agents/src/index.ts`
- `tests/unit/agent-contracts.test.ts`

## What Was Added

### `packages/agents/src/agent-contract.ts`

Purpose:
- future agent registry, dashboard, pipeline binding, এবং runtime execution-এর জন্য same agent shape provide করা

Constants:
- `AGENT_CONTRACT_VERSION`
- `AGENT_TRIGGER_KINDS`
- `AGENT_EXECUTION_MODES`
- `AGENT_STATUSES`

Why these constants exist:
- allowed values explicit করে
- registry/UI/tests later same source-of-truth use করতে পারবে

Main types:
- `AgentTriggerKind`
  - agent কোন ধরনের trigger থেকে run হতে পারে
- `AgentExecutionMode`
  - manual / assisted / autonomous behavior
- `AgentStatus`
  - active / paused / disabled lifecycle state
- `AgentModelConfig`
  - provider/model info
- `AgentTriggerBinding`
  - trigger metadata
- `AgentSkillBinding`
  - linked skills
- `AgentDefinition`
  - canonical stored agent shape
- `AgentDefinitionInput`
  - creation-time input shape

Function-by-Function Why:
- `createAgentDefinition(input)`
  - agent create path-এ defaults apply করে
  - array/object clone করে caller mutation leak হওয়া কমায়
  - version/status/executionMode normalize করে

### `packages/agents/src/index.ts`

Purpose:
- agents package public API expose করা

### `tests/unit/agent-contracts.test.ts`

Purpose:
- contract constants stable আছে কিনা
- `createAgentDefinition()` defaults apply করে কিনা
- cloned arrays later mutation থেকে safe কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/agent-contracts.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- test pass
- typecheck clean

## Next Safe Step

`M7-S2`: in-memory agent registry implement করা।
