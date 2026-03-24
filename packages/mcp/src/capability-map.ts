import type { McpServerDefinition } from "./mcp-contract.ts";

export type McpCapabilityMap = Map<string, string[]>;

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function buildMcpCapabilityMap(servers: McpServerDefinition[]): McpCapabilityMap {
  const capabilityMap: McpCapabilityMap = new Map();

  for (const server of servers) {
    for (const capability of server.capabilities) {
      const serverIds = capabilityMap.get(capability.id) ?? [];
      serverIds.push(server.id);
      capabilityMap.set(capability.id, uniqueSorted(serverIds));
    }
  }

  return capabilityMap;
}

export function listServersForCapability(
  capabilityMap: McpCapabilityMap,
  capabilityId: string
): string[] {
  return [...(capabilityMap.get(capabilityId) ?? [])];
}

export function listCapabilitiesForServer(server: McpServerDefinition): string[] {
  return server.capabilities.map((capability) => capability.id);
}

export function hasCapability(
  capabilityMap: McpCapabilityMap,
  capabilityId: string,
  serverId: string
): boolean {
  return (capabilityMap.get(capabilityId) ?? []).includes(serverId);
}
