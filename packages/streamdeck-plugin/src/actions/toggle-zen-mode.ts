import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, ExecuteCommandPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

const modeCommands: Record<string, string> = {
  zen: "workbench.action.toggleZenMode",
  centered: "workbench.action.toggleCenteredLayout",
};

type ToggleZenModeSettings = {
  modeType?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.togglezenmode" })
export class ToggleZenModeAction extends SingletonAction<ToggleZenModeSettings> {
  override async onKeyDown(ev: KeyDownEvent<ToggleZenModeSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    const command = modeCommands[settings.modeType ?? "zen"];
    if (client && command) {
      const payload: ExecuteCommandPayload = {
        command,
        arguments: "null",
      };
      client.send(MessageId.ExecuteCommandMessage, payload);
    }
  }
}
