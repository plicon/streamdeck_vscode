import { DEFAULT_HOST, DEFAULT_PORT } from "@streamdeck-vscode/shared";
import { MessageServer } from "./message-server";

export const messageServer = new MessageServer(DEFAULT_HOST, DEFAULT_PORT);
