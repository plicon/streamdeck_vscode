import * as vscode from "vscode";
import Logger from "./logger";
import { ExtensionController } from "./extension-controller";
import { Commands, ExtensionScheme, Configurations } from "./constants";
import { ExtensionConfiguration } from "./configuration";
import type {
  CreateTerminalPayload,
  ExecuteTerminalCommandPayload,
  ExecuteCommandPayload,
  ActiveSessionChangedPayload,
  ChangeLanguagePayload,
  InsertSnippetPayload,
  OpenFolderPayload,
  NavigateToFilePayload,
  SwitchProfilePayload,
} from "@streamdeck-vscode/shared";

let extensionController: ExtensionController;

export function activate(context: vscode.ExtensionContext) {
  Logger.initialize(context);

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  statusBar.command = `${ExtensionScheme}.${Commands.ActivateSession}`;
  statusBar.tooltip = "Click to activate this session.";
  context.subscriptions.push(statusBar);

  const configuration = new ExtensionConfiguration();
  loadOrUpdateConfiguration(configuration);

  extensionController = new ExtensionController(statusBar, vscode.env.sessionId, configuration);

  registerCommands(context, extensionController);
  subscriptions(context, extensionController);
  extensionController.activate();

  Logger.log(`Registering session ${vscode.env.sessionId}`);

  vscode.window.onDidChangeWindowState((state) => windowStateChanged(extensionController, state));
  vscode.workspace.onDidChangeConfiguration(() =>
    configurationChanged(extensionController, configuration),
  );
}

export function deactivate() {
  extensionController.deactivate();
}

function windowStateChanged(controller: ExtensionController, state: vscode.WindowState) {
  if (state.focused) {
    controller.changeActiveSession(vscode.env.sessionId);
  }
}

function configurationChanged(controller: ExtensionController, configuration: ExtensionConfiguration) {
  loadOrUpdateConfiguration(configuration);
  controller.configurationChanged(configuration);
}

function loadOrUpdateConfiguration(configuration: ExtensionConfiguration) {
  const extensionConfiguration = vscode.workspace.getConfiguration();
  if (extensionConfiguration) {
    configuration.host = extensionConfiguration.get<string>(Configurations.ServerHost) ?? configuration.host;
    configuration.port = extensionConfiguration.get<number>(Configurations.ServerPort) ?? configuration.port;
  }
}

function registerCommands(context: vscode.ExtensionContext, controller: ExtensionController) {
  context.subscriptions.push(
    vscode.commands.registerCommand(`${ExtensionScheme}.${Commands.Reconnect}`, () => {
      controller.reconnect();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${ExtensionScheme}.${Commands.ActivateSession}`, () => {
      Logger.log(`Activation requested to ${vscode.env.sessionId}`);
      try {
        controller.changeActiveSession(vscode.env.sessionId);
      } catch (error) {
        Logger.error(error);
      }
    }),
  );
}

function subscriptions(context: vscode.ExtensionContext, controller: ExtensionController) {
  context.subscriptions.push(
    controller.onCreateTerminal((request) => createTerminal(context, request)),
    controller.onExecuteTerminalCommand((request) => executeTerminalCommand(request)),
    controller.onExecuteCommand((request) => executeCommand(request)),
    controller.onActiveSessionChanged((request) => onActiveSessionChanged(request)),
    controller.onChangeLanguage((request) => changeLanguage(request)),
    controller.onInsertSnippet((request) => insertSnippet(request)),
    controller.onOpenFolder((request) => openFolder(request)),
    controller.onNavigateToFile((request) => navigateToFile(request)),
    controller.onSwitchProfile((request) => switchProfile(request)),
  );
}

function onActiveSessionChanged(request: ActiveSessionChangedPayload) {
  if (request.sessionId === vscode.env.sessionId) {
    extensionController.setSessionAsActive();
  } else {
    extensionController.setSessionAsInactive();
  }
}

function changeLanguage(request: ChangeLanguagePayload) {
  if (vscode.window.activeTextEditor) {
    vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, request.languageId);
  }
}

function insertSnippet(request: InsertSnippetPayload) {
  if (request.name) {
    vscode.commands.executeCommand("editor.action.insertSnippet", { name: request.name });
  }
}

function openFolder(request: OpenFolderPayload) {
  if (request.path) {
    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(request.path), request.newWindow);
  }
}

function navigateToFile(request: NavigateToFilePayload) {
  if (request.filePath) {
    vscode.workspace.openTextDocument(vscode.Uri.file(request.filePath)).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  }
}

function switchProfile(request: SwitchProfilePayload) {
  if (request.profileName) {
    vscode.commands.executeCommand("workbench.profiles.actions.switchProfile", request.profileName);
  }
}

function executeCommand(request: ExecuteCommandPayload) {
  if (request.command) {
    let commandArguments: unknown;
    try {
      commandArguments = JSON.parse(request.arguments);
    } catch (error) {
      Logger.error(error);
    }
    if (commandArguments) {
      vscode.commands.executeCommand(request.command, commandArguments);
    } else {
      vscode.commands.executeCommand(request.command);
    }
  }
}

function executeTerminalCommand(request: ExecuteTerminalCommandPayload) {
  const terminal = vscode.window.activeTerminal;
  if (terminal && request.command) {
    terminal.show(true);
    terminal.sendText(request.command);
  }
}

function createTerminal(context: vscode.ExtensionContext, request: CreateTerminalPayload) {
  const terminal = vscode.window.createTerminal({
    name: request.name,
    cwd: request.workingDirectory,
    env: request.environment,
    shellArgs: request.shellArgs,
    shellPath: request.shellPath,
  });
  terminal.show(request.preserveFocus);
  context.subscriptions.push(terminal);
}
