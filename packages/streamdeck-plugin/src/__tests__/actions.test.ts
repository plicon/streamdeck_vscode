/* eslint-disable @typescript-eslint/no-explicit-any -- mocks require flexible typing */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageId } from "@streamdeck-vscode/shared";

// Mock the @elgato/streamdeck module — the `action` decorator is a no-op in tests
vi.mock("@elgato/streamdeck", () => {
  return {
    action: () => (target: any) => target,
    SingletonAction: class {},
  };
});

// Mock the singleton messageServer so we can control currentClient
const mockSend = vi.fn();
const mockClient = { send: mockSend };
vi.mock("../server/instance", () => ({
  messageServer: { currentClient: null as any },
}));

import { messageServer } from "../server/instance";
import { TogglePanelAction } from "../actions/toggle-panel";
import { RunTaskAction } from "../actions/run-task";
import { NavigateToFileAction } from "../actions/navigate-to-file";
import { ToggleZenModeAction } from "../actions/toggle-zen-mode";
import { SwitchWorkspaceAction } from "../actions/switch-workspace";
import { SwitchProfileAction } from "../actions/switch-profile";

function makeKeyDownEvent(settings: Record<string, any>) {
  return { payload: { settings } } as any;
}

beforeEach(() => {
  mockSend.mockClear();
  (messageServer as any).currentClient = mockClient;
});

describe("TogglePanelAction", () => {
  const action = new TogglePanelAction();

  it("sends toggleSidebarVisibility for sidebar", async () => {
    await action.onKeyDown(makeKeyDownEvent({ panelType: "sidebar" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.toggleSidebarVisibility",
      arguments: "null",
    });
  });

  it("sends togglePanel for panel", async () => {
    await action.onKeyDown(makeKeyDownEvent({ panelType: "panel" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.togglePanel",
      arguments: "null",
    });
  });

  it("sends toggleTerminal for terminal", async () => {
    await action.onKeyDown(makeKeyDownEvent({ panelType: "terminal" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.terminal.toggleTerminal",
      arguments: "null",
    });
  });

  it("defaults to panel when panelType is not set", async () => {
    await action.onKeyDown(makeKeyDownEvent({}));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.togglePanel",
      arguments: "null",
    });
  });

  it("does not send when no client is connected", async () => {
    (messageServer as any).currentClient = null;
    await action.onKeyDown(makeKeyDownEvent({ panelType: "sidebar" }));
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("RunTaskAction", () => {
  const action = new RunTaskAction();

  it("sends runTask command with task name", async () => {
    await action.onKeyDown(makeKeyDownEvent({ taskName: "build" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.tasks.runTask",
      arguments: JSON.stringify("build"),
    });
  });

  it("sends runTask with null arguments when no taskName", async () => {
    await action.onKeyDown(makeKeyDownEvent({}));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.tasks.runTask",
      arguments: "null",
    });
  });

  it("does not send when no client is connected", async () => {
    (messageServer as any).currentClient = null;
    await action.onKeyDown(makeKeyDownEvent({ taskName: "test" }));
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("NavigateToFileAction", () => {
  const action = new NavigateToFileAction();

  it("sends NavigateToFileMessage with filePath", async () => {
    await action.onKeyDown(makeKeyDownEvent({ filePath: "/src/index.ts" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.NavigateToFileMessage, {
      filePath: "/src/index.ts",
    });
  });

  it("does not send when filePath is empty", async () => {
    await action.onKeyDown(makeKeyDownEvent({}));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not send when no client is connected", async () => {
    (messageServer as any).currentClient = null;
    await action.onKeyDown(makeKeyDownEvent({ filePath: "/src/index.ts" }));
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("ToggleZenModeAction", () => {
  const action = new ToggleZenModeAction();

  it("sends toggleZenMode for zen", async () => {
    await action.onKeyDown(makeKeyDownEvent({ modeType: "zen" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.toggleZenMode",
      arguments: "null",
    });
  });

  it("sends toggleCenteredLayout for centered", async () => {
    await action.onKeyDown(makeKeyDownEvent({ modeType: "centered" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.toggleCenteredLayout",
      arguments: "null",
    });
  });

  it("defaults to zen mode when modeType is not set", async () => {
    await action.onKeyDown(makeKeyDownEvent({}));
    expect(mockSend).toHaveBeenCalledWith(MessageId.ExecuteCommandMessage, {
      command: "workbench.action.toggleZenMode",
      arguments: "null",
    });
  });

  it("does not send when no client is connected", async () => {
    (messageServer as any).currentClient = null;
    await action.onKeyDown(makeKeyDownEvent({ modeType: "zen" }));
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("SwitchWorkspaceAction", () => {
  const action = new SwitchWorkspaceAction();

  it("sends OpenFolderMessage with path", async () => {
    await action.onKeyDown(makeKeyDownEvent({ path: "/projects/myapp" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.OpenFolderMessage, {
      path: "/projects/myapp",
      newWindow: false,
    });
  });

  it("sends OpenFolderMessage with newWindow true", async () => {
    await action.onKeyDown(makeKeyDownEvent({ path: "/projects/myapp", newWindow: true }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.OpenFolderMessage, {
      path: "/projects/myapp",
      newWindow: true,
    });
  });

  it("does not send when path is empty", async () => {
    await action.onKeyDown(makeKeyDownEvent({}));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not send when no client is connected", async () => {
    (messageServer as any).currentClient = null;
    await action.onKeyDown(makeKeyDownEvent({ path: "/projects/myapp" }));
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("SwitchProfileAction", () => {
  const action = new SwitchProfileAction();

  it("sends SwitchProfileMessage with profileName", async () => {
    await action.onKeyDown(makeKeyDownEvent({ profileName: "Python Dev" }));
    expect(mockSend).toHaveBeenCalledWith(MessageId.SwitchProfileMessage, {
      profileName: "Python Dev",
    });
  });

  it("does not send when profileName is empty", async () => {
    await action.onKeyDown(makeKeyDownEvent({}));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not send when no client is connected", async () => {
    (messageServer as any).currentClient = null;
    await action.onKeyDown(makeKeyDownEvent({ profileName: "Default" }));
    expect(mockSend).not.toHaveBeenCalled();
  });
});
