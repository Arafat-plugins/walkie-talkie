import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LOG_LEVELS,
  createLogEntry,
  createNoopLogger,
  isLogLevelEnabled
} from "../../packages/logging/src/index.ts";

test("logging contract exposes ordered levels", () => {
  assert.deepEqual(LOG_LEVELS, ["debug", "info", "warning", "error"]);
});

test("createLogEntry builds timestamped immutable-ish log entry", () => {
  const entry = createLogEntry({
    level: "info",
    message: "Pipeline started.",
    context: {
      scope: "runtime",
      pipelineId: "telegram-cursor-check"
    },
    now: () => "2026-03-21T18:00:00.000Z"
  });

  assert.deepEqual(entry, {
    level: "info",
    message: "Pipeline started.",
    timestamp: "2026-03-21T18:00:00.000Z",
    context: {
      scope: "runtime",
      pipelineId: "telegram-cursor-check"
    }
  });
});

test("isLogLevelEnabled respects level ordering", () => {
  assert.equal(isLogLevelEnabled("info", "debug"), false);
  assert.equal(isLogLevelEnabled("info", "info"), true);
  assert.equal(isLogLevelEnabled("info", "warning"), true);
  assert.equal(isLogLevelEnabled("warning", "error"), true);
});

test("createNoopLogger safely accepts log calls", async () => {
  const logger = createNoopLogger();

  await assert.doesNotReject(async () => {
    await logger.log(
      createLogEntry({
        level: "debug",
        message: "Noop log.",
        now: () => "2026-03-21T18:00:00.000Z"
      })
    );
  });
});
