/**
 * HOOTNER Performance Monitor - Enterprise Operations
 * Real-time monitoring, alerting, and incident management
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      activeConnections: 0
    };
    
    this.incidents = new Map();
    this.alerts = new Map();
    
    this.thresholds = {
      responseTime: 1000, // 1 second
      memoryUsage: 80, // 80%
      cpuUsage: 70, // 70%
      errorRate: 5, // 5%
      diskUsage: 85 // 85%
    };
    
    this.startTime = Date.now();
  }

  // Request monitoring middleware
  trackRequest(req, res, next) {
    const startTime = performance.now();
    this.metrics.requests++;
    this.metrics.activeConnections++;

    res.on('finish', () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics.responseTime.push(responseTime);
      this.metrics.activeConnections--;
      
      // Keep only last 1000 response times
      if (this.metrics.responseTime.length > 1000) {
        this.metrics.responseTime.shift();
      }

      // Check for slow responses
      if (responseTime > this.thresholds.responseTime) {
        this.createAlert({
          type: 'slow_response',
          severity: responseTime > 5000 ? 'critical' : 'warning',
          message: `Slow response detected: ${responseTime.toFixed(2)}ms for ${req.url}`,
          metadata: { responseTime, url: req.url, method: req.method }
        });
      }

      // Track errors
      if (res.statusCode >= 400) {
        this.metrics.errors++;
        
        if (res.statusCode >= 500) {
          this.createAlert({
            type: 'server_error',
            severity: 'high',
            message: `Server error: ${res.statusCode} for ${req.url}`,
            metadata: { statusCode: res.statusCode, url: req.url }
          });
        }
      }
    });

    next();
  }

  // System health monitoring
  monitorSystemHealth() {
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    this.metrics.memoryUsage.push(memPercent);
    
    // Keep only last 100 memory readings
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }

    // Check memory threshold
    if (memPercent > this.thresholds.memoryUsage) {
      this.createAlert({
        type: 'high_memory',
        severity: memPercent > 90 ? 'critical' : 'warning',
        message: `High memory usage: ${memPercent.toFixed(2)}%`,
        metadata: { memoryPercent: memPercent, heapUsed: memUsage.heapUsed }
      });
    }

    // CPU monitoring (simplified)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    
    this.metrics.cpuUsage.push(cpuPercent);
    
    if (this.metrics.cpuUsage.length > 100) {
      this.metrics.cpuUsage.shift();
    }
  }

  // Create alert
  createAlert(alertData) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...alertData,
      timestamp: Date.now(),
      status: 'active'
    };

    this.alerts.set(alert.id, alert);
    
    console.log(`⚠️  ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    this.emit('alert', alert);

    // Auto-create incident for critical alerts
    if (alert.severity === 'critical') {
      this.createIncident({
        title: alert.message,
        severity: alert.severity,
        source: 'performance_monitor',
        alertId: alert.id
      });
    }

    return alert;
  }

  // Create incident
  createIncident(incidentData) {
    const incident = {
      id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      ...incidentData,
      status: 'open',
      created: Date.now(),
      updated: Date.now()
    };

    this.incidents.set(incident.id, incident);
    
    console.log(`🚨 INCIDENT CREATED [${incident.severity.toUpperCase()}]: ${incident.title}`);
    
    this.emit('incident', incident);

    // Simulate PagerDuty notification
    if (incident.severity === 'critical') {
      console.log(`📞 PagerDuty notification sent for incident ${incident.id}`);
    }

    return incident;
  }

  // Get performance metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
      : 0;
    
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;

    const avgMemoryUsage = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length
      : 0;

    return {
      uptime,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: errorRate.toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
      activeConnections: this.metrics.activeConnections,
      avgMemoryUsage: avgMemoryUsage.toFixed(2) + '%',
      activeAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'active').length,
      openIncidents: Array.from(this.incidents.values()).filter(i => i.status === 'open').length,
      systemHealth: this.getSystemHealthStatus()
    };
  }

  // Get system health status
  getSystemHealthStatus() {
    const metrics = this.getMetrics();
    const errorRate = parseFloat(metrics.errorRate);
    const memoryUsage = parseFloat(metrics.avgMemoryUsage);
    
    if (errorRate > 10 || memoryUsage > 90) {
      return 'critical';
    } else if (errorRate > 5 || memoryUsage > 80) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  // Get recent alerts
  getRecentAlerts(limit = 10) {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get open incidents
  getOpenIncidents() {
    return Array.from(this.incidents.values())
      .filter(incident => incident.status === 'open')
      .sort((a, b) => b.created - a.created);
  }

  // Start monitoring
  async start() {
    console.log('📈 Starting HOOTNER Performance Monitor...');
    
    // System health monitoring every 30 seconds
    setInterval(() => {
      this.monitorSystemHealth();
    }, 30000);

    // Metrics logging every 5 minutes
    setInterval(() => {
      const metrics = this.getMetrics();
      console.log('📈 Performance Metrics:', {
        requests: metrics.requests,
        errorRate: metrics.errorRate,
        avgResponseTime: metrics.avgResponseTime,
        systemHealth: metrics.systemHealth
      });
    }, 300000);

    // Alert cleanup every hour
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 3600000);

    console.log('✅ Performance Monitor started');
    
    return {
      status: 'running',
      thresholds: this.thresholds,
      metrics: this.getMetrics()
    };
  }

  // Cleanup old alerts
  cleanupOldAlerts() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [id, alert] of this.alerts) {
      if (alert.timestamp < oneDayAgo && alert.status !== 'active') {
        this.alerts.delete(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old alerts`);
    }
  }

  // Health check
  healthCheck() {
    const metrics = this.getMetrics();
    
    return {
      status: 'healthy',
      uptime: metrics.uptime,
      systemHealth: metrics.systemHealth,
      activeAlerts: metrics.activeAlerts,
      openIncidents: metrics.openIncidents
    };
  }
}

// Create and export monitor instance
const performanceMonitor = new PerformanceMonitor();

// Auto-start if run directly
if (require.main === module) {
  performanceMonitor.start().catch(console.error);
  
  // Keep process alive
  process.stdin.resume();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Performance Monitor...');
    process.exit(0);
  });
}

module.exports = performanceMonitor;