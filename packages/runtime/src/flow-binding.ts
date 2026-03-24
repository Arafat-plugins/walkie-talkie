import type { WalkieTalkieConfig } from "../../config/src/index.ts";
import type { TriggerEvent } from "../../core/src/index.ts";
import type { PipelineDefinition } from "../../pipeline/src/index.ts";
import type { RuntimeOrchestrationInput, RuntimeOrchestrationResult } from "./orchestration.ts";
import { executeTriggerPipeline } from "./orchestration.ts";

export type ResolvedFlowBinding = {
  triggerKind: TriggerEvent["kind"];
  eventName?: string;
  pipelineId: string;
};

export type ConfigDrivenRuntimeInput = Omit<RuntimeOrchestrationInput, "pipeline"> & {
  config: WalkieTalkieConfig;
  pipelines: PipelineDefinition[];
};

export function resolveConfigDrivenFlowBinding(
  config: WalkieTalkieConfig,
  trigger: TriggerEvent
): ResolvedFlowBinding | undefined {
  return config.runtime.flowBindings?.find(
    (binding) => binding.triggerKind === trigger.kind && (!binding.eventName || binding.eventName === trigger.eventName)
  );
}

export function resolvePipelineForTrigger(input: {
  config: WalkieTalkieConfig;
  trigger: TriggerEvent;
  pipelines: PipelineDefinition[];
}):
  | { ok: true; binding: ResolvedFlowBinding; pipeline: PipelineDefinition }
  | { ok: false; error: string } {
  if (input.config.project.primaryTrigger !== input.trigger.kind) {
    return {
      ok: false,
      error: `Trigger kind "${input.trigger.kind}" does not match configured primary trigger "${input.config.project.primaryTrigger}".`
    };
  }

  const binding = resolveConfigDrivenFlowBinding(input.config, input.trigger);

  if (!binding) {
    return {
      ok: false,
      error: `No flow binding matched trigger "${input.trigger.eventName}".`
    };
  }

  const pipeline = input.pipelines.find((candidate) => candidate.id === binding.pipelineId);

  if (!pipeline) {
    return {
      ok: false,
      error: `Pipeline "${binding.pipelineId}" was not found for trigger "${input.trigger.eventName}".`
    };
  }

  return {
    ok: true,
    binding,
    pipeline
  };
}

export async function executeConfiguredTriggerPipeline(
  input: ConfigDrivenRuntimeInput
): Promise<RuntimeOrchestrationResult> {
  const resolution = resolvePipelineForTrigger({
    config: input.config,
    trigger: input.trigger,
    pipelines: input.pipelines
  });

  if (!resolution.ok) {
    return {
      ok: false,
      error: resolution.error,
      report: {
        pipelineId: "unresolved",
        pipelineName: "Unresolved Pipeline",
        status: "blocked",
        startedAt: (input.now ?? (() => new Date().toISOString()))(),
        finishedAt: (input.now ?? (() => new Date().toISOString()))(),
        steps: [],
        error: resolution.error
      }
    };
  }

  return executeTriggerPipeline({
    ...input,
    pipeline: resolution.pipeline
  });
}
