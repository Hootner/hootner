#!/usr/bin/env node
/**
 * Layer 6: Time-Series Database - Optimized for temporal data
 * Dependencies: Layer 0 (Binary), Layer 3 (Filesystem), Layer 6 (Document DB)
 */

class TimeSeriesDB {
  constructor() {
    this.series = new Map();
    this.retention = new Map();
  }

  // Create series
  createSeries(name, tags = {}, retention = null) {
    this.series.set(name, {
      name,
      tags,
      points: [],
      retention
    });
    
    if (retention) {
      this.retention.set(name, retention);
    }
    
    console.log(`[SERIES] Created ${name}${retention ? ` (retention: ${retention}s)` : ''}`);
  }

  // Write point
  write(series, value, timestamp = Date.now(), tags = {}) {
    const s = this.series.get(series);
    if (!s) throw new Error(`Series ${series} not found`);
    
    const point = {
      value,
      timestamp,
      tags: { ...s.tags, ...tags }
    };
    
    s.points.push(point);
    
    // Sort by timestamp
    s.points.sort((a, b) => a.timestamp - b.timestamp);
    
    // Apply retention policy
    this.applyRetention(series);
    
    console.log(`[WRITE] ${series} = ${value} @ ${new Date(timestamp).toISOString()}`);
  }

  // Query range
  query(series, start, end, aggregation = null) {
    const s = this.series.get(series);
    if (!s) return [];
    
    let points = s.points.filter(p => 
      p.timestamp >= start && p.timestamp <= end
    );
    
    if (aggregation) {
      points = this.aggregate(points, aggregation);
    }
    
    console.log(`[QUERY] ${series} returned ${points.length} points`);
    return points;
  }

  // Aggregate data
  aggregate(points, config) {
    const { func, interval } = config; // func: 'avg', 'sum', 'min', 'max', 'count'
    const buckets = new Map();
    
    // Group into time buckets
    for (const point of points) {
      const bucket = Math.floor(point.timestamp / interval) * interval;
      if (!buckets.has(bucket)) {
        buckets.set(bucket, []);
      }
      buckets.get(bucket).push(point.value);
    }
    
    // Aggregate each bucket
    const result = [];
    for (const [timestamp, values] of buckets) {
      let value;
      
      switch (func) {
        case 'avg':
          value = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'sum':
          value = values.reduce((a, b) => a + b, 0);
          break;
        case 'min':
          value = Math.min(...values);
          break;
        case 'max':
          value = Math.max(...values);
          break;
        case 'count':
          value = values.length;
          break;
      }
      
      result.push({ timestamp, value });
    }
    
    return result;
  }

  // Downsample (reduce resolution)
  downsample(series, interval, func = 'avg') {
    const s = this.series.get(series);
    const downsampled = this.aggregate(s.points, { func, interval });
    
    console.log(`[DOWNSAMPLE] ${series} from ${s.points.length} to ${downsampled.length} points`);
    return downsampled;
  }

  // Apply retention policy
  applyRetention(series) {
    if (!this.retention.has(series)) return;
    
    const s = this.series.get(series);
    const retention = this.retention.get(series);
    const cutoff = Date.now() - retention * 1000;
    
    const before = s.points.length;
    s.points = s.points.filter(p => p.timestamp >= cutoff);
    
    if (s.points.length < before) {
      console.log(`[RETENTION] ${series} removed ${before - s.points.length} old points`);
    }
  }

  // Get last value
  last(series) {
    const s = this.series.get(series);
    return s.points[s.points.length - 1];
  }

  // Get statistics
  stats(series) {
    const s = this.series.get(series);
    const values = s.points.map(p => p.value);
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      first: s.points[0],
      last: s.points[s.points.length - 1]
    };
  }

  // Continuous query (auto-aggregation)
  createContinuousQuery(name, source, dest, aggregation) {
    console.log(`[CQ] Created ${name}: ${source} -> ${dest}`);
    
    // In production, this would run periodically
    setInterval(() => {
      const points = this.series.get(source).points;
      const aggregated = this.aggregate(points, aggregation);
      
      for (const point of aggregated) {
        this.write(dest, point.value, point.timestamp);
      }
    }, aggregation.interval);
  }
}

// Demo
if (require.main === module) {
  const db = new TimeSeriesDB();
  
  console.log('=== Time-Series Database Demo ===\n');
  
  // Create series
  db.createSeries('cpu.usage', { host: 'server1' }, 3600);
  db.createSeries('memory.usage', { host: 'server1' });
  
  console.log();
  
  // Write points
  const now = Date.now();
  for (let i = 0; i < 10; i++) {
    db.write('cpu.usage', 50 + Math.random() * 30, now + i * 1000);
  }
  
  console.log();
  
  // Query range
  const points = db.query('cpu.usage', now, now + 10000);
  console.log('Points:', points.length);
  
  console.log();
  
  // Aggregate
  const aggregated = db.query('cpu.usage', now, now + 10000, {
    func: 'avg',
    interval: 5000
  });
  console.log('Aggregated:', aggregated);
  
  console.log();
  
  // Downsample
  const downsampled = db.downsample('cpu.usage', 5000, 'avg');
  console.log('Downsampled:', downsampled.length, 'points');
  
  console.log();
  
  // Statistics
  const stats = db.stats('cpu.usage');
  console.log('Stats:', stats);
}

module.exports = TimeSeriesDB;
