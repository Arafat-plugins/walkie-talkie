import {
  createMcpServerDefinition,
  type McpServerDefinition,
  type McpServerDefinitionInput
} from "./mcp-contract.ts";

function cloneMcpServerDefinition(server: McpServerDefinition): McpServerDefinition {
  return {
    ...server,
    connection: {
      ...server.connection,
      args: [...(server.connection.args ?? [])]
    },
    auth: { ...server.auth },
    capabilities: server.capabilities.map((capability) => ({ ...capability })),
    tags: [...server.tags]
  };
}

export class InMemoryMcpRegistry {
  private readonly servers = new Map<string, McpServerDefinition>();

  protected store(server: McpServerDefinition): void {
    this.servers.set(server.id, cloneMcpServerDefinition(server));
  }

  protected read(serverId: string): McpServerDefinition | undefined {
    const server = this.servers.get(serverId);
    return server ? cloneMcpServerDefinition(server) : undefined;
  }

  protected readAll(): McpServerDefinition[] {
    return Array.from(this.servers.values(), (server) => cloneMcpServerDefinition(server));
  }

  protected has(serverId: string): boolean {
    return this.servers.has(serverId);
  }

  protected remove(serverId: string): boolean {
    return this.servers.delete(serverId);
  }
}

export class McpRegistryStore extends InMemoryMcpRegistry {
  register(input: McpServerDefinitionInput): McpServerDefinition {
    if (this.has(input.id)) {
      throw new Error(`MCP server with id "${input.id}" already exists.`);
    }

    const server = createMcpServerDefinition(input);
    this.store(server);
    return this.read(input.id) as McpServerDefinition;
  }

  unregister(serverId: string): boolean {
    return this.remove(serverId);
  }

  list(): McpServerDefinition[] {
    return this.readAll();
  }

  get(serverId: string): McpServerDefinition | undefined {
    return this.read(serverId);
  }

  seed(server: McpServerDefinition): void {
    this.store(server);
  }

  contains(serverId: string): boolean {
    return this.has(serverId);
  }

  count(): number {
    return this.readAll().length;
  }

  snapshot(): McpServerDefinition[] {
    return this.readAll();
  }

  snapshotById(serverId: string): McpServerDefinition | undefined {
    return this.read(serverId);
  }
}
