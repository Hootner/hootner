/**
 * Comprehensive Monitoring Service
 * Full-stack observability with alerting and analytics
 */

class ComprehensiveMonitoring {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.dashboards = new Map();
    this.traces = new Map();
    this.logs = new Map();
    
    this.initializeMetrics();
    this.initializeDashboards();
  }

  initializeMetrics() {
    const metricTypes = [
      { name: 'response_time', type: 'histogram', unit: 'ms' },
      { name: 'error_rate', type: 'counter', unit: 'percent' },
      { name: 'throughput', type: 'gauge', unit: 'req/sec' },
      { name: 'cpu_usage', type: 'gauge', unit: 'percent' },
      { name: 'memory_usage', type: 'gauge', unit: 'percent' },
      { name: 'disk_usage', type: 'gauge', unit: 'percent' },
      { name: 'network_io', type: 'counter', unit: 'bytes/sec' },
      { name: 'database_connections', type: 'gauge', unit: 'count' }
    ];

    metricTypes.forEach(metric => {
      this.metrics.set(metric.name, {
        ...metric,
        values: [],
        thresholds: this.getDefaultThresholds(metric.name)
      });
    });
  }

  getDefaultThresholds(metricName) {
    const thresholds = {
      response_time: { warning: 500, critical: 2000 },
      error_rate: { warning: 5, critical: 10 },
      throughput: { warning: 100, critical: 50 },
      cpu_usage: { warning: 80, critical: 95 },
      memory_usage: { warning: 85, critical: 95 },
      disk_usage: { warning: 80, critical: 90 },
      network_io: { warning: 1000000, critical: 10000000 },
      database_connections: { warning: 80, critical: 95 }
    };
    
    return thresholds[metricName] || { warning: 80, critical: 95 };
  }

  initializeDashboards() {
    const dashboards = [
      {
        name: 'Infrastructure Overview',
        panels: ['cpu_usage', 'memory_usage', 'disk_usage', 'network_io'],
        refreshInterval: 30
      },
      {
        name: 'Application Performance',
        panels: ['response_time', 'throughput', 'error_rate'],
        refreshInterval: 15
      },
      {
        name: 'Database Monitoring',
        panels: ['database_connections', 'query_performance', 'replication_lag'],
        refreshInterval: 60
      }
    ];

    dashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.name, dashboard);
    });
  }

  async trackMetrics({ service, metrics, timestamp = new Date().toISOString() }) {
    console.log(`📊 Tracking metrics for service: ${service}`);
    
    const trackingId = `track_${Date.now()}`;
    
    const tracking = {
      id: trackingId,
      service,
      timestamp,
      metrics: new Map(),
      alerts: []
    };

    // Process each metric
    for (const [metricName, value] of Object.entries(metrics)) {
      if (this.metrics.has(metricName)) {
        const metric = this.metrics.get(metricName);
        
        // Store metric value
        metric.values.push({ service, value, timestamp });
        
        // Keep only recent values (last 1000)
        if (metric.values.length > 1000) {
          metric.values = metric.values.slice(-1000);
        }
        
        tracking.metrics.set(metricName, value);
        
        // Check thresholds
        const alert = this.checkThresholds(service, metricName, value, metric.thresholds);
        if (alert) {
          tracking.alerts.push(alert);
          await this.processAlert(alert);
        }
      }
    }
    
    return tracking;
  }

  checkThresholds(service, metricName, value, thresholds) {
    let severity = null;
    
    if (value >= thresholds.critical) {
      severity = 'critical';
    } else if (value >= thresholds.warning) {
      severity = 'warning';
    }
    
    if (severity) {
      return {
        id: `alert_${Date.now()}`,
        service,
        metric: metricName,
        value,
        threshold: thresholds[severity],
        severity,
        timestamp: new Date().toISOString(),
        status: 'active'
      };
    }
    
    return null;
  }

  async processAlert(alert) {
    this.alerts.set(alert.id, alert);
    
    console.log(`🚨 Alert triggered: ${alert.service} - ${alert.metric} = ${alert.value} (${alert.severity})`);
    
    // Simulate alert processing
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert);
    }
    
    return alert;
  }

  async sendCriticalAlert(alert) {
    // Mock critical alert handling
    console.log(`📢 CRITICAL ALERT: ${alert.service} ${alert.metric} exceeded ${alert.threshold}`);
    
    // In production, this would:
    // - Send to PagerDuty
    // - Notify on-call engineers
    // - Create incident tickets
    // - Trigger auto-scaling
  }

  async createTrace({ traceId, service, operation, duration, spans = [] }) {
    console.log(`🔍 Creating trace: ${traceId} for ${service}.${operation}`);
    
    const trace = {
      traceId,
      service,
      operation,
      duration,
      startTime: new Date().toISOString(),
      spans: spans.map(span => ({
        spanId: `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation: span.operation,
        duration: span.duration,
        tags: span.tags || {},
        logs: span.logs || []
      })),
      tags: {
        service,
        version: '1.0.0',
        environment: 'production'
      }
    };
    
    this.traces.set(traceId, trace);
    
    return trace;
  }

  async logEvent({ level, message, service, metadata = {} }) {
    const logId = `log_${Date.now()}`;
    
    const logEntry = {
      id: logId,
      level,
      message,
      service,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    if (!this.logs.has(service)) {
      this.logs.set(service, []);
    }
    
    const serviceLogs = this.logs.get(service);
    serviceLogs.push(logEntry);
    
    // Keep only recent logs (last 1000 per service)
    if (serviceLogs.length > 1000) {
      serviceLogs.splice(0, serviceLogs.length - 1000);
    }
    
    console.log(`📝 Log entry: [${level}] ${service}: ${message}`);
    
    return logEntry;
  }

  async getDashboard(dashboardName) {
    const dashboard = this.dashboards.get(dashboardName);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardName} not found`);
    }
    
    const dashboardData = {
      name: dashboardName,
      generatedAt: new Date().toISOString(),
      refreshInterval: dashboard.refreshInterval,
      panels: []
    };
    
    // Generate data for each panel
    for (const panelMetric of dashboard.panels) {
      const metric = this.metrics.get(panelMetric);
      if (metric) {
        const panelData = {
          metric: panelMetric,
          type: metric.type,
          unit: metric.unit,
          currentValue: this.getCurrentValue(metric),
          trend: this.calculateTrend(metric),
          sparkline: this.generateSparkline(metric),
          thresholds: metric.thresholds
        };
        
        dashboardData.panels.push(panelData);
      }
    }
    
    return dashboardData;
  }

  getCurrentValue(metric) {
    if (metric.values.length === 0) return 0;
    
    const recentValues = metric.values.slice(-10);
    const sum = recentValues.reduce((acc, val) => acc + val.value, 0);
    
    return sum / recentValues.length;
  }

  calculateTrend(metric) {
    if (metric.values.length < 2) return 'stable';
    
    const recent = metric.values.slice(-10);
    const older = metric.values.slice(-20, -10);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, val) => acc + val.value, 0) / recent.length;
    const olderAvg = older.reduce((acc, val) => acc + val.value, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  generateSparkline(metric) {
    return metric.values.slice(-20).map(val => ({
      timestamp: val.timestamp,
      value: val.value
    }));
  }

  async getSystemHealth() {
    const health = {
      generatedAt: new Date().toISOString(),
      overallStatus: 'healthy',
      services: new Map(),
      activeAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'active'),
      summary: {
        totalServices: 0,
        healthyServices: 0,
        degradedServices: 0,
        downServices: 0
      }
    };
    
    // Mock service health data
    const services = ['video-api', 'user-service', 'payment-service', 'content-service', 'notification-service'];
    
    services.forEach(service => {
      const serviceHealth = this.calculateServiceHealth(service);
      health.services.set(service, serviceHealth);
      
      health.summary.totalServices++;
      if (serviceHealth.status === 'healthy') health.summary.healthyServices++;
      else if (serviceHealth.status === 'degraded') health.summary.degradedServices++;
      else health.summary.downServices++;
    });
    
    // Determine overall status
    if (health.summary.downServices > 0) {
      health.overallStatus = 'critical';
    } else if (health.summary.degradedServices > 0) {
      health.overallStatus = 'degraded';
    }
    
    return health;
  }

  calculateServiceHealth(service) {
    // Mock health calculation
    const healthScore = Math.random();
    
    let status = 'healthy';
    if (healthScore < 0.1) status = 'down';
    else if (healthScore < 0.3) status = 'degraded';
    
    return {
      service,
      status,
      healthScore: (healthScore * 100).toFixed(1),
      lastCheck: new Date().toISOString(),
      uptime: (0.95 + Math.random() * 0.049).toFixed(4), // 95-99.9%
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      errorRate: (Math.random() * 0.05).toFixed(3) // 0-5%
    };
  }

  async monitor({ services = ['all'], metrics = ['performance', 'availability'], alerting = true }) {
    console.log(`👁️ Starting comprehensive monitoring for: ${services.join(', ')}`);
    
    const monitoring = {
      id: `monitor_${Date.now()}`,
      services,
      metrics,
      alerting,
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    // Mock monitoring data
    const mockMetrics = {
      'video-api': {
        response_time: 150 + Math.random() * 100,
        error_rate: Math.random() * 5,
        throughput: 500 + Math.random() * 200,
        cpu_usage: 40 + Math.random() * 30,
        memory_usage: 60 + Math.random() * 20
      }
    };
    
    if (services.includes('all') || services.includes('video-api')) {
      await this.trackMetrics({
        service: 'video-api',
        metrics: mockMetrics['video-api']
      });
    }
    
    return monitoring;
  }

  async getAlerts(status = 'active') {
    return Array.from(this.alerts.values())
      .filter(alert => alert.status === status)
      .sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  async getTrace(traceId) {
    return this.traces.get(traceId) || null;
  }

  async searchLogs({ service, level, query, limit = 100 }) {
    const serviceLogs = this.logs.get(service) || [];
    
    let filteredLogs = serviceLogs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (query) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return filteredLogs.slice(-limit).reverse();
  }

  async listDashboards() {
    return Array.from(this.dashboards.keys());
  }
}

module.exports = new ComprehensiveMonitoring();