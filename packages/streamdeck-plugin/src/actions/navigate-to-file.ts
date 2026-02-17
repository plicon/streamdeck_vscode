import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, NavigateToFilePayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type NavigateToFileSettings = {
  filePath?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.navigatetofile" })
export class NavigateToFileAction extends SingletonAction<NavigateToFileSettings> {
  override async onKeyDown(ev: KeyDownEvent<NavigateToFileSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.filePath) {
      const payload: NavigateToFilePayload = {
        filePath: settings.filePath,
      };
      client.send(MessageId.NavigateToFileMessage, payload);
    }
  }
}
