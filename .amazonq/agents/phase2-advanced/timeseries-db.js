// Minimal Time-Series Database - Metrics, Aggregations, Downsampling
class TimeSeriesDB {
  constructor() {
    this.series = new Map();
    this.retentionPolicies = new Map();
  }

  // Create series
  createSeries(name, tags = {}, retention = 86400000) {
    const key = this.seriesKey(name, tags);
    if (!this.series.has(key)) {
      this.series.set(key, []);
      this.retentionPolicies.set(key, retention);
    }
  }

  seriesKey(name, tags) {
    const tagStr = Object.entries(tags).sort().map(([k, v]) => `${k}=${v}`).join(',');
    return `${name}{${tagStr}}`;
  }

  // Write point
  write(name, value, tags = {}, timestamp = Date.now()) {
    const key = this.seriesKey(name, tags);
    this.createSeries(name, tags);
    
    const series = this.series.get(key);
    series.push({ timestamp, value });
    
    // Keep sorted by timestamp
    series.sort((a, b) => a.timestamp - b.timestamp);
    
    // Apply retention policy
    this.applyRetention(key);
  }

  // Apply retention policy
  applyRetention(key) {
    const retention = this.retentionPolicies.get(key);
    const cutoff = Date.now() - retention;
    const series = this.series.get(key);
    
    const filtered = series.filter(p => p.timestamp >= cutoff);
    this.series.set(key, filtered);
  }

  // Query range
  query(name, tags = {}, start, end = Date.now()) {
    const key = this.seriesKey(name, tags);
    const series = this.series.get(key) || [];
    
    return series.filter(p => p.timestamp >= start && p.timestamp <= end);
  }

  // Aggregations
  aggregate(name, tags, start, end, func) {
    const points = this.query(name, tags, start, end);
    if (points.length === 0) return null;

    const values = points.map(p => p.value);
    
    switch (func) {
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'min': return Math.min(...values);
      case 'max': return Math.max(...values);
      case 'count': return values.length;
      default: return null;
    }
  }

  // Downsample (reduce resolution)
  downsample(name, tags, start, end, interval, func = 'avg') {
    const points = this.query(name, tags, start, end);
    const buckets = new Map();

    // Group into time buckets
    points.forEach(p => {
      const bucket = Math.floor(p.timestamp / interval) * interval;
      if (!buckets.has(bucket)) buckets.set(bucket, []);
      buckets.get(bucket).push(p.value);
    });

    // Aggregate each bucket
    const result = [];
    buckets.forEach((values, timestamp) => {
      let value;
      switch (func) {
        case 'avg': value = values.reduce((a, b) => a + b, 0) / values.length; break;
        case 'sum': value = values.reduce((a, b) => a + b, 0); break;
        case 'min': value = Math.min(...values); break;
        case 'max': value = Math.max(...values); break;
        default: value = values[0];
      }
      result.push({ timestamp, value });
    });

    return result.sort((a, b) => a.timestamp - b.timestamp);
  }
}

// Demo: Server Metrics
console.log('=== Time-Series Database Demo ===\n');

const tsdb = new TimeSeriesDB();

// Write CPU metrics
const now = Date.now();
for (let i = 0; i < 60; i++) {
  const timestamp = now - (60 - i) * 1000; // Last 60 seconds
  const cpu = 20 + Math.random() * 60;
  tsdb.write('cpu_usage', cpu, { host: 'server-1', region: 'us-east' }, timestamp);
}

// Write memory metrics
for (let i = 0; i < 60; i++) {
  const timestamp = now - (60 - i) * 1000;
  const mem = 50 + Math.random() * 30;
  tsdb.write('memory_usage', mem, { host: 'server-1', region: 'us-east' }, timestamp);
}

// Query last 30 seconds
console.log('--- Query: Last 30 seconds ---');
const recent = tsdb.query('cpu_usage', { host: 'server-1', region: 'us-east' }, now - 30000);
console.log(`Points: ${recent.length}`);

// Aggregations
console.log('\n--- Aggregations: Last 60 seconds ---');
const start = now - 60000;
console.log('Avg CPU:', tsdb.aggregate('cpu_usage', { host: 'server-1', region: 'us-east' }, start, now, 'avg').toFixed(2) + '%');
console.log('Max CPU:', tsdb.aggregate('cpu_usage', { host: 'server-1', region: 'us-east' }, start, now, 'max').toFixed(2) + '%');
console.log('Min Memory:', tsdb.aggregate('memory_usage', { host: 'server-1', region: 'us-east' }, start, now, 'min').toFixed(2) + '%');

// Downsample to 10-second intervals
console.log('\n--- Downsampled (10s intervals) ---');
const downsampled = tsdb.downsample('cpu_usage', { host: 'server-1', region: 'us-east' }, start, now, 10000, 'avg');
console.log(`Original: 60 points → Downsampled: ${downsampled.length} points`);
downsampled.slice(0, 3).forEach(p => {
  console.log(`  ${new Date(p.timestamp).toISOString()}: ${p.value.toFixed(2)}%`);
});

export default TimeSeriesDB;
