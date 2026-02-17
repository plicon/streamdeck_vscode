import { describe, it, expect, beforeEach, afterEach } from "vitest";
import WebSocket from "ws";
import { MessageServer } from "../server/message-server";
import { encodeMessage, decodeMessage, MessageId, SESSION_HEADER } from "@streamdeck-vscode/shared";

const TEST_PORT = 48970;
const TEST_HOST = "127.0.0.1";

/**
 * Connect a client and eagerly attach a message listener so no messages are
 * lost to the race between the server's `process.nextTick` send and the
 * test registering `waitForMessage`.
 */
function connectClient(sessionId: string): Promise<{ ws: WebSocket; firstMessage: Promise<{ id: string; data: unknown }> }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${TEST_HOST}:${TEST_PORT}`, {
      headers: { [SESSION_HEADER]: sessionId },
    });

    // Attach the message listener immediately so we never miss the auto-activate
    const firstMessage = new Promise<{ id: string; data: unknown }>((res) => {
      ws.once("message", (raw) => {
        res(decodeMessage(raw.toString()));
      });
    });

    ws.on("open", () => resolve({ ws, firstMessage }));
    ws.on("error", reject);
  });
}

function waitForMessage(ws: WebSocket): Promise<{ id: string; data: unknown }> {
  return new Promise((resolve) => {
    ws.once("message", (raw) => {
      resolve(decodeMessage(raw.toString()));
    });
  });
}

function closeClient(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    if (ws.readyState === WebSocket.CLOSED) {
      resolve();
      return;
    }
    ws.on("close", () => resolve());
    ws.close();
  });
}

describe("MessageServer", () => {
  let server: MessageServer;

  beforeEach(() => {
    server = new MessageServer(TEST_HOST, TEST_PORT);
    server.start();
  });

  afterEach(() => {
    server.dispose();
  });

  it("accepts a WebSocket connection", async () => {
    const { ws } = await connectClient("session-1");
    expect(ws.readyState).toBe(WebSocket.OPEN);
    await closeClient(ws);
  });

  it("auto-activates a single connected client", async () => {
    const { ws, firstMessage } = await connectClient("session-abc");

    const msg = await firstMessage;
    expect(msg.id).toBe(MessageId.ActiveSessionChangedMessage);
    expect(msg.data).toEqual({ sessionId: "session-abc" });

    await closeClient(ws);
  });

  it("sets currentClient when a client connects", async () => {
    expect(server.currentClient).toBeNull();

    const { ws, firstMessage } = await connectClient("session-1");
    await firstMessage;

    expect(server.currentClient).not.toBeNull();
    expect(server.currentClient!.sessionId).toBe("session-1");

    await closeClient(ws);
  });

  it("broadcasts ActiveSessionChanged to all clients on ChangeActiveSession", async () => {
    const { ws: ws1, firstMessage: autoActivate1 } = await connectClient("session-1");
    await autoActivate1;

    const { ws: ws2 } = await connectClient("session-2");

    // Set up listeners before sending so we don't miss the broadcast
    const msg1Promise = waitForMessage(ws1);
    const msg2Promise = waitForMessage(ws2);

    ws2.send(
      encodeMessage(MessageId.ChangeActiveSessionMessage, { sessionId: "session-2" }),
    );

    const [msg1, msg2] = await Promise.all([msg1Promise, msg2Promise]);

    expect(msg1.id).toBe(MessageId.ActiveSessionChangedMessage);
    expect(msg1.data).toEqual({ sessionId: "session-2" });
    expect(msg2.id).toBe(MessageId.ActiveSessionChangedMessage);
    expect(msg2.data).toEqual({ sessionId: "session-2" });

    await Promise.all([closeClient(ws1), closeClient(ws2)]);
  });

  it("updates currentClient on ChangeActiveSession", async () => {
    const { ws: ws1, firstMessage: autoActivate1 } = await connectClient("session-1");
    await autoActivate1;

    const { ws: ws2 } = await connectClient("session-2");

    const msg1Promise = waitForMessage(ws1);
    const msg2Promise = waitForMessage(ws2);

    ws2.send(
      encodeMessage(MessageId.ChangeActiveSessionMessage, { sessionId: "session-2" }),
    );

    await Promise.all([msg1Promise, msg2Promise]);

    expect(server.currentClient!.sessionId).toBe("session-2");

    await Promise.all([closeClient(ws1), closeClient(ws2)]);
  });
});
