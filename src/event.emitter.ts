export default class EventEmitter<T extends string> {
  private readonly listeners: {[key: string]: ((...args)=>any)[]} = {};

  public on (event: T, cb: (...args: any)=>void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    if (!(this.listeners[event].indexOf(cb) > 0)) {
      this.listeners[event].push(cb);
    }
    return {
      unregister: () => {
        const listeners = this.listeners[event];
        listeners.splice(listeners.indexOf(cb), 1);
      }
    };
  }

  public off (event: T, cb: (...args: any)=>void) {
    const listeners = this.listeners[event];
    listeners && listeners.splice(listeners.indexOf(cb), 1);
  }

  public emit (event: T, ...params) {
    (this.listeners[event] || []).forEach(c => c(...params));
  }
}
