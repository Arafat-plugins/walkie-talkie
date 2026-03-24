import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildAuditEventSummary,
  createAuditEvent,
  createNoopAuditEventStore
} from "../../packages/logging/src/index.ts";

test("createAuditEvent builds normalized audit object", () => {
  const event = createAuditEvent({
    id: "audit-1",
    category: "runtime",
    action: "pipeline.execute",
    actor: {
      type: "system",
      id: "walkie-talkie"
    },
    target: {
      kind: "pipeline",
      id: "telegram-check"
    },
    metadata: {
      runId: "run-1",
      success: true
    },
    now: () => "2026-03-22T10:00:00.000Z"
  });

  assert.deepEqual(event, {
    id: "audit-1",
    category: "runtime",
    action: "pipeline.execute",
    outcome: "success",
    occurredAt: "2026-03-22T10:00:00.000Z",
    actor: {
      type: "system",
      id: "walkie-talkie"
    },
    target: {
      kind: "pipeline",
      id: "telegram-check"
    },
    metadata: {
      runId: "run-1",
      success: true
    }
  });
});

test("buildAuditEventSummary returns readable lines", () => {
  const event = createAuditEvent({
    id: "audit-2",
    category: "integration",
    action: "telegram.receive",
    outcome: "started",
    actor: {
      type: "integration",
      id: "telegram"
    },
    target: {
      kind: "trigger",
      id: "telegram.message.received"
    },
    now: () => "2026-03-22T10:05:00.000Z"
  });

  assert.deepEqual(buildAuditEventSummary(event), [
    "Audit: integration/telegram.receive",
    "Outcome: started",
    "Occurred At: 2026-03-22T10:05:00.000Z",
    "Actor: integration/telegram",
    "Target: trigger/telegram.message.received"
  ]);
});

test("createNoopAuditEventStore safely accepts append and list calls", async () => {
  const store = createNoopAuditEventStore();
  const event = createAuditEvent({
    id: "audit-3",
    category: "provider",
    action: "ai.complete",
    outcome: "failure",
    now: () => "2026-03-22T10:10:00.000Z"
  });

  await assert.doesNotReject(async () => {
    await store.append(event);
  });

  assert.deepEqual(await store.list(), []);
});
