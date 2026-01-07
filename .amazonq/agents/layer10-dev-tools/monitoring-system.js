#!/usr/bin/env node
/**
 * Layer 10: Monitoring System - Metrics collection and alerting
 * Dependencies: Layer 5 (Message Broker), Layer 6 (Time-Series DB)
 */

class MonitoringSystem {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.rules = [];
    this.dashboards = new Map();
  }

  // Record metric
  record(name, value, tags = {}) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value,
      tags,
      timestamp: Date.now()
    });
    
    // Check alert rules
    this.checkRules(name, value, tags);
  }

  // Increment counter
  increment(name, tags = {}) {
    this.record(name, 1, tags);
  }

  // Record gauge
  gauge(name, value, tags = {}) {
    this.record(name, value, tags);
  }

  // Record histogram
  histogram(name, value, tags = {}) {
    this.record(name, value, { ...tags, type: 'histogram' });
  }

  // Add alert rule
  addRule(name, condition, threshold, action) {
    this.rules.push({
      name,
      metric: condition.metric,
      operator: condition.operator, // '>', '<', '==', '!='
      threshold,
      action,
      triggered: false
    });
    console.log(`[RULE] Added ${name}`);
  }

  // Check rules
  checkRules(metricName, value, tags) {
    for (const rule of this.rules) {
      if (rule.metric !== metricName) continue;
      
      let triggered = false;
      
      switch (rule.operator) {
        case '>':
          triggered = value > rule.threshold;
          break;
        case '<':
          triggered = value < rule.threshold;
          break;
        case '==':
          triggered = value === rule.threshold;
          break;
        case '!=':
          triggered = value !== rule.threshold;
          break;
      }
      
      if (triggered && !rule.triggered) {
        this.triggerAlert(rule, value, tags);
        rule.triggered = true;
      } else if (!triggered) {
        rule.triggered = false;
      }
    }
  }

  // Trigger alert
  triggerAlert(rule, value, tags) {
    const alert = {
      rule: rule.name,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      tags,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    console.log(`[ALERT] ${rule.name}: ${rule.metric} = ${value} (threshold: ${rule.threshold})`);
    
    if (rule.action) {
      rule.action(alert);
    }
  }

  // Query metrics
  query(name, timeRange = {}) {
    const data = this.metrics.get(name) || [];
    
    let filtered = data;
    
    if (timeRange.start) {
      filtered = filtered.filter(d => d.timestamp >= timeRange.start);
    }
    
    if (timeRange.end) {
      filtered = filtered.filter(d => d.timestamp <= timeRange.end);
    }
    
    return filtered;
  }

  // Aggregate metrics
  aggregate(name, func = 'avg', timeRange = {}) {
    const data = this.query(name, timeRange);
    const values = data.map(d => d.value);
    
    switch (func) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }

  // Create dashboard
  createDashboard(name, panels) {
    this.dashboards.set(name, {
      name,
      panels, // [{ metric: 'cpu', type: 'line' }]
      created: Date.now()
    });
    console.log(`[DASHBOARD] Created ${name}`);
  }

  // Get dashboard data
  getDashboard(name) {
    const dashboard = this.dashboards.get(name);
    if (!dashboard) return null;
    
    const data = {};
    
    for (const panel of dashboard.panels) {
      data[panel.metric] = this.query(panel.metric);
    }
    
    return { dashboard, data };
  }

  // Get health status
  health() {
    const now = Date.now();
    const recentAlerts = this.alerts.filter(a => now - a.timestamp < 300000); // 5 min
    
    return {
      status: recentAlerts.length === 0 ? 'healthy' : 'degraded',
      alerts: recentAlerts.length,
      metrics: this.metrics.size
    };
  }

  // Get stats
  stats() {
    return {
      metrics: this.metrics.size,
      dataPoints: Array.from(this.metrics.values()).reduce((sum, m) => sum + m.length, 0),
      alerts: this.alerts.length,
      rules: this.rules.length,
      dashboards: this.dashboards.size
    };
  }
}

// Demo
if (require.main === module) {
  const monitor = new MonitoringSystem();
  
  console.log('=== Monitoring System Demo ===\n');
  
  // Add alert rules
  monitor.addRule('high-cpu', { metric: 'cpu.usage', operator: '>' }, 80, (alert) => {
    console.log(`  ACTION: Send notification for high CPU`);
  });
  
  monitor.addRule('low-memory', { metric: 'memory.free', operator: '<' }, 20, (alert) => {
    console.log(`  ACTION: Scale up instances`);
  });
  
  console.log();
  
  // Record metrics
  for (let i = 0; i < 10; i++) {
    monitor.gauge('cpu.usage', 50 + Math.random() * 50, { host: 'server1' });
    monitor.gauge('memory.free', 30 + Math.random() * 40, { host: 'server1' });
    monitor.increment('requests.count', { endpoint: '/api/users' });
  }
  
  console.log();
  
  // Query and aggregate
  const avgCpu = monitor.aggregate('cpu.usage', 'avg');
  console.log(`Average CPU: ${avgCpu.toFixed(2)}%`);
  
  const totalRequests = monitor.aggregate('requests.count', 'sum');
  console.log(`Total requests: ${totalRequests}`);
  
  console.log();
  
  // Create dashboard
  monitor.createDashboard('system', [
    { metric: 'cpu.usage', type: 'line' },
    { metric: 'memory.free', type: 'line' },
    { metric: 'requests.count', type: 'bar' }
  ]);
  
  console.log();
  
  // Health check
  console.log('Health:', monitor.health());
  
  console.log('\nStats:', monitor.stats());
}

module.exports = MonitoringSystem;
