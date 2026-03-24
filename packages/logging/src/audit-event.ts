export const AUDIT_EVENT_ACTOR_TYPES = ["system", "user", "agent", "integration"] as const;
export const AUDIT_EVENT_OUTCOMES = ["started", "success", "failure", "blocked"] as const;

export type AuditEventActorType = (typeof AUDIT_EVENT_ACTOR_TYPES)[number];
export type AuditEventOutcome = (typeof AUDIT_EVENT_OUTCOMES)[number];

export type AuditEventMetadata = {
  [key: string]: string | number | boolean | undefined;
};

export type AuditEventActor = {
  type: AuditEventActorType;
  id: string;
  name?: string;
};

export type AuditEventTarget = {
  kind: string;
  id: string;
  name?: string;
};

export type AuditEvent = {
  id: string;
  category: string;
  action: string;
  outcome: AuditEventOutcome;
  occurredAt: string;
  actor?: AuditEventActor;
  target?: AuditEventTarget;
  metadata?: AuditEventMetadata;
};

export type AuditEventStoreFilter = {
  category?: string;
  action?: string;
  outcome?: AuditEventOutcome;
  targetId?: string;
};

export type AuditEventStore = {
  append(event: AuditEvent): void | Promise<void>;
  list(filter?: AuditEventStoreFilter): AuditEvent[] | Promise<AuditEvent[]>;
};

export function createAuditEvent(input: {
  id: string;
  category: string;
  action: string;
  outcome?: AuditEventOutcome;
  actor?: AuditEventActor;
  target?: AuditEventTarget;
  metadata?: AuditEventMetadata;
  now?: () => string;
}): AuditEvent {
  return {
    id: input.id,
    category: input.category,
    action: input.action,
    outcome: input.outcome ?? "success",
    occurredAt: (input.now ?? (() => new Date().toISOString()))(),
    actor: input.actor ? { ...input.actor } : undefined,
    target: input.target ? { ...input.target } : undefined,
    metadata: input.metadata ? { ...input.metadata } : undefined
  };
}

export function buildAuditEventSummary(event: AuditEvent): string[] {
  const lines = [
    `Audit: ${event.category}/${event.action}`,
    `Outcome: ${event.outcome}`,
    `Occurred At: ${event.occurredAt}`
  ];

  if (event.actor) {
    lines.push(`Actor: ${event.actor.type}/${event.actor.id}`);
  }

  if (event.target) {
    lines.push(`Target: ${event.target.kind}/${event.target.id}`);
  }

  return lines;
}

export function createNoopAuditEventStore(): AuditEventStore {
  return {
    append() {
      return;
    },
    list() {
      return [];
    }
  };
}
