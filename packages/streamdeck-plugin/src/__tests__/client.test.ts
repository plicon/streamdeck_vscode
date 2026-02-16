import { describe, it, expect, vi } from "vitest";
import WebSocket from "ws";
import { Client } from "../server/client";
import { MessageId } from "@streamdeck-vscode/shared";

describe("Client", () => {
  it("sends a double-serialized envelope via the socket", () => {
    const mockSend = vi.fn();
    const mockSocket = { readyState: WebSocket.OPEN, send: mockSend } as unknown as WebSocket;

    const client = new Client("id-1", mockSocket, "session-1");
    client.send(MessageId.ExecuteCommandMessage, { command: "editor.action.formatDocument", arguments: "" });

    expect(mockSend).toHaveBeenCalledOnce();

    const sent = JSON.parse(mockSend.mock.calls[0][0]);
    expect(sent.id).toBe("ExecuteCommandMessage");

    const inner = JSON.parse(sent.data);
    expect(inner.command).toBe("editor.action.formatDocument");
  });

  it("does not send when socket is not open", () => {
    const mockSend = vi.fn();
    const mockSocket = { readyState: WebSocket.CLOSED, send: mockSend } as unknown as WebSocket;

    const client = new Client("id-1", mockSocket, "session-1");
    client.send(MessageId.ExecuteCommandMessage, { command: "test" });

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("exposes id and sessionId", () => {
    const mockSocket = { readyState: WebSocket.OPEN, send: vi.fn() } as unknown as WebSocket;
    const client = new Client("my-id", mockSocket, "my-session");

    expect(client.id).toBe("my-id");
    expect(client.sessionId).toBe("my-session");
  });
});
