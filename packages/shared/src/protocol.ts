import { MessageEnvelope } from "./messages/envelope";

export function encodeMessage(id: string, data: unknown): string {
  const envelope: MessageEnvelope = {
    id,
    data: JSON.stringify(data),
  };
  return JSON.stringify(envelope);
}

export function decodeMessage(raw: string): { id: string; data: unknown } {
  const envelope: MessageEnvelope = JSON.parse(raw);
  return {
    id: envelope.id,
    data: JSON.parse(envelope.data),
  };
}
