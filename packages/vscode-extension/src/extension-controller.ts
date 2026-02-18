import * as vscode from "vscode";
import {
  decodeMessage,
  MessageId,
  ChangeActiveSessionPayload,
  CreateTerminalPayload,
  ExecuteTerminalCommandPayload,
  ExecuteCommandPayload,
  ActiveSessionChangedPayload,
  ChangeLanguagePayload,
  InsertSnippetPayload,
  OpenFolderPayload,
  NavigateToFilePayload,
  SwitchProfilePayload,
  SubscribePayload,
  UnsubscribePayload,
  StateUpdatePayload,
} from "@streamdeck-vscode/shared";
import { ExtensionStatus } from "./extension-status";
import { ExtensionHub } from "./extension-hub";
import { ExtensionConfiguration } from "./configuration";
import { SubscriptionManager } from "./subscription-manager";
import Logger from "./logger";

export class ExtensionController {
  private hub!: ExtensionHub;
  private status: ExtensionStatus;
  private disposables: vscode.Disposable[] = [];
  private readonly subscriptionManager = new SubscriptionManager(
    (topic, state) => this.hub.send(MessageId.StateUpdateMessage, { topic, state } satisfies StateUpdatePayload),
  );

  private _onCreateTerminal = new vscode.EventEmitter<CreateTerminalPayload>();
  private _onExecuteTerminalCommand = new vscode.EventEmitter<ExecuteTerminalCommandPayload>();
  private _onExecuteCommand = new vscode.EventEmitter<ExecuteCommandPayload>();
  private _onActiveSessionChanged = new vscode.EventEmitter<ActiveSessionChangedPayload>();
  private _onChangeLanguage = new vscode.EventEmitter<ChangeLanguagePayload>();
  private _onInsertSnippet = new vscode.EventEmitter<InsertSnippetPayload>();
  private _onOpenFolder = new vscode.EventEmitter<OpenFolderPayload>();
  private _onNavigateToFile = new vscode.EventEmitter<NavigateToFilePayload>();
  private _onSwitchProfile = new vscode.EventEmitter<SwitchProfilePayload>();

  readonly onCreateTerminal = this._onCreateTerminal.event;
  readonly onExecuteTerminalCommand = this._onExecuteTerminalCommand.event;
  readonly onExecuteCommand = this._onExecuteCommand.event;
  readonly onActiveSessionChanged = this._onActiveSessionChanged.event;
  readonly onChangeLanguage = this._onChangeLanguage.event;
  readonly onInsertSnippet = this._onInsertSnippet.event;
  readonly onOpenFolder = this._onOpenFolder.event;
  readonly onNavigateToFile = this._onNavigateToFile.event;
  readonly onSwitchProfile = this._onSwitchProfile.event;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous emitter map
  private readonly messageHandlers: Record<string, vscode.EventEmitter<any>> = {
    [MessageId.CreateTerminalMessage]: this._onCreateTerminal,
    [MessageId.ExecuteTerminalCommandMessage]: this._onExecuteTerminalCommand,
    [MessageId.ExecuteCommandMessage]: this._onExecuteCommand,
    [MessageId.ActiveSessionChangedMessage]: this._onActiveSessionChanged,
    [MessageId.ChangeLanguageMessage]: this._onChangeLanguage,
    [MessageId.InsertSnippetMessage]: this._onInsertSnippet,
    [MessageId.OpenFolderMessage]: this._onOpenFolder,
    [MessageId.NavigateToFileMessage]: this._onNavigateToFile,
    [MessageId.SwitchProfileMessage]: this._onSwitchProfile,
  };

  constructor(
    statusBar: vscode.StatusBarItem,
    private sessionId: string,
    configuration: ExtensionConfiguration,
  ) {
    this.status = new ExtensionStatus(statusBar);
    this.createStreamDeckHub(configuration);
  }

  activate() {
    this.connect();
  }

  deactivate() {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
    for (const emitter of Object.values(this.messageHandlers)) {
      emitter.dispose();
    }
    this.subscriptionManager.dispose();
    this.hub.disconnect();
  }

  private createStreamDeckHub(configuration: ExtensionConfiguration) {
    this.hub = new ExtensionHub(configuration.host, configuration.port, this.sessionId);
    this.disposables.push(
      this.hub.onConnected(() => this.onConnected()),
      this.hub.onDisconnected(() => this.onDisconnected()),
      this.hub.onMessageReceived((message) => this.onMessageReceived(message)),
    );
  }

  private connect() {
    Logger.log("Connecting to Stream Deck");
    this.status.setAsConnecting();
    this.hub.connect();
  }

  configurationChanged(configuration: ExtensionConfiguration) {
    Logger.log("Configuration changed, restarting...");
    if (this.hub) {
      this.hub.disconnect();
    }
    this.createStreamDeckHub(configuration);
    this.connect();
  }

  reconnect() {
    Logger.log("Reconnecting to Stream Deck...");
    this.connect();
  }

  private onConnected() {
    Logger.log("Connected to Stream Deck.");
    this.status.setAsConnected();
  }

  private onMessageReceived(raw: string) {
    try {
      const { id, data } = decodeMessage(raw);
      Logger.log(`Message received, ${id}: ${raw}`);
      if (id === MessageId.SubscribeMessage) {
        this.subscriptionManager.subscribe((data as SubscribePayload).topic);
        return;
      }
      if (id === MessageId.UnsubscribeMessage) {
        this.subscriptionManager.unsubscribe((data as UnsubscribePayload).topic);
        return;
      }
      const handler = this.messageHandlers[id];
      if (handler) {
        handler.fire(data);
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  private onDisconnected() {
    Logger.log("Disconnected from Stream Deck. Reconnecting in 5 seconds.");
    this.subscriptionManager.clearAll();
    this.status.setAsConnecting();
    setTimeout(() => this.connect(), 5000);
  }

  changeActiveSession(sessionId: string) {
    const payload: ChangeActiveSessionPayload = { sessionId };
    this.hub.send(MessageId.ChangeActiveSessionMessage, payload);
  }

  setSessionAsActive() {
    this.status.setActive();
  }

  setSessionAsInactive() {
    this.status.setInactive();
  }
}
