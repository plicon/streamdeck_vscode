import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, InsertSnippetPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type InsertSnippetSettings = {
  name?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.insertsnippet" })
export class InsertSnippetAction extends SingletonAction<InsertSnippetSettings> {
  override async onKeyDown(ev: KeyDownEvent<InsertSnippetSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client && settings.name) {
      const payload: InsertSnippetPayload = { name: settings.name };
      client.send(MessageId.InsertSnippetMessage, payload);
    }
  }
}
