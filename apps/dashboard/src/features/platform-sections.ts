import { createAgentDefinition } from "../../../../packages/agents/src/index.ts";
import { createMcpServerDefinition } from "../../../../packages/mcp/src/index.ts";
import { createPipelineDefinition } from "../../../../packages/pipeline/src/index.ts";
import { createSkillDefinition } from "../../../../packages/skills/src/index.ts";
import { createDashboardPipelineListModel, type DashboardPipelineListModel } from "./pipeline-list-view.ts";
import {
  createDashboardReadOnlyViewsModel,
  type DashboardEntityCard,
  type DashboardReadOnlyViewsModel
} from "./read-only-views.ts";

export type DashboardPlatformSectionsModel = {
  readOnlyViews: DashboardReadOnlyViewsModel;
  pipelineList: DashboardPipelineListModel;
};

function renderEntityCard(entry: DashboardEntityCard): string {
  return `
    <article class="wt-entity-card" data-entity-id="${entry.id}">
      <p class="wt-entity-card__eyebrow">${entry.id}</p>
      <h3 class="wt-entity-card__title">${entry.title}</h3>
      <p class="wt-entity-card__subtitle">${entry.subtitle}</p>
      <div class="wt-entity-card__meta">
        ${entry.meta.map((meta) => `<span>${meta}</span>`).join("")}
      </div>
    </article>
  `.trim();
}

function renderEntitySection(input: {
  title: string;
  eyebrow: string;
  description: string;
  entries: DashboardEntityCard[];
}): string {
  return `
    <section class="wt-section">
      <div class="wt-section__header">
        <p class="wt-section__eyebrow">${input.eyebrow}</p>
        <h2 class="wt-section__title">${input.title}</h2>
        <p class="wt-section__body">${input.description}</p>
      </div>
      <div class="wt-entity-grid">
        ${input.entries.map((entry) => renderEntityCard(entry)).join("")}
      </div>
    </section>
  `.trim();
}

export function createDashboardDemoPlatformSectionsModel(): DashboardPlatformSectionsModel {
  return {
    readOnlyViews: createDashboardReadOnlyViewsModel({
      agents: [
        createAgentDefinition({
          id: "telegram-router",
          name: "Telegram Router",
          description: "Routes incoming Telegram prompts into workflow execution.",
          prompt:
            "Classify operational requests, decide when a skill should run, and keep replies concise.",
          model: {
            provider: "primary-openai",
            model: "gpt-4o-mini"
          },
          skills: [
            { skillId: "cursor-check", required: true },
            { skillId: "runtime-brief", required: false }
          ],
          triggers: [{ kind: "telegram", event: "telegram.message.received" }],
          tags: ["telegram", "operations"]
        }),
        createAgentDefinition({
          id: "ops-briefing",
          name: "Ops Briefing Agent",
          description: "Summarizes system state for operator review.",
          prompt: "Surface the most relevant runtime changes and keep the update short.",
          model: {
            provider: "primary-openai",
            model: "gpt-4o-mini"
          },
          executionMode: "manual",
          skills: [{ skillId: "runtime-brief", required: true }],
          triggers: [{ kind: "dashboard", event: "dashboard.refresh" }],
          tags: ["dashboard", "status"]
        })
      ],
      skills: [
        createSkillDefinition({
          id: "cursor-check",
          name: "Cursor Check",
          description: "Checks whether Cursor is available on the target runtime.",
          parameters: [{ name: "targetHost", type: "string", required: false }],
          tags: ["system", "tool-first"],
          handler: async () => ({ ok: true, output: "Cursor is available." })
        }),
        createSkillDefinition({
          id: "runtime-brief",
          name: "Runtime Brief",
          description: "Builds a short runtime health summary for operators.",
          executionMode: "sync",
          parameters: [{ name: "scope", type: "string", required: false }],
          tags: ["dashboard", "summary"],
          handler: async () => ({ ok: true, output: "Runtime is stable." })
        })
      ],
      mcpServers: [
        createMcpServerDefinition({
          id: "filesystem-mcp",
          name: "Filesystem MCP",
          description: "Read-only filesystem context for operational workflows.",
          connection: {
            transport: "stdio",
            command: "npx",
            args: ["@modelcontextprotocol/server-filesystem"]
          },
          capabilities: [
            { id: "read-files", description: "Read files for workflow context." },
            { id: "stat-paths", description: "Inspect file metadata." }
          ],
          tags: ["filesystem", "read-only"]
        }),
        createMcpServerDefinition({
          id: "http-ops-mcp",
          name: "HTTP Ops MCP",
          description: "External status page fetch capability.",
          connection: {
            transport: "http",
            url: "https://ops.example.local/mcp"
          },
          auth: {
            type: "header",
            headerName: "x-ops-token"
          },
          capabilities: [{ id: "fetch-status", description: "Fetch status snapshots." }],
          tags: ["http", "ops"]
        })
      ]
    }),
    pipelineList: createDashboardPipelineListModel({
      pipelines: [
        createPipelineDefinition({
          id: "telegram-cursor-check",
          name: "Telegram Cursor Check",
          description: "Telegram message flows through router agent, skill, and response.",
          startNodeId: "trigger-telegram",
          nodes: [
            { id: "trigger-telegram", type: "trigger", label: "Telegram Trigger" },
            { id: "agent-router", type: "agent", label: "Router Agent", config: { refId: "telegram-router" } },
            { id: "skill-cursor", type: "skill", label: "Cursor Check", config: { refId: "cursor-check" } },
            { id: "response-send", type: "response", label: "Send Response" }
          ],
          edges: [
            { id: "edge-1", from: "trigger-telegram", to: "agent-router", type: "default" },
            { id: "edge-2", from: "agent-router", to: "skill-cursor", type: "default" },
            { id: "edge-3", from: "skill-cursor", to: "response-send", type: "default" }
          ],
          tags: ["telegram", "demo", "operations"]
        }),
        createPipelineDefinition({
          id: "dashboard-ops-briefing",
          name: "Dashboard Ops Briefing",
          description: "Manual dashboard refresh generates an operator briefing.",
          startNodeId: "trigger-dashboard",
          nodes: [
            { id: "trigger-dashboard", type: "trigger", label: "Dashboard Trigger" },
            { id: "agent-brief", type: "agent", label: "Briefing Agent", config: { refId: "ops-briefing" } },
            { id: "skill-brief", type: "skill", label: "Runtime Brief", config: { refId: "runtime-brief" } },
            { id: "response-dashboard", type: "response", label: "Update Panel" }
          ],
          edges: [
            { id: "edge-a", from: "trigger-dashboard", to: "agent-brief", type: "default" },
            { id: "edge-b", from: "agent-brief", to: "skill-brief", type: "default" },
            { id: "edge-c", from: "skill-brief", to: "response-dashboard", type: "default" }
          ],
          tags: ["dashboard", "summary"]
        })
      ]
    })
  };
}

export function buildDashboardPlatformSectionsMarkup(model: DashboardPlatformSectionsModel): string {
  return `
    <section class="wt-platform-stack">
      ${renderEntitySection({
        title: "Agents",
        eyebrow: "Control",
        description: "Operators can inspect the current agent roster, trigger coverage, and execution posture.",
        entries: model.readOnlyViews.agents
      })}
      ${renderEntitySection({
        title: "Skills",
        eyebrow: "Execution",
        description: "Tool and action primitives stay visible before live editing arrives.",
        entries: model.readOnlyViews.skills
      })}
      ${renderEntitySection({
        title: "MCP Servers",
        eyebrow: "Context",
        description: "External capability surfaces are mapped as explicit operator-visible systems.",
        entries: model.readOnlyViews.mcpServers
      })}
      ${renderEntitySection({
        title: "Pipelines",
        eyebrow: "Flow",
        description: "Rendered orchestration paths show how triggers move through agents and tools.",
        entries: model.pipelineList.pipelines
      })}
    </section>
  `.trim();
}
