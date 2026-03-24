import type { PipelineDefinition, PipelineNodeType } from "./pipeline-contract.ts";
import type { SequentialPipelineStep } from "./sequential-path.ts";

export const PIPELINE_EXECUTION_STATUSES = ["planned", "running", "success", "failed", "blocked"] as const;
export const PIPELINE_STEP_STATUSES = ["planned", "completed", "failed", "blocked"] as const;

export type PipelineExecutionStatus = (typeof PIPELINE_EXECUTION_STATUSES)[number];
export type PipelineStepStatus = (typeof PIPELINE_STEP_STATUSES)[number];

export type PipelineExecutionStepReport = {
  nodeId: string;
  nodeType: PipelineNodeType;
  label: string;
  viaEdgeId?: string;
  status: PipelineStepStatus;
  error?: string;
};

export type PipelineExecutionReport = {
  pipelineId: string;
  pipelineName: string;
  status: PipelineExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  steps: PipelineExecutionStepReport[];
  error?: string;
};

type TimestampFactory = () => string;

function updateStepStatus(
  steps: PipelineExecutionStepReport[],
  nodeId: string,
  status: PipelineStepStatus,
  error?: string
): PipelineExecutionStepReport[] {
  return steps.map((step) =>
    step.nodeId === nodeId
      ? {
          ...step,
          status,
          error
        }
      : { ...step }
  );
}

export function createPipelineExecutionReport(
  pipeline: PipelineDefinition,
  steps: SequentialPipelineStep[],
  now: TimestampFactory = () => new Date().toISOString()
): PipelineExecutionReport {
  return {
    pipelineId: pipeline.id,
    pipelineName: pipeline.name,
    status: "planned",
    startedAt: now(),
    steps: steps.map((step) => ({
      nodeId: step.node.id,
      nodeType: step.node.type,
      label: step.node.label,
      viaEdgeId: step.viaEdge?.id,
      status: "planned"
    }))
  };
}

export function markPipelineExecutionStepCompleted(
  report: PipelineExecutionReport,
  nodeId: string
): PipelineExecutionReport {
  return {
    ...report,
    status: "running",
    steps: updateStepStatus(report.steps, nodeId, "completed")
  };
}

export function markPipelineExecutionFailed(
  report: PipelineExecutionReport,
  nodeId: string,
  error: string,
  now: TimestampFactory = () => new Date().toISOString()
): PipelineExecutionReport {
  const failedSteps = report.steps.map((step) => {
    if (step.nodeId === nodeId) {
      return {
        ...step,
        status: "failed" as const,
        error
      };
    }

    if (step.status === "planned") {
      return {
        ...step,
        status: "blocked" as const
      };
    }

    return { ...step };
  });

  return {
    ...report,
    status: "failed",
    finishedAt: now(),
    error,
    steps: failedSteps
  };
}

export function markPipelineExecutionCompleted(
  report: PipelineExecutionReport,
  now: TimestampFactory = () => new Date().toISOString()
): PipelineExecutionReport {
  return {
    ...report,
    status: "success",
    finishedAt: now(),
    steps: report.steps.map((step) => ({
      ...step,
      status: step.status === "planned" ? "completed" : step.status
    }))
  };
}

export function createPipelineResolutionFailureReport(
  pipeline: PipelineDefinition,
  error: string,
  now: TimestampFactory = () => new Date().toISOString()
): PipelineExecutionReport {
  const timestamp = now();

  return {
    pipelineId: pipeline.id,
    pipelineName: pipeline.name,
    status: "blocked",
    startedAt: timestamp,
    finishedAt: timestamp,
    steps: [],
    error
  };
}
