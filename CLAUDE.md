# streamdeck_vscode

TypeScript monorepo that integrates Elgato Stream Deck with Visual Studio Code over WebSocket.

## Architecture

```
packages/
  shared/          - @streamdeck-vscode/shared: message types, protocol helpers, constants
  vscode-extension/ - vscode-streamdeck: VS Code extension (WebSocket client)
  streamdeck-plugin/ - @streamdeck-vscode/plugin: Stream Deck plugin (WebSocket server + actions)
```

The Stream Deck plugin runs a WebSocket server on `127.0.0.1:48969`. The VS Code extension connects as a client. When a Stream Deck button is pressed, the plugin sends a double-serialized JSON envelope (`{id, data}` where `data` is a JSON string) to the active VS Code session, which deserializes and executes the corresponding command.

## Build

```bash
npm install          # from root — installs all workspaces
npm run build        # builds shared → extension → plugin (in order)
npm run build:shared
npm run build:extension
npm run build:plugin
```

Shared must be built before extension or plugin. The root `npm run build` handles ordering via workspace dependency resolution.

## Package details

- **shared**: Pure TypeScript, compiled with `tsc` to `out/`. Exports message interfaces, `MessageId` enum, `encodeMessage`/`decodeMessage` helpers, and constants.
- **vscode-extension**: Compiled with `tsc` to `out/`. Uses `vscode.EventEmitter` for events (no external event library). Depends on `ws` and `@streamdeck-vscode/shared`.
- **streamdeck-plugin**: Compiled with `tsc` to `dist/`, then bundled with Rollup to a single `nl.plicon.streamdeck-vscode.sdPlugin/bin/plugin.js`. Uses `@elgato/streamdeck` Node.js SDK. The `.sdPlugin/` directory contains the complete distributable plugin (manifest, icons, PropertyInspector UI, bundled JS).

## Protocol

Messages use a double-serialized envelope for backward compatibility:
```json
{"id": "ExecuteCommandMessage", "data": "{\"command\":\"workbench.action.tasks.runTask\",\"arguments\":\"\"}"}
```
The `id` field matches `MessageId` enum values (which are the original class names). Use `encodeMessage(id, payload)` and `decodeMessage(raw)` from shared to handle serialization.

## Key files

- `packages/shared/src/protocol.ts` — encode/decode helpers
- `packages/shared/src/messages/envelope.ts` — MessageId enum + envelope interface
- `packages/vscode-extension/src/extension-controller.ts` — message dispatch logic
- `packages/vscode-extension/src/extension-hub.ts` — WebSocket client
- `packages/streamdeck-plugin/src/server/message-server.ts` — WebSocket server
- `packages/streamdeck-plugin/src/server/instance.ts` — singleton server instance
- `packages/streamdeck-plugin/src/actions/*.ts` — Stream Deck action handlers
