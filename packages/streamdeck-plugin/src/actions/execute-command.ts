import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, ExecuteCommandPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type ExecuteCommandSettings = {
  command?: string;
  arguments?: string;
};

@action({ UUID: "com.nicollasr.streamdeckvsc.executecommand" })
export class ExecuteCommandAction extends SingletonAction<ExecuteCommandSettings> {
  override async onKeyDown(ev: KeyDownEvent<ExecuteCommandSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.command) {
      const payload: ExecuteCommandPayload = {
        command: settings.command,
        arguments: settings.arguments ?? "",
      };
      client.send(MessageId.ExecuteCommandMessage, payload);
    }
  }
}
