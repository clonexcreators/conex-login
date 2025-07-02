// Events shim for Node.js events module
class EventEmitter {
  constructor() {
    this.events = {};
    this.maxListeners = 10;
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event, listener) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
    return this.events[event].length > 0;
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    this.on(event, onceWrapper);
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }

  listeners(event) {
    return this.events[event] || [];
  }
}

export { EventEmitter };
export default EventEmitter;
