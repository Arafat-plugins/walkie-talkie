import type {
  PipelineDefinition,
  PipelineEdgeDefinition,
  PipelineNodeDefinition
} from "./pipeline-contract.ts";
import type { SequentialPipelineStep } from "./sequential-path.ts";

export type PipelineBranchOption = {
  edge: PipelineEdgeDefinition;
  node: PipelineNodeDefinition;
};

export type PipelineBranchPoint = {
  fromNode: PipelineNodeDefinition;
  options: PipelineBranchOption[];
};

export type BranchingPipelinePlan =
  | {
      ok: true;
      steps: SequentialPipelineStep[];
      branch?: PipelineBranchPoint;
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

export function resolveBranchingExecutionPath(pipeline: PipelineDefinition): BranchingPipelinePlan {
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
    const nextEdges = outgoingEdges.get(currentNode.id) ?? [];

    if (nextEdges.length === 0) {
      return {
        ok: true,
        steps
      };
    }

    const defaultEdges = nextEdges.filter((edge) => edge.type === "default");

    if (nextEdges.length === 1 && defaultEdges.length === 1) {
      const nextEdge = defaultEdges[0];
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
          error: `Branching path detected a cycle at node "${nextNode.id}".`
        };
      }

      steps.push({
        node: nextNode,
        viaEdge: nextEdge
      });
      visitedNodeIds.add(nextNode.id);
      currentNode = nextNode;
      continue;
    }

    const options: PipelineBranchOption[] = [];

    for (const edge of nextEdges) {
      const nextNode = nodes.get(edge.to);

      if (!nextNode) {
        return {
          ok: false,
          error: `Pipeline edge "${edge.id}" points to missing node "${edge.to}".`
        };
      }

      if (visitedNodeIds.has(nextNode.id)) {
        return {
          ok: false,
          error: `Branching path detected a cycle at node "${nextNode.id}".`
        };
      }

      options.push({
        edge,
        node: nextNode
      });
    }

    return {
      ok: true,
      steps,
      branch: {
        fromNode: currentNode,
        options
      }
    };
  }
}
