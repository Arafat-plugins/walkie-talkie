import { createRetryPolicy, type RetryPolicy } from "../../logging/src/index.ts";

export const BACKGROUND_WORKER_CONTRACT_VERSION = "1" as const;

export const BACKGROUND_TASK_KINDS = [
  "scheduled-trigger",
  "retry-run",
  "approval-review",
  "retention-cleanup",
  "custom"
] as const;

export const BACKGROUND_TASK_SOURCES = ["schedule", "runtime", "integration", "user", "system"] as const;

export const BACKGROUND_QUEUE_PRIORITIES = ["low", "normal", "high", "critical"] as const;

export const BACKGROUND_WORKER_STATUSES = ["idle", "running", "paused", "stopped"] as const;

export type BackgroundTaskKind = (typeof BACKGROUND_TASK_KINDS)[number];
export type BackgroundTaskSource = (typeof BACKGROUND_TASK_SOURCES)[number];
export type BackgroundQueuePriority = (typeof BACKGROUND_QUEUE_PRIORITIES)[number];
export type BackgroundWorkerStatus = (typeof BACKGROUND_WORKER_STATUSES)[number];

export type BackgroundTaskSchedule = {
  cron: string;
  timezone?: string;
  jitterMs?: number;
};

export type BackgroundTaskDefinition = {
  version: typeof BACKGROUND_WORKER_CONTRACT_VERSION;
  id: string;
  name: string;
  kind: BackgroundTaskKind;
  source: BackgroundTaskSource;
  enabled: boolean;
  priority: BackgroundQueuePriority;
  schedule?: BackgroundTaskSchedule;
  pipelineId?: string;
  agentId?: string;
  integrationId?: string;
  timeoutMs?: number;
  retryPolicy?: RetryPolicy;
  tags: string[];
};

export type BackgroundJobLease = {
  workerId: string;
  claimedAt: string;
  expiresAt: string;
};

export type BackgroundJobEnvelope = {
  id: string;
  taskId: string;
  queueName: string;
  availableAt: string;
  attempt: number;
  payload: Record<string, unknown>;
  lease?: BackgroundJobLease;
};

export type BackgroundWorkerRuntimeConfig = {
  version: typeof BACKGROUND_WORKER_CONTRACT_VERSION;
  workerId: string;
  queueName: string;
  status: BackgroundWorkerStatus;
  concurrency: number;
  pollIntervalMs: number;
  heartbeatIntervalMs: number;
  maxLeaseMs: number;
};

function cloneSchedule(schedule: BackgroundTaskSchedule): BackgroundTaskSchedule {
  return {
    ...schedule
  };
}

function cloneRetryPolicy(policy: RetryPolicy): RetryPolicy {
  return createRetryPolicy(policy);
}

function cloneLease(lease: BackgroundJobLease): BackgroundJobLease {
  return {
    ...lease
  };
}

export function createBackgroundTaskDefinition(
  input: Omit<BackgroundTaskDefinition, "version" | "enabled" | "priority" | "source" | "tags"> & {
    source?: BackgroundTaskSource;
    enabled?: boolean;
    priority?: BackgroundQueuePriority;
    tags?: string[];
  }
): BackgroundTaskDefinition {
  return {
    version: BACKGROUND_WORKER_CONTRACT_VERSION,
    id: input.id,
    name: input.name,
    kind: input.kind,
    source: input.source ?? "system",
    enabled: input.enabled ?? true,
    priority: input.priority ?? "normal",
    schedule: input.schedule ? cloneSchedule(input.schedule) : undefined,
    pipelineId: input.pipelineId,
    agentId: input.agentId,
    integrationId: input.integrationId,
    timeoutMs: input.timeoutMs,
    retryPolicy: input.retryPolicy ? cloneRetryPolicy(input.retryPolicy) : undefined,
    tags: [...(input.tags ?? [])]
  };
}

export function createBackgroundJobEnvelope(input: {
  id: string;
  taskId: string;
  queueName: string;
  availableAt: string;
  payload?: Record<string, unknown>;
  attempt?: number;
  lease?: BackgroundJobLease;
}): BackgroundJobEnvelope {
  return {
    id: input.id,
    taskId: input.taskId,
    queueName: input.queueName,
    availableAt: input.availableAt,
    attempt: input.attempt ?? 1,
    payload: { ...(input.payload ?? {}) },
    lease: input.lease ? cloneLease(input.lease) : undefined
  };
}

export function createBackgroundWorkerRuntimeConfig(input: {
  workerId: string;
  queueName?: string;
  status?: BackgroundWorkerStatus;
  concurrency?: number;
  pollIntervalMs?: number;
  heartbeatIntervalMs?: number;
  maxLeaseMs?: number;
}): BackgroundWorkerRuntimeConfig {
  return {
    version: BACKGROUND_WORKER_CONTRACT_VERSION,
    workerId: input.workerId,
    queueName: input.queueName ?? "default",
    status: input.status ?? "idle",
    concurrency: input.concurrency ?? 1,
    pollIntervalMs: input.pollIntervalMs ?? 1000,
    heartbeatIntervalMs: input.heartbeatIntervalMs ?? 5000,
    maxLeaseMs: input.maxLeaseMs ?? 30000
  };
}

export function buildBackgroundWorkerSummary(input: {
  worker: BackgroundWorkerRuntimeConfig;
  tasks?: BackgroundTaskDefinition[];
  queuedJobs?: BackgroundJobEnvelope[];
}): string[] {
  return [
    `Background worker: ${input.worker.workerId}`,
    `Queue: ${input.worker.queueName}`,
    `Status: ${input.worker.status}`,
    `Concurrency: ${input.worker.concurrency}`,
    `Poll Interval: ${input.worker.pollIntervalMs}ms`,
    `Heartbeat Interval: ${input.worker.heartbeatIntervalMs}ms`,
    `Max Lease: ${input.worker.maxLeaseMs}ms`,
    `Tasks: ${(input.tasks ?? []).length}`,
    `Queued Jobs: ${(input.queuedJobs ?? []).length}`
  ];
}
