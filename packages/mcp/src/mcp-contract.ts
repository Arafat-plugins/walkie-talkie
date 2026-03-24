export const MCP_CONTRACT_VERSION = "1" as const;

export const MCP_TRANSPORTS = ["stdio", "http", "sse"] as const;

export const MCP_SERVER_STATUSES = ["active", "paused", "disabled"] as const;

export const MCP_AUTH_TYPES = ["none", "token", "header"] as const;

export type McpTransport = (typeof MCP_TRANSPORTS)[number];
export type McpServerStatus = (typeof MCP_SERVER_STATUSES)[number];
export type McpAuthType = (typeof MCP_AUTH_TYPES)[number];

export type McpServerAuth = {
  type: McpAuthType;
  tokenEnvKey?: string;
  headerName?: string;
};

export type McpServerCapability = {
  id: string;
  description?: string;
};

export type McpServerConnection = {
  transport: McpTransport;
  command?: string;
  args?: string[];
  url?: string;
};

export type McpServerDefinition = {
  version: typeof MCP_CONTRACT_VERSION;
  id: string;
  name: string;
  description?: string;
  status: McpServerStatus;
  connection: McpServerConnection;
  auth: McpServerAuth;
  capabilities: McpServerCapability[];
  tags: string[];
};

export type McpServerDefinitionInput = {
  id: string;
  name: string;
  description?: string;
  status?: McpServerStatus;
  connection: McpServerConnection;
  auth?: McpServerAuth;
  capabilities?: McpServerCapability[];
  tags?: string[];
};

export function createMcpServerDefinition(input: McpServerDefinitionInput): McpServerDefinition {
  return {
    version: MCP_CONTRACT_VERSION,
    id: input.id,
    name: input.name,
    description: input.description,
    status: input.status ?? "active",
    connection: {
      ...input.connection,
      args: [...(input.connection.args ?? [])]
    },
    auth: input.auth
      ? {
          ...input.auth
        }
      : {
          type: "none"
        },
    capabilities: input.capabilities?.map((capability) => ({ ...capability })) ?? [],
    tags: [...(input.tags ?? [])]
  };
}
