import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, SwitchProfilePayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type SwitchProfileSettings = {
  profileName?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.switchprofile" })
export class SwitchProfileAction extends SingletonAction<SwitchProfileSettings> {
  override async onKeyDown(ev: KeyDownEvent<SwitchProfileSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.profileName) {
      const payload: SwitchProfilePayload = {
        profileName: settings.profileName,
      };
      client.send(MessageId.SwitchProfileMessage, payload);
    }
  }
}
