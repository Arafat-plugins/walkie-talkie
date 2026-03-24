import type { TriggerEvent } from "../../core/src/index.ts";
import type { RuntimeOrchestrationResult } from "./orchestration.ts";
import type { ConfigDrivenRuntimeInput } from "./flow-binding.ts";
import { executeConfiguredTriggerPipeline } from "./flow-binding.ts";

export type RuntimeRunHistoryEntry = {
  runId: string;
  pipelineId: string;
  pipelineName: string;
  triggerKind: TriggerEvent["kind"];
  triggerEventName: string;
  status: "success" | "failed" | "blocked";
  startedAt: string;
  finishedAt?: string;
  error?: string;
};

function cloneRunHistoryEntry(entry: RuntimeRunHistoryEntry): RuntimeRunHistoryEntry {
  return {
    ...entry
  };
}

export class InMemoryRunHistoryStore {
  private readonly entries: RuntimeRunHistoryEntry[] = [];

  record(entry: RuntimeRunHistoryEntry): void {
    this.entries.push(cloneRunHistoryEntry(entry));
  }

  list(): RuntimeRunHistoryEntry[] {
    return this.entries.map((entry) => cloneRunHistoryEntry(entry));
  }

  latest(): RuntimeRunHistoryEntry | undefined {
    const latestEntry = this.entries.at(-1);
    return latestEntry ? cloneRunHistoryEntry(latestEntry) : undefined;
  }
}

export function createRunHistoryEntry(
  trigger: TriggerEvent,
  result: RuntimeOrchestrationResult
): RuntimeRunHistoryEntry {
  return {
    runId: `${result.report.pipelineId}:${trigger.occurredAt}`,
    pipelineId: result.report.pipelineId,
    pipelineName: result.report.pipelineName,
    triggerKind: trigger.kind,
    triggerEventName: trigger.eventName,
    status: result.report.status === "success" ? "success" : result.report.status === "failed" ? "failed" : "blocked",
    startedAt: result.report.startedAt,
    finishedAt: result.report.finishedAt,
    error: result.ok ? undefined : result.error
  };
}

export async function executeConfiguredTriggerPipelineWithHistory(
  input: ConfigDrivenRuntimeInput & {
    historyStore: InMemoryRunHistoryStore;
  }
): Promise<RuntimeOrchestrationResult> {
  const result = await executeConfiguredTriggerPipeline(input);
  input.historyStore.record(createRunHistoryEntry(input.trigger, result));
  return result;
}
