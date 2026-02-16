import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { randomUUID } from "crypto";
import {
  decodeMessage,
  MessageId,
  SESSION_HEADER,
  ActiveSessionChangedPayload,
  ChangeActiveSessionPayload,
} from "@streamdeck-vscode/shared";
import { Client } from "./client";

export class MessageServer {
  private readonly wss: WebSocketServer;
  private readonly connections = new Map<string, Client>();
  private _currentClient: Client | null = null;

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

  private onMessage(clientId: string, rawMessage: string): void {
    console.log(rawMessage);

    try {
      const { id, data } = decodeMessage(rawMessage);
      if (id === MessageId.ChangeActiveSessionMessage) {
        const payload = data as ChangeActiveSessionPayload;
        this.setActiveSession(clientId, payload.sessionId);
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  }

  private setActiveSession(clientId: string, sessionId: string): void {
    const client = this.connections.get(clientId);
    if (client) {
      this._currentClient = client;
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
