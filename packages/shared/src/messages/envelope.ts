export enum MessageId {
  ExecuteCommandMessage = "ExecuteCommandMessage",
  ExecuteTerminalCommandMessage = "ExecuteTerminalCommandMessage",
  CreateTerminalMessage = "CreateTerminalMessage",
  InsertSnippetMessage = "InsertSnippetMessage",
  ChangeLanguageMessage = "ChangeLanguageMessage",
  OpenFolderMessage = "OpenFolderMessage",
  ActiveSessionChangedMessage = "ActiveSessionChangedMessage",
  ChangeActiveSessionMessage = "ChangeActiveSessionMessage",
  NavigateToFileMessage = "NavigateToFileMessage",
  SwitchProfileMessage = "SwitchProfileMessage",
  SubscribeMessage = "SubscribeMessage",
  UnsubscribeMessage = "UnsubscribeMessage",
  StateUpdateMessage = "StateUpdateMessage",
}

export interface MessageEnvelope {
  id: string;
  data: string;
}
