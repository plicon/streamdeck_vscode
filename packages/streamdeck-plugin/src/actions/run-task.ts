import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { MessageId, ExecuteCommandPayload } from "@streamdeck-vscode/shared";
import { messageServer } from "../server/instance";

type RunTaskSettings = {
  taskName?: string;
};

@action({ UUID: "nl.plicon.streamdeck-vscode.runtask" })
export class RunTaskAction extends SingletonAction<RunTaskSettings> {
  override async onKeyDown(ev: KeyDownEvent<RunTaskSettings>): Promise<void> {
    const settings = ev.payload.settings;
    const client = messageServer.currentClient;
    if (client) {
      const payload: ExecuteCommandPayload = {
        command: "workbench.action.tasks.runTask",
        arguments: settings.taskName ? JSON.stringify(settings.taskName) : "",
      };
      client.send(MessageId.ExecuteCommandMessage, payload);
    }
  }
}
