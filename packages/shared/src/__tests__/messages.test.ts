import { describe, it, expect } from "vitest";
import { MessageId } from "../messages/envelope";

describe("MessageId enum", () => {
  it("values match class names for protocol compatibility", () => {
    expect(MessageId.ExecuteCommandMessage).toBe("ExecuteCommandMessage");
    expect(MessageId.ExecuteTerminalCommandMessage).toBe("ExecuteTerminalCommandMessage");
    expect(MessageId.CreateTerminalMessage).toBe("CreateTerminalMessage");
    expect(MessageId.InsertSnippetMessage).toBe("InsertSnippetMessage");
    expect(MessageId.ChangeLanguageMessage).toBe("ChangeLanguageMessage");
    expect(MessageId.OpenFolderMessage).toBe("OpenFolderMessage");
    expect(MessageId.ActiveSessionChangedMessage).toBe("ActiveSessionChangedMessage");
    expect(MessageId.ChangeActiveSessionMessage).toBe("ChangeActiveSessionMessage");
  });

  it("has exactly 8 message types", () => {
    const values = Object.values(MessageId);
    expect(values).toHaveLength(8);
  });
});
