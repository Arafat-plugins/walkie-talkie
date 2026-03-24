export const TRIGGER_EVENT_KINDS = ["cli", "schedule", "telegram", "webhook", "dashboard"] as const;

export type TriggerEventKind = (typeof TRIGGER_EVENT_KINDS)[number];

export type TriggerEvent = {
  kind: TriggerEventKind;
  eventName: string;
  sourceId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export function createTriggerEvent(input: TriggerEvent): TriggerEvent {
  return {
    ...input,
    payload: { ...input.payload }
  };
}
