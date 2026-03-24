import type { FailureReport } from "./failure-report.ts";

export const RETRY_BACKOFF_STRATEGIES = ["fixed", "exponential"] as const;

export type RetryBackoffStrategy = (typeof RETRY_BACKOFF_STRATEGIES)[number];

export type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  backoffStrategy: RetryBackoffStrategy;
  retryableSources?: FailureReport["source"][];
  retryableCodes?: string[];
};

export type RetryAttemptContext = {
  attempt: number;
  failure: FailureReport;
  policy: RetryPolicy;
};

export type RetryDecision = {
  shouldRetry: boolean;
  delayMs?: number;
  reason: string;
};

export function createRetryPolicy(input?: Partial<RetryPolicy>): RetryPolicy {
  return {
    maxAttempts: input?.maxAttempts ?? 3,
    baseDelayMs: input?.baseDelayMs ?? 1000,
    maxDelayMs: input?.maxDelayMs,
    backoffStrategy: input?.backoffStrategy ?? "exponential",
    retryableSources: input?.retryableSources ? [...input.retryableSources] : undefined,
    retryableCodes: input?.retryableCodes ? [...input.retryableCodes] : undefined
  };
}

export function computeRetryDelayMs(context: RetryAttemptContext): number {
  const { attempt, policy } = context;
  const rawDelay =
    policy.backoffStrategy === "fixed"
      ? policy.baseDelayMs
      : policy.baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));

  if (policy.maxDelayMs === undefined) {
    return rawDelay;
  }

  return Math.min(rawDelay, policy.maxDelayMs);
}

export function shouldRetryFailure(context: RetryAttemptContext): RetryDecision {
  const { attempt, failure, policy } = context;

  if (!failure.retryable) {
    return {
      shouldRetry: false,
      reason: "Failure is marked as non-retryable."
    };
  }

  if (attempt >= policy.maxAttempts) {
    return {
      shouldRetry: false,
      reason: "Maximum retry attempts reached."
    };
  }

  if (
    policy.retryableSources &&
    !policy.retryableSources.includes(failure.source)
  ) {
    return {
      shouldRetry: false,
      reason: `Failure source "${failure.source}" is not enabled for retry.`
    };
  }

  if (policy.retryableCodes && !policy.retryableCodes.includes(failure.code)) {
    return {
      shouldRetry: false,
      reason: `Failure code "${failure.code}" is not enabled for retry.`
    };
  }

  return {
    shouldRetry: true,
    delayMs: computeRetryDelayMs(context),
    reason: "Failure matches retry policy."
  };
}
