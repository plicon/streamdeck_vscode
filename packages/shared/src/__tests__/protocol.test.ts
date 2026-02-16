import { describe, it, expect } from "vitest";
import { encodeMessage, decodeMessage } from "../protocol";
import { MessageId } from "../messages/envelope";

describe("protocol", () => {
  describe("encodeMessage", () => {
    it("produces a double-serialized JSON envelope", () => {
      const result = encodeMessage(MessageId.ExecuteCommandMessage, {
        command: "workbench.action.tasks.runTask",
        arguments: "",
      });

      const parsed = JSON.parse(result);
      expect(parsed.id).toBe("ExecuteCommandMessage");
      expect(typeof parsed.data).toBe("string");

      const inner = JSON.parse(parsed.data);
      expect(inner.command).toBe("workbench.action.tasks.runTask");
      expect(inner.arguments).toBe("");
    });

    it("uses the provided message id string", () => {
      const result = encodeMessage("CustomMessage", { foo: 42 });
      const parsed = JSON.parse(result);
      expect(parsed.id).toBe("CustomMessage");
    });
  });

  describe("decodeMessage", () => {
    it("decodes a double-serialized envelope", () => {
      const raw = JSON.stringify({
        id: "ChangeLanguageMessage",
        data: JSON.stringify({ languageId: "typescript" }),
      });

      const { id, data } = decodeMessage(raw);
      expect(id).toBe("ChangeLanguageMessage");
      expect(data).toEqual({ languageId: "typescript" });
    });

    it("throws on invalid JSON", () => {
      expect(() => decodeMessage("not json")).toThrow();
    });

    it("throws when data field is not valid JSON", () => {
      const raw = JSON.stringify({ id: "Test", data: "not json" });
      expect(() => decodeMessage(raw)).toThrow();
    });
  });

  describe("roundtrip", () => {
    it("encode then decode returns original payload", () => {
      const payload = {
        name: "my-terminal",
        preserveFocus: true,
        shellPath: "/bin/zsh",
      };

      const encoded = encodeMessage(MessageId.CreateTerminalMessage, payload);
      const { id, data } = decodeMessage(encoded);

      expect(id).toBe(MessageId.CreateTerminalMessage);
      expect(data).toEqual(payload);
    });
  });
});
