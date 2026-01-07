// Minimal Runtime (Node.js-like)
class Runtime {
  constructor() {
    this.queue = [];
    this.timers = [];
  }

  setTimeout(fn, ms) {
    this.timers.push({ fn, time: Date.now() + ms });
  }

  nextTick(fn) {
    this.queue.push(fn);
  }

  run() {
    while (this.queue.length || this.timers.length) {
      while (this.queue.length) {
        const fn = this.queue.shift();
        fn();
      }
      
      const now = Date.now();
      this.timers = this.timers.filter(t => {
        if (t.time <= now) { t.fn(); return false; }
        return true;
      });
    }
  }
}

const rt = new Runtime();
rt.nextTick(() => console.log('Tick'));
rt.setTimeout(() => console.log('Timer'), 100);
if (import.meta.url === `file://${process.argv[1]}`) rt.run();

export default Runtime;
