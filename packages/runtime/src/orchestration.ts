import type { AgentDefinition } from "../../agents/src/index.ts";
import { AgentRegistryStore } from "../../agents/src/index.ts";
import type { TriggerEvent } from "../../core/src/index.ts";
import {
  createPipelineExecutionReport,
  createPipelineResolutionFailureReport,
  markPipelineExecutionCompleted,
  markPipelineExecutionFailed,
  markPipelineExecutionStepCompleted,
  resolveSequentialExecutionPath,
  type PipelineDefinition,
  type PipelineExecutionReport,
  type SequentialPipelineStep
} from "../../pipeline/src/index.ts";
import { SkillRegistryStore, type SkillExecutionResult } from "../../skills/src/index.ts";

type TimestampFactory = () => string;

export type RuntimeOrchestrationInput = {
  trigger: TriggerEvent;
  pipeline: PipelineDefinition;
  agentRegistry: AgentRegistryStore;
  skillRegistry: SkillRegistryStore;
  now?: TimestampFactory;
};

export type RuntimeSkillExecutionRecord = {
  skillId: string;
  result: SkillExecutionResult;
};

export type RuntimeOrchestrationSuccess = {
  ok: true;
  report: PipelineExecutionReport;
  agent?: AgentDefinition;
  skillExecutions: RuntimeSkillExecutionRecord[];
  finalOutput?: unknown;
};

export type RuntimeOrchestrationFailure = {
  ok: false;
  report: PipelineExecutionReport;
  error: string;
};

export type RuntimeOrchestrationResult = RuntimeOrchestrationSuccess | RuntimeOrchestrationFailure;

function buildRunId(pipelineId: string, occurredAt: string): string {
  return `${pipelineId}:${occurredAt}`;
}

function failWithReport(
  report: PipelineExecutionReport,
  nodeId: string,
  error: string,
  now: TimestampFactory
): RuntimeOrchestrationFailure {
  return {
    ok: false,
    error,
    report: markPipelineExecutionFailed(report, nodeId, error, now)
  };
}

async function executePipelineStep(input: {
  step: SequentialPipelineStep;
  trigger: TriggerEvent;
  pipeline: PipelineDefinition;
  agentRegistry: AgentRegistryStore;
  skillRegistry: SkillRegistryStore;
  activeAgent?: AgentDefinition;
  lastOutput?: unknown;
  skillExecutions: RuntimeSkillExecutionRecord[];
}): Promise<
  | {
      ok: true;
      activeAgent?: AgentDefinition;
      lastOutput?: unknown;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const { step, trigger, pipeline, agentRegistry, skillRegistry, activeAgent, lastOutput, skillExecutions } = input;

  if (step.node.type === "trigger" || step.node.type === "response") {
    return {
      ok: true,
      activeAgent,
      lastOutput
    };
  }

  if (step.node.type === "agent") {
    const agentId = step.node.config?.refId;

    if (!agentId) {
      return {
        ok: false,
        error: `Pipeline agent node "${step.node.id}" is missing config.refId.`
      };
    }

    const agent = agentRegistry.get(agentId);

    if (!agent) {
      return {
        ok: false,
        error: `Agent "${agentId}" was not found in the registry.`
      };
    }

    const hasMatchingTrigger = agent.triggers.some(
      (binding) => binding.kind === trigger.kind && (!binding.event || binding.event === trigger.eventName)
    );

    if (!hasMatchingTrigger) {
      return {
        ok: false,
        error: `Agent "${agentId}" is not bound to trigger "${trigger.eventName}".`
      };
    }

    return {
      ok: true,
      activeAgent: agent,
      lastOutput
    };
  }

  if (step.node.type === "skill") {
    const skillId = step.node.config?.refId;

    if (!skillId) {
      return {
        ok: false,
        error: `Pipeline skill node "${step.node.id}" is missing config.refId.`
      };
    }

    const skill = skillRegistry.get(skillId);

    if (!skill) {
      return {
        ok: false,
        error: `Skill "${skillId}" was not found in the registry.`
      };
    }

    const result = await skill.handler({
      agentId: activeAgent?.id,
      triggerKind: trigger.kind,
      runId: buildRunId(pipeline.id, trigger.occurredAt),
      input: {
        ...trigger.payload,
        pipelineId: pipeline.id,
        previousOutput: lastOutput
      }
    });

    skillExecutions.push({
      skillId,
      result
    });

    if (!result.ok) {
      return {
        ok: false,
        error: result.error ?? `Skill "${skillId}" failed.`
      };
    }

    return {
      ok: true,
      activeAgent,
      lastOutput: result.output
    };
  }

  return {
    ok: false,
    error: `Pipeline node type "${step.node.type}" is not supported in M13-S1 orchestration.`
  };
}

export async function executeTriggerPipeline(input: RuntimeOrchestrationInput): Promise<RuntimeOrchestrationResult> {
  const now = input.now ?? (() => new Date().toISOString());
  const path = resolveSequentialExecutionPath(input.pipeline);

  if (!path.ok) {
    return {
      ok: false,
      error: path.error,
      report: createPipelineResolutionFailureReport(input.pipeline, path.error, now)
    };
  }

  let report = createPipelineExecutionReport(input.pipeline, path.steps, now);
  let activeAgent: AgentDefinition | undefined;
  let lastOutput: unknown;
  const skillExecutions: RuntimeSkillExecutionRecord[] = [];

  for (const step of path.steps) {
    const stepResult = await executePipelineStep({
      step,
      trigger: input.trigger,
      pipeline: input.pipeline,
      agentRegistry: input.agentRegistry,
      skillRegistry: input.skillRegistry,
      activeAgent,
      lastOutput,
      skillExecutions
    });

    if (!stepResult.ok) {
      return failWithReport(report, step.node.id, stepResult.error, now);
    }

    activeAgent = stepResult.activeAgent;
    lastOutput = stepResult.lastOutput;
    report = markPipelineExecutionStepCompleted(report, step.node.id);
  }

  return {
    ok: true,
    report: markPipelineExecutionCompleted(report, now),
    agent: activeAgent,
    skillExecutions,
    finalOutput: lastOutput
  };
}
