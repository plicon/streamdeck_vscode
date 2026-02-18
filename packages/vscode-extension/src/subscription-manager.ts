import * as vscode from "vscode";
import Logger from "./logger";

export class SubscriptionManager {
  private readonly watchers = new Map<string, vscode.Disposable>();

  constructor(private readonly onStateUpdate: (topic: string, state: unknown) => void) {}

  subscribe(topic: string): void {
    if (this.watchers.has(topic)) {
      return;
    }
    const watcher = this.createWatcher(topic);
    if (watcher) {
      this.watchers.set(topic, watcher);
    }
  }

  unsubscribe(topic: string): void {
    const watcher = this.watchers.get(topic);
    if (watcher) {
      watcher.dispose();
      this.watchers.delete(topic);
    }
  }

  clearAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.dispose();
    }
    this.watchers.clear();
  }

  dispose(): void {
    this.clearAll();
  }

  private createWatcher(topic: string): vscode.Disposable | null {
    Logger.log(`SubscriptionManager: unknown topic "${topic}" — no watcher registered`);
    return null;
  }
}
