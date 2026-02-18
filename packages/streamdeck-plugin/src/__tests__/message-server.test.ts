import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

  describe("topic subscriptions", () => {
    it("subscribeToTopic sends SubscribeMessage to the active client", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage; // consume auto-activate

      const subscriber = { onStateUpdate: vi.fn() };
      const msgPromise = waitForMessage(ws);
      server.subscribeToTopic("git.status", subscriber);

      const msg = await msgPromise;
      expect(msg.id).toBe(MessageId.SubscribeMessage);
      expect(msg.data).toEqual({ topic: "git.status" });

      await closeClient(ws);
    });

    it("subscribeToTopic does not send a second SubscribeMessage for the same subscriber", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      const subscriber = { onStateUpdate: vi.fn() };
      const msgPromise = waitForMessage(ws);
      server.subscribeToTopic("git.status", subscriber);
      await msgPromise;

      let extraReceived = false;
      ws.once("message", () => { extraReceived = true; });
      server.subscribeToTopic("git.status", subscriber);
      await new Promise((r) => setTimeout(r, 80));

      expect(extraReceived).toBe(false);
      await closeClient(ws);
    });

    it("subscribeToTopic does not send a second SubscribeMessage for additional subscribers on the same topic", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      const subscriber1 = { onStateUpdate: vi.fn() };
      const subscriber2 = { onStateUpdate: vi.fn() };

      const msgPromise = waitForMessage(ws);
      server.subscribeToTopic("git.status", subscriber1);
      await msgPromise;

      let extraReceived = false;
      ws.once("message", () => { extraReceived = true; });
      server.subscribeToTopic("git.status", subscriber2);
      await new Promise((r) => setTimeout(r, 80));

      expect(extraReceived).toBe(false);
      await closeClient(ws);
    });

    it("unsubscribeFromTopic sends UnsubscribeMessage when the last subscriber is removed", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      const subscriber = { onStateUpdate: vi.fn() };
      const subMsgPromise = waitForMessage(ws);
      server.subscribeToTopic("git.status", subscriber);
      await subMsgPromise;

      const unsubMsgPromise = waitForMessage(ws);
      server.unsubscribeFromTopic("git.status", subscriber);

      const msg = await unsubMsgPromise;
      expect(msg.id).toBe(MessageId.UnsubscribeMessage);
      expect(msg.data).toEqual({ topic: "git.status" });

      await closeClient(ws);
    });

    it("unsubscribeFromTopic does not send UnsubscribeMessage while other subscribers remain", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      const subscriber1 = { onStateUpdate: vi.fn() };
      const subscriber2 = { onStateUpdate: vi.fn() };

      const subMsgPromise = waitForMessage(ws);
      server.subscribeToTopic("git.status", subscriber1);
      await subMsgPromise;
      server.subscribeToTopic("git.status", subscriber2);

      let extraReceived = false;
      ws.once("message", () => { extraReceived = true; });
      server.unsubscribeFromTopic("git.status", subscriber1);
      await new Promise((r) => setTimeout(r, 80));

      expect(extraReceived).toBe(false);
      await closeClient(ws);
    });

    it("unsubscribeFromTopic is a no-op for unknown topics", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      let extraReceived = false;
      ws.once("message", () => { extraReceived = true; });
      server.unsubscribeFromTopic("unknown.topic", { onStateUpdate: vi.fn() });
      await new Promise((r) => setTimeout(r, 80));

      expect(extraReceived).toBe(false);
      await closeClient(ws);
    });

    it("StateUpdateMessage received from client is dispatched to subscribers", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      const subscriber = { onStateUpdate: vi.fn() };
      const subMsgPromise = waitForMessage(ws);
      server.subscribeToTopic("git.status", subscriber);
      await subMsgPromise;

      ws.send(encodeMessage(MessageId.StateUpdateMessage, { topic: "git.status", state: { branch: "main" } }));

      await vi.waitFor(() => {
        expect(subscriber.onStateUpdate).toHaveBeenCalledWith("git.status", { branch: "main" });
      }, { timeout: 500 });

      await closeClient(ws);
    });

    it("StateUpdateMessage for an unknown topic is silently ignored", async () => {
      const { ws, firstMessage } = await connectClient("session-1");
      await firstMessage;

      // No subscriber registered — sending StateUpdateMessage must not throw
      ws.send(encodeMessage(MessageId.StateUpdateMessage, { topic: "unknown.topic", state: {} }));
      await new Promise((r) => setTimeout(r, 80));
      // If we reach here without error the test passes

      await closeClient(ws);
    });

    it("re-sends SubscribeMessages to a newly active client for all subscribed topics", async () => {
      // Register subscriptions before any client connects
      const subscriber1 = { onStateUpdate: vi.fn() };
      const subscriber2 = { onStateUpdate: vi.fn() };
      server.subscribeToTopic("git.status", subscriber1);
      server.subscribeToTopic("debug.state", subscriber2);

      // Connect and eagerly collect all messages (2 SubscribeMessages + 1 ActiveSessionChanged)
      const messages: { id: string; data: unknown }[] = [];
      const ws = new WebSocket(`ws://${TEST_HOST}:${TEST_PORT}`, {
        headers: { [SESSION_HEADER]: "session-reconnect" },
      });

      const allReceived = new Promise<void>((resolve) => {
        ws.on("message", (raw) => {
          messages.push(decodeMessage(raw.toString()));
          if (messages.length >= 3) resolve();
        });
      });

      await new Promise<void>((resolve, reject) => {
        ws.on("open", resolve);
        ws.on("error", reject);
      });

      await allReceived;

      const subscribeMsgs = messages.filter((m) => m.id === MessageId.SubscribeMessage);
      expect(subscribeMsgs).toHaveLength(2);

      const topics = subscribeMsgs.map((m) => (m.data as { topic: string }).topic);
      expect(topics).toContain("git.status");
      expect(topics).toContain("debug.state");

      await closeClient(ws);
    });
  });
});
