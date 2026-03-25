import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const TERMINAL_EXECUTION_CONTRACT_VERSION = "1" as const;

export type TerminalExecutionPolicy = {
  version: typeof TERMINAL_EXECUTION_CONTRACT_VERSION;
  allowedCommands?: string[];
  blockedCommands: string[];
  blockedPatterns: RegExp[];
  allowedWorkingDirectories?: string[];
  defaultTimeoutMs: number;
  maxBufferBytes: number;
};

export type TerminalExecutionRequest = {
  command: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
};

export type TerminalExecutionEvaluation = {
  allowed: boolean;
  reasons: string[];
};

export type TerminalExecutionResult = {
  ok: boolean;
  blocked: boolean;
  command: string;
  args: string[];
  cwd?: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  runtimeMs: number;
  timedOut: boolean;
  error?: string;
};

const execFileAsync = promisify(execFile);

function cloneRegexList(values?: RegExp[]): RegExp[] {
  return (values ?? []).map((value) => new RegExp(value.source, value.flags));
}

function cloneStringList(values?: string[]): string[] | undefined {
  return values ? [...values] : undefined;
}

function normalizeRequestedCommand(command: string): string {
  return command.trim();
}

function normalizeRequestedArgs(args?: string[]): string[] {
  return (args ?? []).map((value) => `${value}`);
}

function buildCommandLine(request: TerminalExecutionRequest): string {
  return [request.command, ...(request.args ?? [])].join(" ").trim();
}

function isWithinAllowedDirectories(
  cwd: string | undefined,
  allowedWorkingDirectories: string[] | undefined
): boolean {
  if (!cwd || !allowedWorkingDirectories || allowedWorkingDirectories.length === 0) {
    return true;
  }

  return allowedWorkingDirectories.some((directory) => cwd === directory || cwd.startsWith(`${directory}/`));
}

export function createTerminalExecutionPolicy(input?: {
  allowedCommands?: string[];
  blockedCommands?: string[];
  blockedPatterns?: RegExp[];
  allowedWorkingDirectories?: string[];
  defaultTimeoutMs?: number;
  maxBufferBytes?: number;
}): TerminalExecutionPolicy {
  return {
    version: TERMINAL_EXECUTION_CONTRACT_VERSION,
    allowedCommands: cloneStringList(input?.allowedCommands),
    blockedCommands: cloneStringList(input?.blockedCommands) ?? [
      "rm",
      "sudo",
      "shutdown",
      "reboot",
      "poweroff",
      "mkfs",
      "dd"
    ],
    blockedPatterns: cloneRegexList(input?.blockedPatterns) ?? [
      /\brm\s+-rf\b/i,
      /\bsudo\b/i,
      /\bshutdown\b/i,
      /\breboot\b/i,
      /\bpoweroff\b/i,
      /\bmkfs\b/i,
      /\bdd\s+if=/i
    ],
    allowedWorkingDirectories: cloneStringList(input?.allowedWorkingDirectories),
    defaultTimeoutMs: input?.defaultTimeoutMs ?? 15_000,
    maxBufferBytes: input?.maxBufferBytes ?? 1024 * 1024
  };
}

export function evaluateTerminalExecutionRequest(
  request: TerminalExecutionRequest,
  policy: TerminalExecutionPolicy
): TerminalExecutionEvaluation {
  const reasons: string[] = [];
  const command = normalizeRequestedCommand(request.command);
  const commandLine = buildCommandLine({
    ...request,
    command,
    args: normalizeRequestedArgs(request.args)
  });

  if (command.length === 0) {
    reasons.push("Terminal execution requires a non-empty command.");
  }

  if (policy.allowedCommands && policy.allowedCommands.length > 0 && !policy.allowedCommands.includes(command)) {
    reasons.push(`Command "${command}" is not in the terminal allowlist.`);
  }

  if (policy.blockedCommands.includes(command)) {
    reasons.push(`Command "${command}" is blocked by terminal policy.`);
  }

  for (const pattern of policy.blockedPatterns) {
    if (pattern.test(commandLine)) {
      reasons.push(`Command line matches blocked terminal pattern: ${pattern.toString()}`);
      break;
    }
  }

  if (!isWithinAllowedDirectories(request.cwd, policy.allowedWorkingDirectories)) {
    reasons.push(`Working directory "${request.cwd}" is not in the terminal allowlist.`);
  }

  return {
    allowed: reasons.length === 0,
    reasons
  };
}

export async function executeLocalTerminalCommand(
  request: TerminalExecutionRequest,
  policy = createTerminalExecutionPolicy()
): Promise<TerminalExecutionResult> {
  const command = normalizeRequestedCommand(request.command);
  const args = normalizeRequestedArgs(request.args);
  const runtimeStart = Date.now();
  const evaluation = evaluateTerminalExecutionRequest(
    {
      ...request,
      command,
      args
    },
    policy
  );

  if (!evaluation.allowed) {
    return {
      ok: false,
      blocked: true,
      command,
      args,
      cwd: request.cwd,
      exitCode: null,
      stdout: "",
      stderr: "",
      runtimeMs: Date.now() - runtimeStart,
      timedOut: false,
      error: evaluation.reasons.join(" ")
    };
  }

  try {
    const result = await execFileAsync(command, args, {
      cwd: request.cwd,
      env: request.env ? { ...process.env, ...request.env } : process.env,
      timeout: request.timeoutMs ?? policy.defaultTimeoutMs,
      maxBuffer: policy.maxBufferBytes
    });

    return {
      ok: true,
      blocked: false,
      command,
      args,
      cwd: request.cwd,
      exitCode: 0,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      runtimeMs: Date.now() - runtimeStart,
      timedOut: false
    };
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: string | number;
      killed?: boolean;
      signal?: NodeJS.Signals;
    };

    return {
      ok: false,
      blocked: false,
      command,
      args,
      cwd: request.cwd,
      exitCode: typeof typedError.code === "number" ? typedError.code : null,
      stdout: typedError.stdout ?? "",
      stderr: typedError.stderr ?? "",
      runtimeMs: Date.now() - runtimeStart,
      timedOut: typedError.killed === true || typedError.signal === "SIGTERM",
      error: typedError.message || "Terminal execution failed."
    };
  }
}

export function buildTerminalExecutionSummary(result: TerminalExecutionResult): string[] {
  return [
    `Terminal command: ${result.command}${result.args.length > 0 ? ` ${result.args.join(" ")}` : ""}`,
    `Allowed: ${result.blocked ? "no" : "yes"}`,
    `Succeeded: ${result.ok ? "yes" : "no"}`,
    `Timed out: ${result.timedOut ? "yes" : "no"}`,
    `Exit code: ${result.exitCode ?? "n/a"}`
  ];
}
