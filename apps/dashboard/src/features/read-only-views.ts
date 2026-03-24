import type { AgentDefinition } from "../../../../packages/agents/src/index.ts";
import type { McpServerDefinition } from "../../../../packages/mcp/src/index.ts";
import type { SkillDefinition } from "../../../../packages/skills/src/index.ts";

export type DashboardEntityCard = {
  id: string;
  title: string;
  subtitle: string;
  meta: string[];
};

export type DashboardReadOnlyViewsModel = {
  agents: DashboardEntityCard[];
  skills: DashboardEntityCard[];
  mcpServers: DashboardEntityCard[];
};

function summarizeAgent(agent: AgentDefinition): DashboardEntityCard {
  return {
    id: agent.id,
    title: agent.name,
    subtitle: agent.prompt,
    meta: [
      `status=${agent.status}`,
      `mode=${agent.executionMode}`,
      `triggers=${agent.triggers.length}`,
      `skills=${agent.skills.length}`
    ]
  };
}

function summarizeSkill(skill: SkillDefinition): DashboardEntityCard {
  return {
    id: skill.id,
    title: skill.name,
    subtitle: skill.description ?? "No description yet.",
    meta: [
      `status=${skill.status}`,
      `execution=${skill.executionMode}`,
      `parameters=${skill.parameters.length}`
    ]
  };
}

function summarizeMcpServer(server: McpServerDefinition): DashboardEntityCard {
  return {
    id: server.id,
    title: server.name,
    subtitle: `${server.connection.transport} transport`,
    meta: [
      `status=${server.status}`,
      `capabilities=${server.capabilities.length}`,
      `auth=${server.auth.type}`
    ]
  };
}

export function createDashboardReadOnlyViewsModel(input: {
  agents: AgentDefinition[];
  skills: SkillDefinition[];
  mcpServers: McpServerDefinition[];
}): DashboardReadOnlyViewsModel {
  return {
    agents: input.agents.map((agent) => summarizeAgent(agent)),
    skills: input.skills.map((skill) => summarizeSkill(skill)),
    mcpServers: input.mcpServers.map((server) => summarizeMcpServer(server))
  };
}

export function buildDashboardReadOnlySummary(model: DashboardReadOnlyViewsModel): string[] {
  return [
    `Agents: ${model.agents.map((entry) => entry.title).join(", ") || "none"}`,
    `Skills: ${model.skills.map((entry) => entry.title).join(", ") || "none"}`,
    `MCP: ${model.mcpServers.map((entry) => entry.title).join(", ") || "none"}`
  ];
}
