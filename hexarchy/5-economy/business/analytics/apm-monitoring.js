/**
 * APM Monitoring Service
 * New Relic/DataDog application monitoring and alerting
 */

class APMMonitoring {
  constructor() {
    this.providers = ['newrelic', 'datadog', 'dynatrace', 'appdynamics'];
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = {
      responseTime: 500, // ms
      errorRate: 0.05, // 5%
      throughput: 100, // req/min
      cpuUsage: 80, // %
      memoryUsage: 85 // %
    };
  }

  async trackMetrics({ service, responseTime, errorRate, throughput, cpuUsage, memoryUsage }) {
    const timestamp = new Date().toISOString();
    const metricId = `${service}_${Date.now()}`;
    
    const metrics = {
      id: metricId,
      service,
      timestamp,
      responseTime,
      errorRate,
      throughput,
      cpuUsage,
      memoryUsage,
      status: this.calculateStatus({ responseTime, errorRate, cpuUsage, memoryUsage })
    };

    this.metrics.set(metricId, metrics);
    
    // Check for alerts
    await this.checkAlerts(service, metrics);
    
    console.log(`📊 APM metrics tracked for ${service}: ${responseTime}ms response, ${(errorRate * 100).toFixed(2)}% errors`);
    
    return metrics;
  }

  calculateStatus(metrics) {
    const issues = [];
    
    if (metrics.responseTime > this.thresholds.responseTime) {
      issues.push('high_response_time');
    }
    
    if (metrics.errorRate > this.thresholds.errorRate) {
      issues.push('high_error_rate');
    }
    
    if (metrics.cpuUsage > this.thresholds.cpuUsage) {
      issues.push('high_cpu');
    }
    
    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      issues.push('high_memory');
    }
    
    return issues.length === 0 ? 'healthy' : 'degraded';
  }

  async checkAlerts(service, metrics) {
    const alerts = [];
    
    // Response time alert
    if (metrics.responseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'HIGH_RESPONSE_TIME',
        service,
        severity: metrics.responseTime > this.thresholds.responseTime * 2 ? 'critical' : 'warning',
        message: `Response time ${metrics.responseTime}ms exceeds threshold ${this.thresholds.responseTime}ms`,
        value: metrics.responseTime,
        threshold: this.thresholds.responseTime
      });
    }
    
    // Error rate alert
    if (metrics.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        service,
        severity: metrics.errorRate > this.thresholds.errorRate * 2 ? 'critical' : 'warning',
        message: `Error rate ${(metrics.errorRate * 100).toFixed(2)}% exceeds threshold ${(this.thresholds.errorRate * 100).toFixed(2)}%`,
        value: metrics.errorRate,
        threshold: this.thresholds.errorRate
      });
    }
    
    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
    
    return alerts;
  }

  async processAlert(alert) {
    const alertId = `alert_${Date.now()}`;
    
    alert.id = alertId;
    alert.timestamp = new Date().toISOString();
    alert.status = 'active';
    
    this.alerts.set(alertId, alert);
    
    console.log(`🚨 APM Alert: ${alert.type} for ${alert.service} - ${alert.message}`);
    
    // In production, this would:
    // - Send to PagerDuty/Slack
    // - Create incident tickets
    // - Trigger auto-scaling
    
    return alert;
  }

  async getDashboard(service, timeRange = '1h') {
    const serviceMetrics = Array.from(this.metrics.values())
      .filter(m => m.service === service)
      .slice(-100); // Last 100 metrics
    
    if (serviceMetrics.length === 0) {
      return this.generateMockDashboard(service);
    }
    
    const dashboard = {
      service,
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        avgResponseTime: this.calculateAverage(serviceMetrics, 'responseTime'),
        avgErrorRate: this.calculateAverage(serviceMetrics, 'errorRate'),
        avgThroughput: this.calculateAverage(serviceMetrics, 'throughput'),
        avgCpuUsage: this.calculateAverage(serviceMetrics, 'cpuUsage'),
        avgMemoryUsage: this.calculateAverage(serviceMetrics, 'memoryUsage'),
        totalRequests: serviceMetrics.length * 100,
        uptime: this.calculateUptime(serviceMetrics)
      },
      alerts: Array.from(this.alerts.values()).filter(a => a.service === service),
      trends: this.calculateTrends(serviceMetrics)
    };
    
    return dashboard;
  }

  generateMockDashboard(service) {
    return {
      service,
      timeRange: '1h',
      generatedAt: new Date().toISOString(),
      summary: {
        avgResponseTime: 180 + Math.random() * 100,
        avgErrorRate: 0.01 + Math.random() * 0.02,
        avgThroughput: 150 + Math.random() * 50,
        avgCpuUsage: 45 + Math.random() * 20,
        avgMemoryUsage: 60 + Math.random() * 15,
        totalRequests: 5000 + Math.random() * 2000,
        uptime: 99.5 + Math.random() * 0.4
      },
      alerts: [],
      trends: {
        responseTime: 'stable',
        errorRate: 'decreasing',
        throughput: 'increasing'
      }
    };
  }

  calculateAverage(metrics, field) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + (m[field] || 0), 0);
    return sum / metrics.length;
  }

  calculateUptime(metrics) {
    if (metrics.length === 0) return 100;
    const healthyMetrics = metrics.filter(m => m.status === 'healthy').length;
    return (healthyMetrics / metrics.length) * 100;
  }

  calculateTrends(metrics) {
    if (metrics.length < 2) return { responseTime: 'stable', errorRate: 'stable', throughput: 'stable' };
    
    const recent = metrics.slice(-10);
    const older = metrics.slice(-20, -10);
    
    return {
      responseTime: this.getTrend(older, recent, 'responseTime'),
      errorRate: this.getTrend(older, recent, 'errorRate'),
      throughput: this.getTrend(older, recent, 'throughput')
    };
  }

  getTrend(older, recent, field) {
    const oldAvg = this.calculateAverage(older, field);
    const recentAvg = this.calculateAverage(recent, field);
    
    const change = (recentAvg - oldAvg) / oldAvg;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  async monitor({ service, metrics = ['response_time', 'error_rate'], alertThresholds = {} }) {
    console.log(`📊 Monitoring ${service} with APM`);
    
    // Merge custom thresholds
    const thresholds = { ...this.thresholds, ...alertThresholds };
    
    // Generate mock metrics
    const mockMetrics = {
      responseTime: 200 + Math.random() * 300,
      errorRate: Math.random() * 0.08,
      throughput: 100 + Math.random() * 100,
      cpuUsage: 40 + Math.random() * 40,
      memoryUsage: 50 + Math.random() * 30
    };
    
    return await this.trackMetrics({ service, ...mockMetrics });
  }
}

module.exports = new APMMonitoring();