import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, ChangeLanguagePayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type ChangeLanguageSettings = {
  languageId?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.changelanguage" })
export class ChangeLanguageAction extends SingletonAction<ChangeLanguageSettings> {
  override async onKeyDown(ev: KeyDownEvent<ChangeLanguageSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.languageId) {
      const payload: ChangeLanguagePayload = { languageId: settings.languageId };
      client.send(MessageId.ChangeLanguageMessage, payload);
    }
  }
}
