import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { randomUUID } from "crypto";
import {
  decodeMessage,
  MessageId,
  SESSION_HEADER,
  ActiveSessionChangedPayload,
  ChangeActiveSessionPayload,
  StateUpdatePayload,
  SubscribePayload,
  UnsubscribePayload,
} from "@streamdeck-vscode/shared";
import { Client } from "./client";
import { TopicSubscriber } from "./topic-subscriber";

export class MessageServer {
  private readonly wss: WebSocketServer;
  private readonly connections = new Map<string, Client>();
  private _currentClient: Client | null = null;
  private readonly topicSubscribers = new Map<string, Set<TopicSubscriber>>();

  get currentClient(): Client | null {
    return this._currentClient;
  }

  constructor(host: string, port: number) {
    this.wss = new WebSocketServer({ host, port });
  }

  start(): void {
    console.log(`Starting server ws://${this.wss.options.host}:${this.wss.options.port}`);

    this.wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
      const clientId = randomUUID();
      const sessionId = (request.headers[SESSION_HEADER.toLowerCase()] as string) ?? "";
      const client = new Client(clientId, socket, sessionId);

      this.connections.set(clientId, client);

      socket.on("message", (raw) => this.onMessage(clientId, raw.toString()));
      socket.on("close", () => {
        this.connections.delete(clientId);
        this.tryActivateRemainingClient();
      });

      // Defer so the client's "open" handler fires before we send
      process.nextTick(() => this.tryActivateRemainingClient());
    });
  }

  private tryActivateRemainingClient(): void {
    if (this.connections.size === 1) {
      const client = this.connections.values().next().value!;
      if (client.sessionId) {
        this.setActiveSession(client.id, client.sessionId);
      }
    }
  }

  subscribeToTopic(topic: string, subscriber: TopicSubscriber): void {
    let subscribers = this.topicSubscribers.get(topic);
    if (!subscribers) {
      subscribers = new Set();
      this.topicSubscribers.set(topic, subscribers);
    }
    const isFirst = subscribers.size === 0;
    subscribers.add(subscriber);
    if (isFirst && this._currentClient) {
      this._currentClient.send(MessageId.SubscribeMessage, { topic } satisfies SubscribePayload);
    }
  }

  unsubscribeFromTopic(topic: string, subscriber: TopicSubscriber): void {
    const subscribers = this.topicSubscribers.get(topic);
    if (!subscribers) {
      return;
    }
    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      this.topicSubscribers.delete(topic);
      if (this._currentClient) {
        this._currentClient.send(MessageId.UnsubscribeMessage, { topic } satisfies UnsubscribePayload);
      }
    }
  }

  private dispatchStateUpdate(topic: string, state: unknown): void {
    const subscribers = this.topicSubscribers.get(topic);
    if (subscribers) {
      for (const subscriber of subscribers) {
        subscriber.onStateUpdate(topic, state);
      }
    }
  }

  private onMessage(clientId: string, rawMessage: string): void {
    console.log(rawMessage);

    try {
      const { id, data } = decodeMessage(rawMessage);
      if (id === MessageId.ChangeActiveSessionMessage) {
        const payload = data as ChangeActiveSessionPayload;
        this.setActiveSession(clientId, payload.sessionId);
      } else if (id === MessageId.StateUpdateMessage) {
        const payload = data as StateUpdatePayload;
        this.dispatchStateUpdate(payload.topic, payload.state);
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  }

  private setActiveSession(clientId: string, sessionId: string): void {
    const client = this.connections.get(clientId);
    if (client) {
      this._currentClient = client;
      for (const topic of this.topicSubscribers.keys()) {
        client.send(MessageId.SubscribeMessage, { topic } satisfies SubscribePayload);
      }
    }

    const payload: ActiveSessionChangedPayload = { sessionId };
    for (const c of this.connections.values()) {
      c.send(MessageId.ActiveSessionChangedMessage, payload);
    }
  }

  dispose(): void {
    this.wss.close();
  }
}
