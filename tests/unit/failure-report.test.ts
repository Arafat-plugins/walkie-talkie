import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildFailureReportSummary,
  createFailureReport,
  toFailureLogEntry
} from "../../packages/logging/src/index.ts";

test("createFailureReport builds normalized retry-ready failure object", () => {
  const report = createFailureReport({
    source: "provider",
    code: "transport",
    message: "Provider request failed.",
    retryable: true,
    context: {
      scope: "ai",
      runId: "run-1"
    },
    cause: {
      code: "ECONNRESET",
      message: "Socket closed.",
      metadata: {
        attempts: 1
      }
    },
    now: () => "2026-03-21T19:00:00.000Z"
  });

  assert.deepEqual(report, {
    source: "provider",
    level: "error",
    code: "transport",
    message: "Provider request failed.",
    occurredAt: "2026-03-21T19:00:00.000Z",
    retryable: true,
    context: {
      scope: "ai",
      runId: "run-1"
    },
    cause: {
      code: "ECONNRESET",
      message: "Socket closed.",
      metadata: {
        attempts: 1
      }
    }
  });
});

test("toFailureLogEntry converts report into standard log entry", () => {
  const report = createFailureReport({
    source: "runtime",
    code: "agent-missing",
    message: "Agent not found.",
    level: "warning",
    context: {
      pipelineId: "pipe-1"
    },
    now: () => "2026-03-21T19:05:00.000Z"
  });

  assert.deepEqual(toFailureLogEntry(report), {
    level: "warning",
    message: "[runtime:agent-missing] Agent not found.",
    timestamp: "2026-03-21T19:05:00.000Z",
    context: {
      pipelineId: "pipe-1",
      failureCode: "agent-missing",
      failureSource: "runtime",
      retryable: false
    }
  });
});

test("buildFailureReportSummary returns readable lines", () => {
  const report = createFailureReport({
    source: "dependency",
    code: "missing-node",
    message: "Node.js was not found.",
    retryable: false,
    cause: {
      message: "which node returned empty output."
    },
    now: () => "2026-03-21T19:10:00.000Z"
  });

  assert.deepEqual(buildFailureReportSummary(report), [
    "Failure: dependency/missing-node",
    "Level: error",
    "Message: Node.js was not found.",
    "Retryable: no",
    "Occurred At: 2026-03-21T19:10:00.000Z",
    "Cause: which node returned empty output."
  ]);
});
