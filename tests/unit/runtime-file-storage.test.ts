import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { createAuditEvent } from "../../packages/logging/src/index.ts";
import {
  createRuntimeStorageSnapshot,
  loadRuntimeStorageFile,
  resolveRuntimeStoragePath,
  serializeRuntimeStorageSnapshot,
  writeRuntimeStorageFile
} from "../../packages/shared/src/index.ts";

function createRuntimeSnapshot() {
  return createRuntimeStorageSnapshot({
    runs: [
      {
        runId: "run-1",
        pipelineId: "pipeline-1",
        pipelineName: "Ops Pipeline",
        triggerKind: "telegram",
        triggerEventName: "telegram.message.received",
        status: "success",
        startedAt: "2026-03-24T21:00:00.000Z",
        finishedAt: "2026-03-24T21:00:01.000Z"
      }
    ],
    auditEvents: [
      createAuditEvent({
        id: "audit-1",
        category: "pipeline",
        action: "execute",
        target: {
          kind: "pipeline",
          id: "pipeline-1"
        },
        metadata: {
          source: "telegram"
        },
        now: () => "2026-03-24T21:00:01.000Z"
      })
    ],
    now: () => "2026-03-24T21:00:02.000Z"
  });
}

test("resolveRuntimeStoragePath places runtime snapshot under local storage directory", () => {
  const resolved = resolveRuntimeStoragePath("/tmp/walkie-demo");
  assert.equal(resolved, "/tmp/walkie-demo/.walkie-talkie/storage/runtime.snapshot.json");
});

test("serializeRuntimeStorageSnapshot returns deterministic runtime json", () => {
  const serialized = serializeRuntimeStorageSnapshot(createRuntimeSnapshot());

  assert.match(serialized, /"runs"/);
  assert.match(serialized, /"auditEvents"/);
  assert.ok(serialized.endsWith("\n"));
});

test("writeRuntimeStorageFile persists snapshot and loadRuntimeStorageFile restores it", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-store-"));
  const storagePath = resolveRuntimeStoragePath(tempDir);

  try {
    await writeRuntimeStorageFile(storagePath, createRuntimeSnapshot());
    const onDisk = await readFile(storagePath, "utf8");

    assert.match(onDisk, /"run-1"/);
    assert.match(onDisk, /"audit-1"/);

    const loaded = await loadRuntimeStorageFile(storagePath);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) {
      return;
    }

    assert.equal(loaded.snapshot.runs[0]?.runId, "run-1");
    assert.equal(loaded.snapshot.auditEvents[0]?.id, "audit-1");
    assert.equal(loaded.snapshot.auditEvents[0]?.metadata?.source, "telegram");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("loadRuntimeStorageFile returns version issue for invalid snapshot version", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-runtime-store-"));
  const storagePath = join(tempDir, "broken-runtime.json");

  try {
    await writeFile(
      storagePath,
      JSON.stringify({
        version: "2",
        updatedAt: "2026-03-24T21:00:02.000Z",
        runs: [],
        auditEvents: []
      }),
      "utf8"
    );

    const loaded = await loadRuntimeStorageFile(storagePath);
    assert.equal(loaded.ok, false);
    if (loaded.ok) {
      return;
    }

    assert.equal(loaded.issues[0]?.path, "version");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
