import { describe, it, expect } from "vitest";
import { encodeMessage, decodeMessage } from "../protocol";
import { MessageId } from "../messages/envelope";
import type { NavigateToFilePayload } from "../messages/navigate-to-file";
import type { SwitchProfilePayload } from "../messages/switch-profile";

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
});
