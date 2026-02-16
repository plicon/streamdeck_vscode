import * as vscode from "vscode";
import WebSocket = require("ws");
import { encodeMessage, SESSION_HEADER } from "@streamdeck-vscode/shared";
import Logger from "./logger";

export class ExtensionHub {
  private _onConnected = new vscode.EventEmitter<void>();
  private _onDisconnected = new vscode.EventEmitter<void>();
  private _onMessageReceived = new vscode.EventEmitter<string>();
  private socket!: WebSocket;

  readonly onConnected = this._onConnected.event;
  readonly onDisconnected = this._onDisconnected.event;
  readonly onMessageReceived = this._onMessageReceived.event;

  constructor(
    private host: string,
    private port: number,
    private sessionId: string,
  ) {}

  connect() {
    this.socket = new WebSocket(`ws://${this.host}:${this.port}`, {
      headers: { [SESSION_HEADER]: this.sessionId },
    });
    this.socket.on("open", () => this._onConnected.fire());
    this.socket.on("message", (message) => this._onMessageReceived.fire(message.toString()));
    this.socket.on("close", () => this._onDisconnected.fire());
    this.socket.on("error", (err) => Logger.error(err));
  }

  disconnect() {
    this._onConnected.dispose();
    this._onDisconnected.dispose();
    this._onMessageReceived.dispose();
    this.socket.close();
  }

  send(id: string, data: unknown) {
    if (this.socket) {
      this.socket.send(encodeMessage(id, data));
    }
  }

  dispose() {
    this._onConnected.dispose();
    this._onDisconnected.dispose();
    this._onMessageReceived.dispose();
  }
}
