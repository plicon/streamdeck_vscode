import streamDeck from "@elgato/streamdeck";
import { messageServer } from "./server/instance";

import { ExecuteCommandAction } from "./actions/execute-command";
import { ExecuteTerminalCommandAction } from "./actions/execute-terminal-command";
import { CreateTerminalAction } from "./actions/create-terminal";
import { InsertSnippetAction } from "./actions/insert-snippet";
import { ChangeLanguageAction } from "./actions/change-language";
import { OpenFolderAction } from "./actions/open-folder";

messageServer.start();

streamDeck.actions.registerAction(new ExecuteCommandAction());
streamDeck.actions.registerAction(new ExecuteTerminalCommandAction());
streamDeck.actions.registerAction(new CreateTerminalAction());
streamDeck.actions.registerAction(new InsertSnippetAction());
streamDeck.actions.registerAction(new ChangeLanguageAction());
streamDeck.actions.registerAction(new OpenFolderAction());

streamDeck.connect();
