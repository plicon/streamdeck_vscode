import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, ExecuteTerminalCommandPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type ExecuteTerminalCommandSettings = {
  command?: string;
};

@action({ UUID: "com.nicollasr.streamdeckvsc.executeterminalcommand" })
export class ExecuteTerminalCommandAction extends SingletonAction<ExecuteTerminalCommandSettings> {
  override async onKeyDown(ev: KeyDownEvent<ExecuteTerminalCommandSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.command) {
      const payload: ExecuteTerminalCommandPayload = { command: settings.command };
      client.send(MessageId.ExecuteTerminalCommandMessage, payload);
    }
  }
}
