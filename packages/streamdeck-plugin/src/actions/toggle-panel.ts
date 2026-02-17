import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, ExecuteCommandPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

const panelCommands: Record<string, string> = {
  sidebar: "workbench.action.toggleSidebarVisibility",
  panel: "workbench.action.togglePanel",
  terminal: "workbench.action.terminal.toggleTerminal",
};

type TogglePanelSettings = {
  panelType?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.togglepanel" })
export class TogglePanelAction extends SingletonAction<TogglePanelSettings> {
  override async onKeyDown(ev: KeyDownEvent<TogglePanelSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    const command = panelCommands[settings.panelType ?? "panel"];
    if (client && command) {
      const payload: ExecuteCommandPayload = {
        command,
        arguments: "",
      };
      client.send(MessageId.ExecuteCommandMessage, payload);
    }
  }
}
