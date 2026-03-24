export const PIPELINE_CONTRACT_VERSION = "1" as const;

export const PIPELINE_NODE_TYPES = [
  "trigger",
  "agent",
  "skill",
  "mcp",
  "condition",
  "response"
] as const;

export const PIPELINE_EDGE_TYPES = ["default", "success", "failure", "conditional"] as const;

export type PipelineNodeType = (typeof PIPELINE_NODE_TYPES)[number];
export type PipelineEdgeType = (typeof PIPELINE_EDGE_TYPES)[number];

export type PipelineNodeConfig = {
  refId?: string;
  promptId?: string;
  conditionKey?: string;
  conditionValue?: string | boolean;
};

export type PipelineNodeDefinition = {
  id: string;
  type: PipelineNodeType;
  label: string;
  config?: PipelineNodeConfig;
};

export type PipelineEdgeDefinition = {
  id: string;
  from: string;
  to: string;
  type: PipelineEdgeType;
};

export type PipelineDefinition = {
  version: typeof PIPELINE_CONTRACT_VERSION;
  id: string;
  name: string;
  description?: string;
  startNodeId: string;
  nodes: PipelineNodeDefinition[];
  edges: PipelineEdgeDefinition[];
  tags: string[];
};

export type PipelineDefinitionInput = {
  id: string;
  name: string;
  description?: string;
  startNodeId: string;
  nodes: PipelineNodeDefinition[];
  edges: PipelineEdgeDefinition[];
  tags?: string[];
};

export function createPipelineDefinition(input: PipelineDefinitionInput): PipelineDefinition {
  return {
    version: PIPELINE_CONTRACT_VERSION,
    id: input.id,
    name: input.name,
    description: input.description,
    startNodeId: input.startNodeId,
    nodes: input.nodes.map((node) => ({
      ...node,
      config: node.config ? { ...node.config } : undefined
    })),
    edges: input.edges.map((edge) => ({ ...edge })),
    tags: [...(input.tags ?? [])]
  };
}
