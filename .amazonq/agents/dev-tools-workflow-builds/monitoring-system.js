// Minimal Monitoring System
class Monitor {
  constructor() {
    this.metrics = new Map();
  }

  record(name, value) {
    if (!this.metrics.has(name)) this.metrics.set(name, []);
    this.metrics.get(name).push({ value, time: Date.now() });
  }

  get(name) {
    return this.metrics.get(name) || [];
  }

  avg(name) {
    const values = this.get(name);
    if (values.length === 0) return 0;
    return values.reduce((sum, m) => sum + m.value, 0) / values.length;
  }

  report() {
    const report = {};
    this.metrics.forEach((values, name) => {
      report[name] = { count: values.length, avg: this.avg(name) };
    });
    return report;
  }
}

const mon = new Monitor();
mon.record('cpu', 45);
mon.record('cpu', 55);
console.log(mon.report());

export default Monitor;
