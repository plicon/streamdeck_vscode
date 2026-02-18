export interface TopicSubscriber {
  onStateUpdate(topic: string, state: unknown): void;
}
