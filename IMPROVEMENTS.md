# Improvement Ideas

Future integrations and enhancements for the Stream Deck VS Code plugin.

## New Actions

### Feedback-Driven Actions

These send state back to the Stream Deck to update button icons and titles. This is the key differentiator over keyboard shortcuts — physical buttons that show live state.

- **Git Status Indicator** — Show current branch name on the button. Change icon color when there are uncommitted changes. Press to open Source Control view.
- **Build/Test Status** — Button shows green/red/yellow based on last build or test run result. Press to re-run.
- **Problems Count** — Display the number of errors/warnings from the Problems panel on the button. Press to open the Problems view.
- **Debug Controls** (Start/Stop/Step Over/Step Into/Continue) — Show whether a debug session is active. Change icon between play/pause/stop states. Debugging with physical buttons is a genuinely better experience than keyboard shortcuts.

### Source Control

- **Diff Current File** — Open the diff view for the current file.
- **Stage/Unstage Changes** — Quick source control operations.
- **Commit** — Open the commit input or commit with a default message.

### Navigation

- **Bookmarks/Cursor Position** — Save and jump to named locations in code (pairs well with the Bookmarks extension).
- **Go to Symbol** — Jump to a specific symbol in the current file or workspace.
- **Recent Files** — Cycle through or jump to recently opened files.

## Architecture Improvements

### Bidirectional Communication

The current protocol is mostly one-directional (Stream Deck → VS Code). Adding a subscription model where the extension pushes state changes to the plugin would unlock the most compelling integrations (git status, debug state, problem counts).

Proposed approach:
1. Add a `SubscribeMessage` type that the plugin sends to request updates for a topic (e.g., "git.status", "debug.state", "problems.count").
2. The extension listens for workspace/editor/debug events and pushes `StateUpdateMessage` payloads to all subscribed clients.
3. The plugin updates button titles and icons via the Stream Deck SDK's `setTitle()` and `setImage()` APIs.

### Multi-Profile Stream Deck Pages

Support Stream Deck profiles/pages that automatically switch based on VS Code context:
- Different button layouts for editing vs. debugging vs. git operations.
- Auto-switch when entering/leaving debug mode.

### Extension Settings UI

Add a VS Code webview panel for managing Stream Deck connection settings, viewing connected clients, and testing actions — rather than relying solely on `settings.json`.
