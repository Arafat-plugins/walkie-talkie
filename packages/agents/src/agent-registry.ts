import { createAgentDefinition, type AgentDefinition, type AgentDefinitionInput } from "./agent-contract.ts";

function cloneAgentDefinition(agent: AgentDefinition): AgentDefinition {
  return {
    ...agent,
    model: { ...agent.model },
    skills: agent.skills.map((skill) => ({ ...skill })),
    triggers: agent.triggers.map((trigger) => ({ ...trigger })),
    tags: [...agent.tags]
  };
}

export class InMemoryAgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  protected store(agent: AgentDefinition): void {
    this.agents.set(agent.id, cloneAgentDefinition(agent));
  }

  protected read(agentId: string): AgentDefinition | undefined {
    const agent = this.agents.get(agentId);
    return agent ? cloneAgentDefinition(agent) : undefined;
  }

  protected readAll(): AgentDefinition[] {
    return Array.from(this.agents.values(), (agent) => cloneAgentDefinition(agent));
  }

  protected has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  protected size(): number {
    return this.agents.size;
  }
}

export class AgentRegistryStore extends InMemoryAgentRegistry {
  create(input: AgentDefinitionInput): AgentDefinition {
    if (this.has(input.id)) {
      throw new Error(`Agent with id "${input.id}" already exists.`);
    }

    const agent = createAgentDefinition(input);
    this.store(agent);
    return this.read(input.id) as AgentDefinition;
  }

  list(): AgentDefinition[] {
    return this.readAll();
  }

  get(agentId: string): AgentDefinition | undefined {
    return this.read(agentId);
  }

  seed(agent: AgentDefinition): void {
    this.store(agent);
  }

  contains(agentId: string): boolean {
    return this.has(agentId);
  }

  count(): number {
    return this.size();
  }

  snapshot(): AgentDefinition[] {
    return this.readAll();
  }

  snapshotById(agentId: string): AgentDefinition | undefined {
    return this.read(agentId);
  }
}
