import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, CreateTerminalPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type CreateTerminalSettings = {
  name?: string;
  preserveFocus?: boolean;
  shellPath?: string;
  shellArgs?: string;
  workingDirectory?: string;
};

@action({ UUID: "com.nicollasr.streamdeckvsc.createterminal" })
export class CreateTerminalAction extends SingletonAction<CreateTerminalSettings> {
  override async onKeyDown(ev: KeyDownEvent<CreateTerminalSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client) {
      const payload: CreateTerminalPayload = {
        name: settings.name,
        preserveFocus: settings.preserveFocus ?? false,
        shellPath: settings.shellPath,
        shellArgs: settings.shellArgs,
        workingDirectory: settings.workingDirectory,
      };
      client.send(MessageId.CreateTerminalMessage, payload);
    }
  }
}
