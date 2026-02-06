/**
 * Health Checks Service
 * Service availability and uptime monitoring
 */

class HealthChecks {
  constructor() {
    this.services = new Map();
    this.checkHistory = new Map();
    this.alertThresholds = {
      responseTime: 5000, // 5 seconds
      failureRate: 0.1, // 10%
      consecutiveFailures: 3
    };
    this.monitoringInterval = null;
  }

  async checkService({ name, endpoint, timeout = 5000, expectedStatus = 200 }) {
    const checkId = `check_${Date.now()}`;
    const startTime = Date.now();
    
    console.log(`🏥 Health check for ${name}: ${endpoint}`);
    
    const healthCheck = {
      id: checkId,
      service: name,
      endpoint,
      timestamp: new Date().toISOString(),
      status: 'checking',
      responseTime: null,
      statusCode: null,
      error: null,
      details: {}
    };

    try {
      const result = await this.performHealthCheck(endpoint, timeout, expectedStatus);
      
      healthCheck.status = result.healthy ? 'healthy' : 'unhealthy';
      healthCheck.responseTime = Date.now() - startTime;
      healthCheck.statusCode = result.statusCode;
      healthCheck.details = result.details;
      
    } catch (error) {
      healthCheck.status = 'unhealthy';
      healthCheck.responseTime = Date.now() - startTime;
      healthCheck.error = error.message;
    }

    // Store check result
    this.storeCheckResult(name, healthCheck);
    
    // Check for alerts
    await this.evaluateAlerts(name, healthCheck);
    
    return healthCheck;
  }

  async performHealthCheck(endpoint, timeout, expectedStatus) {
    // Mock health check - replace with actual HTTP request
    const mockDelay = Math.random() * 2000 + 100; // 100-2100ms
    await new Promise(resolve => setTimeout(resolve, mockDelay));
    
    const isHealthy = Math.random() > 0.05; // 95% success rate
    const statusCode = isHealthy ? expectedStatus : (Math.random() > 0.5 ? 500 : 503);
    
    return {
      healthy: isHealthy && statusCode === expectedStatus,
      statusCode,
      details: {
        database: isHealthy ? 'connected' : 'disconnected',
        cache: isHealthy ? 'available' : 'unavailable',
        diskSpace: Math.floor(Math.random() * 40) + 60, // 60-100%
        memoryUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
        cpuUsage: Math.floor(Math.random() * 40) + 20 // 20-60%
      }
    };
  }

  storeCheckResult(serviceName, healthCheck) {
    if (!this.checkHistory.has(serviceName)) {
      this.checkHistory.set(serviceName, []);
    }
    
    const history = this.checkHistory.get(serviceName);
    history.push(healthCheck);
    
    // Keep only last 100 checks per service
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  async evaluateAlerts(serviceName, healthCheck) {
    const history = this.checkHistory.get(serviceName) || [];
    const recentChecks = history.slice(-10); // Last 10 checks
    
    const alerts = [];
    
    // Check response time
    if (healthCheck.responseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'HIGH_RESPONSE_TIME',
        service: serviceName,
        severity: 'warning',
        message: `Response time ${healthCheck.responseTime}ms exceeds threshold`,
        value: healthCheck.responseTime,
        threshold: this.alertThresholds.responseTime
      });
    }
    
    // Check consecutive failures
    const consecutiveFailures = this.getConsecutiveFailures(recentChecks);
    if (consecutiveFailures >= this.alertThresholds.consecutiveFailures) {
      alerts.push({
        type: 'SERVICE_DOWN',
        service: serviceName,
        severity: 'critical',
        message: `Service has ${consecutiveFailures} consecutive failures`,
        value: consecutiveFailures,
        threshold: this.alertThresholds.consecutiveFailures
      });
    }
    
    // Check failure rate
    const failureRate = this.calculateFailureRate(recentChecks);
    if (failureRate > this.alertThresholds.failureRate) {
      alerts.push({
        type: 'HIGH_FAILURE_RATE',
        service: serviceName,
        severity: 'warning',
        message: `Failure rate ${(failureRate * 100).toFixed(1)}% exceeds threshold`,
        value: failureRate,
        threshold: this.alertThresholds.failureRate
      });
    }
    
    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
    
    return alerts;
  }

  getConsecutiveFailures(checks) {
    let failures = 0;
    
    for (let i = checks.length - 1; i >= 0; i--) {
      if (checks[i].status === 'unhealthy') {
        failures++;
      } else {
        break;
      }
    }
    
    return failures;
  }

  calculateFailureRate(checks) {
    if (checks.length === 0) return 0;
    
    const failures = checks.filter(check => check.status === 'unhealthy').length;
    return failures / checks.length;
  }

  async processAlert(alert) {
    console.log(`🚨 Health Alert: ${alert.type} for ${alert.service} - ${alert.message}`);
    
    // In production, this would:
    // - Send to monitoring systems
    // - Create incident tickets
    // - Notify on-call engineers
    
    return alert;
  }

  async startMonitoring({ services, interval = 30000 }) {
    console.log(`🔄 Starting health monitoring for ${services.length} services (${interval}ms interval)`);
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      for (const service of services) {
        try {
          await this.checkService(service);
        } catch (error) {
          console.error(`Health check failed for ${service.name}:`, error.message);
        }
      }
    }, interval);
    
    return { status: 'monitoring_started', services: services.length, interval };
  }

  async stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Health monitoring stopped');
    }
    
    return { status: 'monitoring_stopped' };
  }

  async getServiceStatus(serviceName) {
    const history = this.checkHistory.get(serviceName) || [];
    const latestCheck = history[history.length - 1];
    
    if (!latestCheck) {
      return { service: serviceName, status: 'unknown', message: 'No health checks performed' };
    }
    
    const recentChecks = history.slice(-20); // Last 20 checks
    const uptime = this.calculateUptime(recentChecks);
    const avgResponseTime = this.calculateAverageResponseTime(recentChecks);
    
    return {
      service: serviceName,
      status: latestCheck.status,
      uptime: `${uptime.toFixed(2)}%`,
      avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
      lastCheck: latestCheck.timestamp,
      consecutiveFailures: this.getConsecutiveFailures(recentChecks),
      totalChecks: history.length
    };
  }

  calculateUptime(checks) {
    if (checks.length === 0) return 0;
    
    const healthyChecks = checks.filter(check => check.status === 'healthy').length;
    return (healthyChecks / checks.length) * 100;
  }

  calculateAverageResponseTime(checks) {
    if (checks.length === 0) return 0;
    
    const validChecks = checks.filter(check => check.responseTime !== null);
    if (validChecks.length === 0) return 0;
    
    const totalTime = validChecks.reduce((sum, check) => sum + check.responseTime, 0);
    return totalTime / validChecks.length;
  }

  async monitor({ services = [], interval = 30, alertOnFailure = true }) {
    console.log(`🏥 Monitoring ${services.length} services`);
    
    // Convert service names to service objects
    const serviceConfigs = services.map(name => ({
      name,
      endpoint: `https://api.hootner.com/${name}/health`,
      timeout: 5000,
      expectedStatus: 200
    }));
    
    return await this.startMonitoring({ 
      services: serviceConfigs, 
      interval: interval * 1000 
    });
  }
}

module.exports = new HealthChecks();