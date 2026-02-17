import streamDeck from "@elgato/streamdeck";
import { messageServer } from "./server/instance";

import { ExecuteCommandAction } from "./actions/execute-command";
import { ExecuteTerminalCommandAction } from "./actions/execute-terminal-command";
import { CreateTerminalAction } from "./actions/create-terminal";
import { InsertSnippetAction } from "./actions/insert-snippet";
import { ChangeLanguageAction } from "./actions/change-language";
import { OpenFolderAction } from "./actions/open-folder";
import { TogglePanelAction } from "./actions/toggle-panel";
import { RunTaskAction } from "./actions/run-task";
import { NavigateToFileAction } from "./actions/navigate-to-file";
import { ToggleZenModeAction } from "./actions/toggle-zen-mode";
import { SwitchWorkspaceAction } from "./actions/switch-workspace";
import { SwitchProfileAction } from "./actions/switch-profile";

messageServer.start();

streamDeck.actions.registerAction(new ExecuteCommandAction());
streamDeck.actions.registerAction(new ExecuteTerminalCommandAction());
streamDeck.actions.registerAction(new CreateTerminalAction());
streamDeck.actions.registerAction(new InsertSnippetAction());
streamDeck.actions.registerAction(new ChangeLanguageAction());
streamDeck.actions.registerAction(new OpenFolderAction());
streamDeck.actions.registerAction(new TogglePanelAction());
streamDeck.actions.registerAction(new RunTaskAction());
streamDeck.actions.registerAction(new NavigateToFileAction());
streamDeck.actions.registerAction(new ToggleZenModeAction());
streamDeck.actions.registerAction(new SwitchWorkspaceAction());
streamDeck.actions.registerAction(new SwitchProfileAction());

streamDeck.connect();
