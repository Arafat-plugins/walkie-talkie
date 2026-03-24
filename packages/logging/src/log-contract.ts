export const LOG_LEVELS = ["debug", "info", "warning", "error"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type LogContext = {
  scope?: string;
  runId?: string;
  pipelineId?: string;
  triggerKind?: string;
  [key: string]: string | number | boolean | undefined;
};

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
};

export type Logger = {
  log(entry: LogEntry): void | Promise<void>;
};

export function createLogEntry(input: {
  level: LogLevel;
  message: string;
  context?: LogContext;
  now?: () => string;
}): LogEntry {
  return {
    level: input.level,
    message: input.message,
    timestamp: (input.now ?? (() => new Date().toISOString()))(),
    context: input.context ? { ...input.context } : undefined
  };
}

export function isLogLevelEnabled(activeLevel: LogLevel, candidateLevel: LogLevel): boolean {
  return LOG_LEVELS.indexOf(candidateLevel) >= LOG_LEVELS.indexOf(activeLevel);
}

export function createNoopLogger(): Logger {
  return {
    log() {
      return;
    }
  };
}
