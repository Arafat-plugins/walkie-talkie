import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { createAgentDefinition } from "../../packages/agents/src/index.ts";
import { createMcpServerDefinition } from "../../packages/mcp/src/index.ts";
import { createPipelineDefinition } from "../../packages/pipeline/src/index.ts";
import {
  createEntityStorageSnapshot,
  loadEntityStorageFile,
  resolveEntityStoragePath,
  serializeEntityStorageSnapshot,
  writeEntityStorageFile
} from "../../packages/shared/src/index.ts";
import { createSkillDefinition } from "../../packages/skills/src/index.ts";

function createEntitySnapshot() {
  return createEntityStorageSnapshot({
    agents: [
      createAgentDefinition({
        id: "agent-1",
        name: "Router",
        prompt: "Route incoming tasks.",
        model: {
          provider: "default-ai",
          model: "gpt-4o-mini"
        },
        tags: ["ops"]
      })
    ],
    skills: [
      createSkillDefinition({
        id: "skill-1",
        name: "Cursor Check",
        tags: ["server"],
        handler: async () => ({
          ok: true,
          output: "ready"
        })
      })
    ],
    mcpServers: [
      createMcpServerDefinition({
        id: "mcp-1",
        name: "Filesystem MCP",
        connection: {
          transport: "stdio",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem"]
        }
      })
    ],
    pipelines: [
      createPipelineDefinition({
        id: "pipeline-1",
        name: "Ops Pipeline",
        startNodeId: "trigger-1",
        nodes: [{ id: "trigger-1", type: "trigger", label: "Trigger" }],
        edges: []
      })
    ],
    now: () => "2026-03-24T20:00:00.000Z"
  });
}

test("resolveEntityStoragePath places entity snapshot under local storage directory", () => {
  const resolved = resolveEntityStoragePath("/tmp/walkie-demo");
  assert.equal(resolved, "/tmp/walkie-demo/.walkie-talkie/storage/entities.snapshot.json");
});

test("serializeEntityStorageSnapshot omits runtime skill handlers", () => {
  const serialized = serializeEntityStorageSnapshot(createEntitySnapshot());

  assert.match(serialized, /"agents"/);
  assert.match(serialized, /"skills"/);
  assert.doesNotMatch(serialized, /handler/);
  assert.ok(serialized.endsWith("\n"));
});

test("writeEntityStorageFile persists snapshot and loadEntityStorageFile hydrates placeholder handlers", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-entity-store-"));
  const storagePath = resolveEntityStoragePath(tempDir);

  try {
    await writeEntityStorageFile(storagePath, createEntitySnapshot());
    const onDisk = await readFile(storagePath, "utf8");

    assert.match(onDisk, /"pipeline-1"/);
    assert.doesNotMatch(onDisk, /handler/);

    const loaded = await loadEntityStorageFile(storagePath);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) {
      return;
    }

    assert.equal(loaded.snapshot.agents[0]?.id, "agent-1");
    assert.equal(loaded.snapshot.skills[0]?.id, "skill-1");
    assert.equal(loaded.snapshot.mcpServers[0]?.id, "mcp-1");
    assert.equal(loaded.snapshot.pipelines[0]?.id, "pipeline-1");

    const skillResult = await loaded.snapshot.skills[0]?.handler({
      input: {
        text: "check cursor"
      }
    });

    assert.deepEqual(skillResult, {
      ok: false,
      error: 'Skill "skill-1" was loaded from file storage without a runtime handler.'
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("loadEntityStorageFile returns version issue for invalid snapshot version", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "walkie-talkie-entity-store-"));
  const storagePath = join(tempDir, "broken-entities.json");

  try {
    await writeFile(
      storagePath,
      JSON.stringify({
        version: "2",
        updatedAt: "2026-03-24T20:00:00.000Z",
        agents: [],
        skills: [],
        mcpServers: [],
        pipelines: []
      }),
      "utf8"
    );

    const loaded = await loadEntityStorageFile(storagePath);
    assert.equal(loaded.ok, false);
    if (loaded.ok) {
      return;
    }

    assert.equal(loaded.issues[0]?.path, "version");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
