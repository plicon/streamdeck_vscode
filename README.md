# Stream Deck for Visual Studio Code

Control Visual Studio Code from your Elgato Stream Deck. Press a button on your Stream Deck to execute VS Code commands, run terminal commands, insert snippets, and more.

This monorepo contains both the **Stream Deck plugin** and the **VS Code extension** that work together over WebSocket.

> Based on the original work by [Nicollas R. (nicollasricas)](https://github.com/nicollasricas) — [vscode-streamdeck](https://github.com/nicollasricas/vscode-streamdeck) and [streamdeckvsc](https://github.com/nicollasricas/streamdeckvsc). This project rewrites the .NET Stream Deck plugin in TypeScript using the modern `@elgato/streamdeck` Node.js SDK, combines both repos into a single monorepo, and adds cross-platform (macOS + Windows) support.

## How It Works

The Stream Deck plugin runs a WebSocket server on `127.0.0.1:48969`. The VS Code extension connects to it as a client. When you press a Stream Deck button, the plugin sends a message to VS Code, which executes the corresponding action.

```text
┌──────────────┐    WebSocket     ┌──────────────────┐
│  Stream Deck │ ──────────────── │  VS Code         │
│  Plugin      │   port 48969    │  Extension       │
│  (server)    │ ◄────────────── │  (client)        │
└──────────────┘                  └──────────────────┘
```

## Supported Actions

| Action                       | Description                                  |
| ---------------------------- | -------------------------------------------- |
| **Execute Command**          | Run any VS Code command by its Command ID    |
| **Execute Terminal Command** | Send a command to the active terminal        |
| **Create Terminal**          | Open a new terminal with custom settings     |
| **Insert Snippet**           | Insert a named snippet into the editor       |
| **Change Language**          | Change the language mode of the active file  |
| **Open Folder**              | Open a folder or workspace                   |

## Installation

### VS Code Extension

Install the `.vsix` manually:

```bash
code --install-extension vscode-streamdeck-5.0.0.vsix
```

### Stream Deck Plugin

1. Download the latest `nl.plicon.streamdeck-vscode.streamDeckPlugin` from [Releases](https://github.com/plicon/streamdeck_vscode/releases)
2. Double-click the file to install it into Stream Deck

### Getting Started

1. Install both the VS Code extension and the Stream Deck plugin
2. Open VS Code — the extension connects automatically
3. In the Stream Deck app, add an action from the **Visual Studio Code** category
4. Configure the action in the Property Inspector (e.g., enter a Command ID)
5. Press the button on your Stream Deck

**Tip:** To find a VS Code Command ID, open **File > Preferences > Keyboard Shortcuts**, find the command, right-click it, and select **Copy Command ID**.

## Development

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

```bash
git clone https://github.com/plicon/streamdeck_vscode.git
cd streamdeck_vscode
npm install
npm run build
```

### Build

```bash
npm run build            # Build all packages
npm run build:shared     # Build shared types only
npm run build:extension  # Build VS Code extension only
npm run build:plugin     # Build Stream Deck plugin only
```

### Test

```bash
npm test                 # Run all tests
```

### Package the Stream Deck Plugin

```bash
npm run pack:plugin      # Build + package as .streamDeckPlugin
```

The output file is at `packages/streamdeck-plugin/nl.plicon.streamdeck-vscode.streamDeckPlugin`.

### Development Install (Stream Deck)

For rapid iteration, symlink the plugin directory:

```bash
# macOS
ln -s "$(pwd)/packages/streamdeck-plugin/nl.plicon.streamdeck-vscode.sdPlugin" \
  ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/nl.plicon.streamdeck-vscode.sdPlugin
```

Then restart Stream Deck. Changes take effect after `npm run build:plugin`.

## Project Structure

```text
packages/
  shared/              Shared message types, protocol helpers, constants
  vscode-extension/    VS Code extension (WebSocket client)
  streamdeck-plugin/   Stream Deck plugin (WebSocket server + actions)
```

## License

MIT
