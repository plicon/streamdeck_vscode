import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, OpenFolderPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type OpenFolderSettings = {
  path?: string;
  newWindow?: boolean;
};

@action({ UUID: "com.nicollasr.streamdeckvsc.openfolder" })
export class OpenFolderAction extends SingletonAction<OpenFolderSettings> {
  override async onKeyDown(ev: KeyDownEvent<OpenFolderSettings>): Promise<void> {
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
