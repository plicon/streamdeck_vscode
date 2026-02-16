export interface CreateTerminalPayload {
  name?: string;
  preserveFocus: boolean;
  shellPath?: string;
  shellArgs?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
}
