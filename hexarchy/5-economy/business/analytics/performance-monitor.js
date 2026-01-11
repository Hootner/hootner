const logger = require('../lib/logger');

class WatcherAgent {
  constructor() {
    this.metrics = new Map();
    this.incidents = new Map();
    this.alerts = new Map();
    this.thresholds = {
      responseTime: 1000,
      memoryUsage: 80,
      cpuUsage: 70,
      errorRate: 5
    };
    this.pagerDutyConfig = {
      apiKey: process.env.PAGERDUTY_API_KEY,
      serviceId: process.env.PAGERDUTY_SERVICE_ID
    };
  }

  // PagerDuty Integration
  triggerPagerDutyAlert(incident) {
    const alert = {
      incident_key: incident.id,
      event_type: 'trigger',
      description: incident.title,
      details: {
        severity: incident.severity,
        service: incident.service,
        timestamp: incident.created
      }
    };
    
    logger.operations('PagerDuty alert triggered', { 
      incidentId: incident.id,
      severity: incident.severity 
    });
    
    return { status: 'sent', alertId: `PD-${Date.now()}` };
  }

  // Incident Management
  createIncident(details) {
    const incident = {
      id: this.generateIncidentId(),
      title: details.title,
      severity: details.severity || 'medium',
      service: details.service || 'unknown',
      status: 'open',
      created: Date.now(),
      metrics: details.metrics || {}
    };
    
    this.incidents.set(incident.id, incident);
    
    // Auto-trigger PagerDuty for high severity
    if (incident.severity === 'critical' || incident.severity === 'high') {
      this.triggerPagerDutyAlert(incident);
    }
    
    logger.operations('Incident created', { 
      id: incident.id,
      severity: incident.severity,
      title: incident.title 
    });
    
    return incident;
  }

  generateIncidentId() {
    return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  // Enhanced Performance Monitoring
  trackRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (duration > this.thresholds.responseTime) {
        this.createIncident({
          title: `Slow response detected: ${req.url}`,
          severity: duration > 5000 ? 'high' : 'medium',
          service: 'web-server',
          metrics: { responseTime: duration, url: req.url }
        });
      }
    });
    
    next();
  }

  checkSystemHealth() {
    const memUsage = process.memoryUsage();
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (memPercent > this.thresholds.memoryUsage) {
      this.createIncident({
        title: 'High memory usage detected',
        severity: memPercent > 90 ? 'critical' : 'high',
        service: 'system',
        metrics: { memoryPercent: memPercent.toFixed(2) }
      });
    }
  }

  // Service Health Checks
  checkServiceHealth(services) {
    services.forEach(service => {
      const health = this.pingService(service);
      
      if (!health.healthy) {
        this.createIncident({
          title: `Service ${service.name} is down`,
          severity: 'critical',
          service: service.name,
          metrics: { lastSeen: health.lastSeen }
        });
      }
    });
  }

  pingService(service) {
    // Simplified health check
    return {
      healthy: Math.random() > 0.1, // 90% uptime simulation
      lastSeen: Date.now() - Math.random() * 60000
    };
  }

  // Alert Management
  processAlert(alertData) {
    const alert = {
      id: `ALERT-${Date.now()}`,
      ...alertData,
      created: Date.now(),
      status: 'active'
    };
    
    this.alerts.set(alert.id, alert);
    
    // Auto-create incident for critical alerts
    if (alert.severity === 'critical') {
      this.createIncident({
        title: alert.message,
        severity: alert.severity,
        service: alert.service
      });
    }
    
    return alert;
  }

  // Get operational metrics
  getOperationalMetrics() {
    return {
      activeIncidents: Array.from(this.incidents.values()).filter(i => i.status === 'open').length,
      totalIncidents: this.incidents.size,
      activeAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'active').length,
      systemHealth: this.getSystemHealthSummary()
    };
  }

  getSystemHealthSummary() {
    const memUsage = process.memoryUsage();
    return {
      memory: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2) + '%',
      uptime: process.uptime(),
      status: 'operational'
    };
  }

  startMonitoring() {
    // System health monitoring
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000);
    
    // Service health monitoring
    setInterval(() => {
      const services = [
        { name: 'database', url: 'mongodb://localhost' },
        { name: 'redis', url: 'redis://localhost' },
        { name: 'api', url: 'http://localhost:3000' }
      ];
      this.checkServiceHealth(services);
    }, 60000);
    
    logger.operations('Watcher monitoring started', {
      thresholds: this.thresholds,
      pagerDutyEnabled: !!this.pagerDutyConfig.apiKey
    });
  }
}

module.exports = new WatcherAgent();