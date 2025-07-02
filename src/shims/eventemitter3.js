class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, fn) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(fn);
  }

  off(event, fn) {
    this.events[event] = (this.events[event] || []).filter(f => f !== fn);
  }

  emit(event, ...args) {
    for (const fn of this.events[event] || []) fn(...args);
  }
}

export { EventEmitter };
export default EventEmitter;
