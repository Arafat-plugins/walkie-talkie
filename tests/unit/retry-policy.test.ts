import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computeRetryDelayMs,
  createFailureReport,
  createRetryPolicy,
  shouldRetryFailure
} from "../../packages/logging/src/index.ts";

test("createRetryPolicy applies deterministic defaults", () => {
  assert.deepEqual(createRetryPolicy(), {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: undefined,
    backoffStrategy: "exponential",
    retryableSources: undefined,
    retryableCodes: undefined
  });
});

test("computeRetryDelayMs supports fixed and exponential strategies", () => {
  const fixedPolicy = createRetryPolicy({
    backoffStrategy: "fixed",
    baseDelayMs: 500
  });

  const exponentialPolicy = createRetryPolicy({
    backoffStrategy: "exponential",
    baseDelayMs: 500,
    maxDelayMs: 1500
  });

  const failure = createFailureReport({
    source: "provider",
    code: "transport",
    message: "Request failed.",
    retryable: true,
    now: () => "2026-03-21T19:30:00.000Z"
  });

  assert.equal(
    computeRetryDelayMs({ attempt: 2, failure, policy: fixedPolicy }),
    500
  );
  assert.equal(
    computeRetryDelayMs({ attempt: 3, failure, policy: exponentialPolicy }),
    1500
  );
});

test("shouldRetryFailure respects retryability, attempts, source, and code filters", () => {
  const policy = createRetryPolicy({
    maxAttempts: 4,
    baseDelayMs: 250,
    retryableSources: ["provider"],
    retryableCodes: ["transport"]
  });

  const retryableFailure = createFailureReport({
    source: "provider",
    code: "transport",
    message: "Provider request failed.",
    retryable: true,
    now: () => "2026-03-21T19:35:00.000Z"
  });

  const blockedFailure = createFailureReport({
    source: "runtime",
    code: "agent-missing",
    message: "Agent not found.",
    retryable: false,
    now: () => "2026-03-21T19:35:00.000Z"
  });

  assert.deepEqual(
    shouldRetryFailure({
      attempt: 1,
      failure: retryableFailure,
      policy
    }),
    {
      shouldRetry: true,
      delayMs: 250,
      reason: "Failure matches retry policy."
    }
  );

  assert.deepEqual(
    shouldRetryFailure({
      attempt: 1,
      failure: blockedFailure,
      policy
    }),
    {
      shouldRetry: false,
      reason: "Failure is marked as non-retryable."
    }
  );

  assert.deepEqual(
    shouldRetryFailure({
      attempt: 4,
      failure: retryableFailure,
      policy
    }),
    {
      shouldRetry: false,
      reason: "Maximum retry attempts reached."
    }
  );
});
