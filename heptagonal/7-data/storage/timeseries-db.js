export class TimeSeriesDB {
  constructor() {
    this.series = new Map();
    this.retention = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  write(metric, value, tags = {}) {
    const key = `${metric}:${JSON.stringify(tags)}`;
    if (!this.series.has(key)) this.series.set(key, []);
    
    this.series.get(key).push({ value, timestamp: Date.now() });
    this.cleanup(key);
  }

  query(metric, start, end, tags = {}) {
    const key = `${metric}:${JSON.stringify(tags)}`;
    const data = this.series.get(key) || [];
    
    return data.filter(d => d.timestamp >= start && d.timestamp <= end);
  }

  cleanup(key) {
    const data = this.series.get(key);
    const cutoff = Date.now() - this.retention;
    this.series.set(key, data.filter(d => d.timestamp > cutoff));
  }

  getMetrics() {
    return {
      series: this.series.size,
      points: Array.from(this.series.values()).reduce((sum, s) => sum + s.length, 0)
    };
  }
}

export default new TimeSeriesDB();
