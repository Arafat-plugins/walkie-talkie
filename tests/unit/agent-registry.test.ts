import assert from "node:assert/strict";
import { test } from "node:test";

import { AgentRegistryStore, createAgentDefinition } from "../../packages/agents/src/index.ts";

function createAgent(id: string, name: string) {
  return createAgentDefinition({
    id,
    name,
    prompt: `Prompt for ${name}`,
    model: {
      provider: "openai-compatible",
      model: "gpt-5-mini"
    },
    tags: ["demo"]
  });
}

test("AgentRegistryStore can seed and inspect stored agents", () => {
  const registry = new AgentRegistryStore();
  const firstAgent = createAgent("agent-1", "Agent One");
  const secondAgent = createAgent("agent-2", "Agent Two");

  registry.seed(firstAgent);
  registry.seed(secondAgent);

  assert.equal(registry.count(), 2);
  assert.equal(registry.contains("agent-1"), true);
  assert.equal(registry.contains("missing-agent"), false);

  const snapshot = registry.snapshot();
  assert.equal(snapshot.length, 2);
  assert.equal(snapshot[0]?.id, "agent-1");
  assert.equal(snapshot[1]?.id, "agent-2");
});

test("AgentRegistryStore create/list/get provide public registry API", () => {
  const registry = new AgentRegistryStore();

  const created = registry.create({
    id: "daily-reminder-agent",
    name: "Daily Reminder Agent",
    prompt: "Remind the user about tasks.",
    model: {
      provider: "openai-compatible",
      model: "gpt-5-mini"
    },
    tags: ["reminder"]
  });

  assert.equal(created.id, "daily-reminder-agent");
  assert.equal(created.status, "active");
  assert.equal(registry.list().length, 1);
  assert.equal(registry.get("daily-reminder-agent")?.name, "Daily Reminder Agent");
  assert.equal(registry.get("missing-agent"), undefined);
});

test("AgentRegistryStore create blocks duplicate ids", () => {
  const registry = new AgentRegistryStore();

  registry.create({
    id: "daily-reminder-agent",
    name: "Daily Reminder Agent",
    prompt: "Remind the user about tasks.",
    model: {
      provider: "openai-compatible",
      model: "gpt-5-mini"
    }
  });

  assert.throws(
    () =>
      registry.create({
        id: "daily-reminder-agent",
        name: "Duplicate Agent",
        prompt: "Duplicate prompt.",
        model: {
          provider: "openai-compatible",
          model: "gpt-5-mini"
        }
      }),
    /already exists/
  );
});

test("AgentRegistryStore create and list return cloned agent definitions", () => {
  const registry = new AgentRegistryStore();

  const created = registry.create({
    id: "approval-agent",
    name: "Approval Agent",
    prompt: "Draft replies and wait for approval.",
    model: {
      provider: "openai-compatible",
      model: "gpt-5-mini"
    },
    skills: [{ skillId: "email-draft", required: true }],
    tags: ["email"]
  });

  created.skills[0].skillId = "mutated-created-skill";
  created.tags.push("changed-created");

  const listed = registry.list();
  listed[0].skills[0].skillId = "mutated-listed-skill";
  listed[0].tags.push("changed-listed");

  const freshRead = registry.get("approval-agent");
  assert.equal(freshRead?.skills[0]?.skillId, "email-draft");
  assert.deepEqual(freshRead?.tags, ["email"]);
});

test("AgentRegistryStore returns cloned snapshots instead of mutable references", () => {
  const registry = new AgentRegistryStore();
  registry.seed(
    createAgentDefinition({
      id: "agent-1",
      name: "Agent One",
      prompt: "Original prompt",
      model: {
        provider: "openai-compatible",
        model: "gpt-5-mini"
      },
      skills: [{ skillId: "telegram-send", required: true }],
      tags: ["original"]
    })
  );

  const agent = registry.snapshotById("agent-1");
  assert.ok(agent);
  if (!agent) {
    return;
  }

  agent.skills[0].skillId = "mutated";
  agent.tags.push("changed");

  const freshRead = registry.snapshotById("agent-1");
  assert.equal(freshRead?.skills[0]?.skillId, "telegram-send");
  assert.deepEqual(freshRead?.tags, ["original"]);
});
