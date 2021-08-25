"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(event, cb) {
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
    off(event, cb) {
        const listeners = this.listeners[event];
        listeners && listeners.splice(listeners.indexOf(cb), 1);
    }
    emit(event, ...params) {
        (this.listeners[event] || []).forEach(c => c(...params));
    }
}
exports.default = EventEmitter;
