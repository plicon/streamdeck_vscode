import WebSocket from "ws";
import { encodeMessage } from "@streamdeck-vscode/shared";

export class Client {
  constructor(
    readonly id: string,
    private readonly socket: WebSocket,
    readonly sessionId: string,
  ) {}

  send(messageId: string, data: unknown): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(encodeMessage(messageId, data));
    }
  }
}
