import type { PipelineDefinition } from "../../../../packages/pipeline/src/index.ts";
import type { DashboardEntityCard } from "./read-only-views.ts";

export type DashboardPipelineListModel = {
  pipelines: DashboardEntityCard[];
};

function summarizePipeline(pipeline: PipelineDefinition): DashboardEntityCard {
  return {
    id: pipeline.id,
    title: pipeline.name,
    subtitle: pipeline.description ?? `Start node: ${pipeline.startNodeId}`,
    meta: [
      `nodes=${pipeline.nodes.length}`,
      `edges=${pipeline.edges.length}`,
      `start=${pipeline.startNodeId}`,
      `tags=${pipeline.tags.length}`
    ]
  };
}

export function createDashboardPipelineListModel(input: {
  pipelines: PipelineDefinition[];
}): DashboardPipelineListModel {
  return {
    pipelines: input.pipelines.map((pipeline) => summarizePipeline(pipeline))
  };
}

export function buildDashboardPipelineSummary(model: DashboardPipelineListModel): string[] {
  return [
    `Pipelines: ${model.pipelines.map((pipeline) => pipeline.title).join(", ") || "none"}`
  ];
}
