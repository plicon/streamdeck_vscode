import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, OpenFolderPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type SwitchWorkspaceSettings = {
  path?: string;
  newWindow?: boolean;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.switchworkspace" })
export class SwitchWorkspaceAction extends SingletonAction<SwitchWorkspaceSettings> {
  override async onKeyDown(ev: KeyDownEvent<SwitchWorkspaceSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.path) {
      const payload: OpenFolderPayload = {
        path: settings.path,
        newWindow: settings.newWindow ?? false,
      };
      client.send(MessageId.OpenFolderMessage, payload);
    }
  }
}
