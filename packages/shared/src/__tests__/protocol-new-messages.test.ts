import { describe, it, expect } from "vitest";
import { encodeMessage, decodeMessage } from "../protocol";
import { MessageId } from "../messages/envelope";
import type { NavigateToFilePayload } from "../messages/navigate-to-file";
import type { SwitchProfilePayload } from "../messages/switch-profile";
import type { SubscribePayload } from "../messages/subscribe";
import type { UnsubscribePayload } from "../messages/unsubscribe";
import type { StateUpdatePayload } from "../messages/state-update";

describe("protocol — new message types", () => {
  describe("NavigateToFileMessage", () => {
    it("roundtrips NavigateToFilePayload", () => {
      const payload: NavigateToFilePayload = {
        filePath: "/Users/dev/project/src/index.ts",
      };

      const encoded = encodeMessage(MessageId.NavigateToFileMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.NavigateToFileMessage);
      expect(data).toEqual(payload);
    });

    it("produces correct envelope structure", () => {
      const payload: NavigateToFilePayload = { filePath: "/tmp/test.txt" };
      const encoded = encodeMessage(MessageId.NavigateToFileMessage, payload);
      const parsed = JSON.parse(encoded);

      expect(parsed.id).toBe("NavigateToFileMessage");
      expect(typeof parsed.data).toBe("string");
      expect(JSON.parse(parsed.data).filePath).toBe("/tmp/test.txt");
    });
  });

  describe("SwitchProfileMessage", () => {
    it("roundtrips SwitchProfilePayload", () => {
      const payload: SwitchProfilePayload = {
        profileName: "Python Development",
      };

      const encoded = encodeMessage(MessageId.SwitchProfileMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.SwitchProfileMessage);
      expect(data).toEqual(payload);
    });

    it("produces correct envelope structure", () => {
      const payload: SwitchProfilePayload = { profileName: "Default" };
      const encoded = encodeMessage(MessageId.SwitchProfileMessage, payload);
      const parsed = JSON.parse(encoded);

      expect(parsed.id).toBe("SwitchProfileMessage");
      expect(typeof parsed.data).toBe("string");
      expect(JSON.parse(parsed.data).profileName).toBe("Default");
    });
  });

  describe("SubscribeMessage", () => {
    it("roundtrips SubscribePayload", () => {
      const payload: SubscribePayload = { topic: "git.status" };

      const encoded = encodeMessage(MessageId.SubscribeMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.SubscribeMessage);
      expect(data).toEqual(payload);
    });

    it("produces correct envelope structure", () => {
      const payload: SubscribePayload = { topic: "debug.state" };
      const encoded = encodeMessage(MessageId.SubscribeMessage, payload);
      const parsed = JSON.parse(encoded);

      expect(parsed.id).toBe("SubscribeMessage");
      expect(typeof parsed.data).toBe("string");
      expect(JSON.parse(parsed.data).topic).toBe("debug.state");
    });
  });

  describe("UnsubscribeMessage", () => {
    it("roundtrips UnsubscribePayload", () => {
      const payload: UnsubscribePayload = { topic: "git.status" };

      const encoded = encodeMessage(MessageId.UnsubscribeMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.UnsubscribeMessage);
      expect(data).toEqual(payload);
    });

    it("produces correct envelope structure", () => {
      const payload: UnsubscribePayload = { topic: "debug.state" };
      const encoded = encodeMessage(MessageId.UnsubscribeMessage, payload);
      const parsed = JSON.parse(encoded);

      expect(parsed.id).toBe("UnsubscribeMessage");
      expect(typeof parsed.data).toBe("string");
      expect(JSON.parse(parsed.data).topic).toBe("debug.state");
    });
  });

  describe("StateUpdateMessage", () => {
    it("roundtrips StateUpdatePayload with a simple state object", () => {
      const payload: StateUpdatePayload = {
        topic: "git.status",
        state: { branch: "main", hasChanges: false },
      };

      const encoded = encodeMessage(MessageId.StateUpdateMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.StateUpdateMessage);
      expect(data).toEqual(payload);
    });

    it("roundtrips StateUpdatePayload with null state", () => {
      const payload: StateUpdatePayload = { topic: "debug.state", state: null };

      const encoded = encodeMessage(MessageId.StateUpdateMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.StateUpdateMessage);
      expect(data).toEqual(payload);
    });

    it("produces correct envelope structure", () => {
      const payload: StateUpdatePayload = { topic: "git.status", state: 42 };
      const encoded = encodeMessage(MessageId.StateUpdateMessage, payload);
      const parsed = JSON.parse(encoded);

      expect(parsed.id).toBe("StateUpdateMessage");
      expect(typeof parsed.data).toBe("string");
      const inner = JSON.parse(parsed.data);
      expect(inner.topic).toBe("git.status");
      expect(inner.state).toBe(42);
    });
  });
});
