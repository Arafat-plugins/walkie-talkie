# M13-S1: Trigger to Pipeline to Agent and Skill

## Goal

Walkie-Talkie core pieces firstবার একসাথে connect করা: trigger event -> pipeline -> agent -> skill -> response path।

## Changed Files

- `packages/runtime/src/orchestration.ts`
- `packages/runtime/src/index.ts`
- `tests/integration/trigger-pipeline-agent-skill.integration.test.ts`

## What Was Added

### `packages/runtime/src/orchestration.ts`

Purpose:
- trigger event, pipeline, agent registry, skill registry glue করে minimal orchestration path run করা

Main types:
- `RuntimeOrchestrationInput`
- `RuntimeSkillExecutionRecord`
- `RuntimeOrchestrationSuccess`
- `RuntimeOrchestrationFailure`
- `RuntimeOrchestrationResult`

Function-by-Function Why:
- `buildRunId(pipelineId, occurredAt)`
  - deterministic run identifier বানায়
- `failWithReport(report, nodeId, error, now)`
  - failed step report path এক জায়গায় centralize করে
- `executePipelineStep(input)`
  - single sequential pipeline step handle করে
  - current supported node types:
    - `trigger`
    - `agent`
    - `skill`
    - `response`
  - agent node হলে:
    - `config.refId` দিয়ে agent resolve করে
    - trigger binding match verify করে
  - skill node হলে:
    - `config.refId` দিয়ে skill resolve করে
    - handler execute করে
    - output capture করে
- `executeTriggerPipeline(input)`
  - sequential path resolve করে
  - execution report build করে
  - step-by-step orchestration চালায়
  - success/failure final result return করে

Current boundary:
- only sequential pipeline supported
- branch execution selection এখনো নেই
- AI provider call এখনো orchestration-এর মধ্যে wired না
- MCP execution এখনো wired না

### `packages/runtime/src/index.ts`

Purpose:
- orchestration helper runtime package API-তে expose করা

### `tests/integration/trigger-pipeline-agent-skill.integration.test.ts`

Purpose:
- first real end-to-end orchestration slice verify করা

Covered scenarios:
- success path:
  - trigger event
  - agent lookup
  - trigger binding match
  - skill execution
  - final success report
- failure path:
  - trigger binding mismatch
  - failed report + blocked later step

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/integration/trigger-pipeline-agent-skill.integration.test.ts tests/integration/pipeline-engine-smoke.test.ts
npx tsc -p tsconfig.json --noEmit
```

Result:
- `2` integration test files passed
- typecheck clean

## Next Safe Step

`M13-S2`: config-driven flow binding add করা।
