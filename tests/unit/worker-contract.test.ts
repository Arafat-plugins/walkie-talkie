import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BACKGROUND_QUEUE_PRIORITIES,
  BACKGROUND_TASK_KINDS,
  BACKGROUND_TASK_SOURCES,
  BACKGROUND_WORKER_CONTRACT_VERSION,
  BACKGROUND_WORKER_STATUSES,
  buildBackgroundWorkerSummary,
  createBackgroundJobEnvelope,
  createBackgroundTaskDefinition,
  createBackgroundWorkerRuntimeConfig
} from "../../packages/runtime/src/index.ts";

test("background worker contract exports stable enum-like values", () => {
  assert.equal(BACKGROUND_WORKER_CONTRACT_VERSION, "1");
  assert.deepEqual(BACKGROUND_TASK_KINDS, [
    "scheduled-trigger",
    "retry-run",
    "approval-review",
    "retention-cleanup",
    "custom"
  ]);
  assert.deepEqual(BACKGROUND_TASK_SOURCES, ["schedule", "runtime", "integration", "user", "system"]);
  assert.deepEqual(BACKGROUND_QUEUE_PRIORITIES, ["low", "normal", "high", "critical"]);
  assert.deepEqual(BACKGROUND_WORKER_STATUSES, ["idle", "running", "paused", "stopped"]);
});

test("createBackgroundTaskDefinition applies defaults and clones nested values", () => {
  const task = createBackgroundTaskDefinition({
    id: "daily-dashboard-refresh",
    name: "Daily Dashboard Refresh",
    kind: "scheduled-trigger",
    source: "schedule",
    schedule: {
      cron: "0 9 * * *",
      timezone: "Asia/Dhaka",
      jitterMs: 30000
    },
    pipelineId: "dashboard-refresh-pipeline",
    retryPolicy: {
      maxAttempts: 4,
      baseDelayMs: 1000,
      backoffStrategy: "exponential",
      retryableSources: ["runtime"],
      retryableCodes: ["timeout"]
    },
    tags: ["dashboard", "daily"]
  });

  assert.deepEqual(task, {
    version: "1",
    id: "daily-dashboard-refresh",
    name: "Daily Dashboard Refresh",
    kind: "scheduled-trigger",
    source: "schedule",
    enabled: true,
    priority: "normal",
    schedule: {
      cron: "0 9 * * *",
      timezone: "Asia/Dhaka",
      jitterMs: 30000
    },
    pipelineId: "dashboard-refresh-pipeline",
    agentId: undefined,
    integrationId: undefined,
    timeoutMs: undefined,
    retryPolicy: {
      maxAttempts: 4,
      baseDelayMs: 1000,
      maxDelayMs: undefined,
      backoffStrategy: "exponential",
      retryableSources: ["runtime"],
      retryableCodes: ["timeout"]
    },
    tags: ["dashboard", "daily"]
  });
});

test("createBackgroundJobEnvelope applies defaults and clones payload", () => {
  const payload = {
    proposalId: "draft-1"
  };

  const job = createBackgroundJobEnvelope({
    id: "job-1",
    taskId: "approval-followup",
    queueName: "ops",
    availableAt: "2026-03-24T23:30:00.000Z",
    payload,
    lease: {
      workerId: "worker-1",
      claimedAt: "2026-03-24T23:30:01.000Z",
      expiresAt: "2026-03-24T23:31:01.000Z"
    }
  });

  payload.proposalId = "mutated";

  assert.deepEqual(job, {
    id: "job-1",
    taskId: "approval-followup",
    queueName: "ops",
    availableAt: "2026-03-24T23:30:00.000Z",
    attempt: 1,
    payload: {
      proposalId: "draft-1"
    },
    lease: {
      workerId: "worker-1",
      claimedAt: "2026-03-24T23:30:01.000Z",
      expiresAt: "2026-03-24T23:31:01.000Z"
    }
  });
});

test("createBackgroundWorkerRuntimeConfig applies defaults and summary stays readable", () => {
  const worker = createBackgroundWorkerRuntimeConfig({
    workerId: "worker-1",
    queueName: "telegram",
    status: "running",
    concurrency: 3
  });

  assert.deepEqual(worker, {
    version: "1",
    workerId: "worker-1",
    queueName: "telegram",
    status: "running",
    concurrency: 3,
    pollIntervalMs: 1000,
    heartbeatIntervalMs: 5000,
    maxLeaseMs: 30000
  });

  assert.deepEqual(
    buildBackgroundWorkerSummary({
      worker,
      tasks: [
        createBackgroundTaskDefinition({
          id: "tg-poll",
          name: "Telegram Poll",
          kind: "scheduled-trigger"
        })
      ],
      queuedJobs: [
        createBackgroundJobEnvelope({
          id: "job-1",
          taskId: "tg-poll",
          queueName: "telegram",
          availableAt: "2026-03-24T23:30:00.000Z"
        })
      ]
    }),
    [
      "Background worker: worker-1",
      "Queue: telegram",
      "Status: running",
      "Concurrency: 3",
      "Poll Interval: 1000ms",
      "Heartbeat Interval: 5000ms",
      "Max Lease: 30000ms",
      "Tasks: 1",
      "Queued Jobs: 1"
    ]
  );
});
