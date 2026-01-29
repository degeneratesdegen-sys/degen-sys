// A simple, dependency-free event emitter.
// This is used to globally handle specific errors, like Firestore permission errors,
// without coupling the data-fetching logic to the UI that displays the error.

type Listener = (event: any) => void;

class SimpleEventEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, payload: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => listener(payload));
  }
}

export const errorEmitter = new SimpleEventEmitter();
