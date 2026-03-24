import type {
  PipelineDefinition,
  PipelineEdgeDefinition,
  PipelineNodeDefinition
} from "./pipeline-contract.ts";

export type SequentialPipelineStep = {
  node: PipelineNodeDefinition;
  viaEdge?: PipelineEdgeDefinition;
};

export type SequentialPipelinePlan =
  | {
      ok: true;
      steps: SequentialPipelineStep[];
    }
  | {
      ok: false;
      error: string;
    };

function buildNodeMap(pipeline: PipelineDefinition): Map<string, PipelineNodeDefinition> {
  return new Map(pipeline.nodes.map((node) => [node.id, node]));
}

function buildOutgoingEdgeMap(pipeline: PipelineDefinition): Map<string, PipelineEdgeDefinition[]> {
  const outgoing = new Map<string, PipelineEdgeDefinition[]>();

  for (const edge of pipeline.edges) {
    const edges = outgoing.get(edge.from) ?? [];
    edges.push(edge);
    outgoing.set(edge.from, edges);
  }

  return outgoing;
}

export function resolveSequentialExecutionPath(pipeline: PipelineDefinition): SequentialPipelinePlan {
  const nodes = buildNodeMap(pipeline);
  const outgoingEdges = buildOutgoingEdgeMap(pipeline);
  const startNode = nodes.get(pipeline.startNodeId);

  if (!startNode) {
    return {
      ok: false,
      error: `Pipeline start node "${pipeline.startNodeId}" was not found.`
    };
  }

  const steps: SequentialPipelineStep[] = [{ node: startNode }];
  const visitedNodeIds = new Set<string>([startNode.id]);
  let currentNode = startNode;

  while (true) {
    const nextEdges = (outgoingEdges.get(currentNode.id) ?? []).filter((edge) => edge.type === "default");

    if (nextEdges.length === 0) {
      return {
        ok: true,
        steps
      };
    }

    if (nextEdges.length > 1) {
      return {
        ok: false,
        error: `Sequential path cannot continue from node "${currentNode.id}" because multiple default edges were found.`
      };
    }

    const nextEdge = nextEdges[0];
    const nextNode = nodes.get(nextEdge.to);

    if (!nextNode) {
      return {
        ok: false,
        error: `Pipeline edge "${nextEdge.id}" points to missing node "${nextEdge.to}".`
      };
    }

    if (visitedNodeIds.has(nextNode.id)) {
      return {
        ok: false,
        error: `Sequential path detected a cycle at node "${nextNode.id}".`
      };
    }

    steps.push({
      node: nextNode,
      viaEdge: nextEdge
    });
    visitedNodeIds.add(nextNode.id);
    currentNode = nextNode;
  }
}
