import { createLogEntry, type LogContext, type LogEntry } from "./log-contract.ts";

export const FAILURE_REPORT_SOURCES = [
  "runtime",
  "pipeline",
  "provider",
  "integration",
  "config",
  "dependency",
  "unknown"
] as const;

export const FAILURE_REPORT_LEVELS = ["warning", "error"] as const;

export type FailureReportSource = (typeof FAILURE_REPORT_SOURCES)[number];
export type FailureReportLevel = (typeof FAILURE_REPORT_LEVELS)[number];

export type FailureReportMetadata = {
  [key: string]: string | number | boolean | undefined;
};

export type FailureReportCause = {
  message: string;
  code?: string;
  metadata?: FailureReportMetadata;
};

export type FailureReport = {
  source: FailureReportSource;
  level: FailureReportLevel;
  code: string;
  message: string;
  occurredAt: string;
  retryable: boolean;
  context?: LogContext;
  cause?: FailureReportCause;
};

export function createFailureReport(input: {
  source: FailureReportSource;
  code: string;
  message: string;
  level?: FailureReportLevel;
  retryable?: boolean;
  context?: LogContext;
  cause?: FailureReportCause;
  now?: () => string;
}): FailureReport {
  return {
    source: input.source,
    level: input.level ?? "error",
    code: input.code,
    message: input.message,
    occurredAt: (input.now ?? (() => new Date().toISOString()))(),
    retryable: input.retryable ?? false,
    context: input.context ? { ...input.context } : undefined,
    cause: input.cause
      ? {
          message: input.cause.message,
          code: input.cause.code,
          metadata: input.cause.metadata ? { ...input.cause.metadata } : undefined
        }
      : undefined
  };
}

export function toFailureLogEntry(report: FailureReport): LogEntry {
  return createLogEntry({
    level: report.level,
    message: `[${report.source}:${report.code}] ${report.message}`,
    context: {
      ...report.context,
      failureCode: report.code,
      failureSource: report.source,
      retryable: report.retryable
    },
    now: () => report.occurredAt
  });
}

export function buildFailureReportSummary(report: FailureReport): string[] {
  const lines = [
    `Failure: ${report.source}/${report.code}`,
    `Level: ${report.level}`,
    `Message: ${report.message}`,
    `Retryable: ${report.retryable ? "yes" : "no"}`,
    `Occurred At: ${report.occurredAt}`
  ];

  if (report.cause?.code || report.cause?.message) {
    lines.push(
      `Cause: ${report.cause.code ? `${report.cause.code} - ` : ""}${report.cause.message}`
    );
  }

  return lines;
}
