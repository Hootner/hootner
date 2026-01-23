/**
 * System Monitoring
 * Health checks, metrics collection, and alerting
 */

import { createLogger } from '../../0-core/utils/logger.js'
import { eventBus } from '../../0-core/orchestration/event-bus.js'
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js'
import crypto from 'crypto'

const logger = createLogger('foundation', 'monitoring')

class SystemMonitor {
  constructor() {
    this.metrics = new Map()
    this.alerts = []
    this.thresholds = new Map()
    this.services = new Map()
    this.isMonitoring = false

    this._setupDefaultThresholds()
    this._setupEventListeners()
  }

  _setupDefaultThresholds() {
    // CPU thresholds
    this.thresholds.set('cpu_usage', {
      warning: 70,
      critical: 90,
      unit: '%',
    })

    // Memory thresholds
    this.thresholds.set('memory_usage', {
      warning: 80,
      critical: 95,
      unit: '%',
    })

    // Disk thresholds
    this.thresholds.set('disk_usage', {
      warning: 85,
      critical: 95,
      unit: '%',
    })

    // Response time thresholds
    this.thresholds.set('response_time', {
      warning: 1000,
      critical: 5000,
      unit: 'ms',
    })

    // Error rate thresholds
    this.thresholds.set('error_rate', {
      warning: 5,
      critical: 10,
      unit: '%',
    })
  }

  _setupEventListeners() {
    // Listen for system events
    eventBus.subscribe(EventTypes.SYSTEM_HEALTH_CHECK, async (event) => {
      await this.recordMetric('health_check', event.payload)
    })

    eventBus.subscribe(EventTypes.API_REQUEST_COMPLETED, async (event) => {
      await this.recordMetric('api_response', {
        domain: event.payload.domain,
        endpoint: event.payload.endpoint,
        responseTime: event.payload.responseTime,
        statusCode: event.payload.statusCode,
      })
    })
  }

  /**
   * Start monitoring system
   */
  startMonitoring(interval = 30000) {
    // 30 seconds default
    if (this.isMonitoring) {
      logger.warn('Monitoring already started')
      return
    }

    this.isMonitoring = true
    this.monitoringInterval = setInterval(async () => {
      await this.collectSystemMetrics()
    }, interval)

    logger.info('System monitoring started', { interval })
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.isMonitoring = false
      logger.info('System monitoring stopped')
    }
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics() {
    try {
      const metrics = {
        timestamp: Date.now(),
        system: await this._getSystemMetrics(),
        services: await this._getServiceMetrics(),
        network: await this._getNetworkMetrics(),
      }

      await this.recordMetric('system_snapshot', metrics)
      await this._checkThresholds(metrics)
    } catch (error) {
      logger.error('Failed to collect metrics', { error: error.message })
    }
  }

  async _getSystemMetrics() {
    // In real implementation, would use system APIs
    return {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        loadAverage: [1.2, 1.5, 1.8],
      },
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB
        used: Math.random() * 12 * 1024 * 1024 * 1024,
        free: Math.random() * 4 * 1024 * 1024 * 1024,
        usage: Math.random() * 100,
      },
      disk: {
        total: 1024 * 1024 * 1024 * 1024, // 1TB
        used: Math.random() * 800 * 1024 * 1024 * 1024,
        free: Math.random() * 200 * 1024 * 1024 * 1024,
        usage: Math.random() * 100,
      },
      uptime: process.uptime() * 1000,
    }
  }

  async _getServiceMetrics() {
    const services = {}

    // Check each domain service
    const domains = [
      'foundation',
      'intelligence',
      'communication',
      'interface',
      'economy',
      'governance',
      'data',
      'operations',
    ]

    for (const domain of domains) {
      services[domain] = await this._getServiceHealth(domain)
    }

    return services
  }

  async _getServiceHealth(domain) {
    // Simulate service health check
    const isHealthy = Math.random() > 0.1 // 90% healthy

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime: Math.random() * 1000,
      errorRate: Math.random() * 10,
      requests: {
        total: Math.floor(Math.random() * 1000),
        successful: Math.floor(Math.random() * 950),
        failed: Math.floor(Math.random() * 50),
      },
      lastCheck: Date.now(),
    }
  }

  async _getNetworkMetrics() {
    return {
      connections: {
        active: Math.floor(Math.random() * 100),
        idle: Math.floor(Math.random() * 50),
      },
      throughput: {
        inbound: Math.random() * 1000, // Mbps
        outbound: Math.random() * 500,
      },
      latency: Math.random() * 100, // ms
    }
  }

  /**
   * Record metric
   */
  async recordMetric(type, data) {
    // Input validation
    if (!type || typeof type !== 'string') {
      throw new Error('Invalid metric type')
    }

    if (!data) {
      throw new Error('Metric data is required')
    }

    const metric = {
      type: type.replace(/[^a-zA-Z0-9_-]/g, ''), // Sanitize type
      timestamp: Date.now(),
      data,
    }

    if (!this.metrics.has(type)) {
      this.metrics.set(type, [])
    }

    const typeMetrics = this.metrics.get(type)
    typeMetrics.push(metric)

    // Keep only last 1000 metrics per type
    if (typeMetrics.length > 1000) {
      typeMetrics.splice(0, typeMetrics.length - 1000)
    }
  }

  /**
   * Check if metrics exceed thresholds
   */
  async _checkThresholds(metrics) {
    const alerts = []

    // Check CPU usage
    if (metrics.system.cpu.usage > this.thresholds.get('cpu_usage').critical) {
      alerts.push({
        type: 'cpu_usage',
        severity: 'critical',
        value: metrics.system.cpu.usage,
        threshold: this.thresholds.get('cpu_usage').critical,
        message: `CPU usage critically high: ${metrics.system.cpu.usage.toFixed(1)}%`,
      })
    } else if (metrics.system.cpu.usage > this.thresholds.get('cpu_usage').warning) {
      alerts.push({
        type: 'cpu_usage',
        severity: 'warning',
        value: metrics.system.cpu.usage,
        threshold: this.thresholds.get('cpu_usage').warning,
        message: `CPU usage high: ${metrics.system.cpu.usage.toFixed(1)}%`,
      })
    }

    // Check memory usage
    if (metrics.system.memory.usage > this.thresholds.get('memory_usage').critical) {
      alerts.push({
        type: 'memory_usage',
        severity: 'critical',
        value: metrics.system.memory.usage,
        threshold: this.thresholds.get('memory_usage').critical,
        message: `Memory usage critically high: ${metrics.system.memory.usage.toFixed(1)}%`,
      })
    } else if (
      metrics.system.memory.usage > this.thresholds.get('memory_usage').warning
    ) {
      alerts.push({
        type: 'memory_usage',
        severity: 'warning',
        value: metrics.system.memory.usage,
        threshold: this.thresholds.get('memory_usage').warning,
        message: `Memory usage high: ${metrics.system.memory.usage.toFixed(1)}%`,
      })
    }

    // Check service health
    for (const [domain, serviceMetrics] of Object.entries(metrics.services)) {
      if (serviceMetrics.status === 'unhealthy') {
        alerts.push({
          type: 'service_health',
          severity: 'critical',
          domain,
          message: `Service ${domain} is unhealthy`,
        })
      }

      if (serviceMetrics.responseTime > this.thresholds.get('response_time').critical) {
        alerts.push({
          type: 'response_time',
          severity: 'critical',
          domain,
          value: serviceMetrics.responseTime,
          threshold: this.thresholds.get('response_time').critical,
          message: `${domain} response time critically high: ${serviceMetrics.responseTime.toFixed(0)}ms`,
        })
      }
    }

    // Process alerts
    for (const alert of alerts) {
      await this._processAlert(alert)
    }
  }

  async _processAlert(alert) {
    // Validate alert data
    if (!alert || typeof alert !== 'object') {
      logger.error('Invalid alert data provided')
      return
    }

    alert.id = `alert_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`
    alert.timestamp = Date.now()

    // Sanitize alert message to prevent XSS
    if (alert.message) {
      alert.message = alert.message.replace(/[<>"'&]/g, '')
    }

    this.alerts.push(alert)

    logger.warn('System alert triggered', alert)

    // Publish alert event
    const alertEvent = new DomainEvent(EventTypes.SYSTEM_ALERT, alert, {
      source: 'system-monitor',
    })

    await eventBus.publish(alertEvent)

    // For critical alerts, also trigger incident
    if (alert.severity === 'critical') {
      const incidentEvent = new DomainEvent(
        EventTypes.SECURITY_INCIDENT,
        {
          type: 'system_alert',
          severity: 'high',
          alertId: alert.id,
          description: alert.message,
        },
        { source: 'system-monitor' }
      )

      await eventBus.publish(incidentEvent)
    }
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(timeRange = 3600000) {
    // Last hour
    const since = Date.now() - timeRange

    return {
      overview: {
        systemHealth: this._calculateSystemHealth(),
        activeAlerts: this.alerts.filter((a) => a.timestamp >= since).length,
        totalServices: 8,
        healthyServices: this._getHealthyServicesCount(),
      },
      metrics: this._getRecentMetrics(timeRange),
      alerts: this.alerts.filter((a) => a.timestamp >= since).slice(-20),
      services: this._getServiceSummary(),
    }
  }

  _calculateSystemHealth() {
    const recentMetrics = this._getRecentMetrics(300000) // Last 5 minutes
    if (recentMetrics.length === 0) return 'unknown'

    const latestMetric = recentMetrics[recentMetrics.length - 1]
    const system = latestMetric.data.system

    if (system.cpu.usage > 90 || system.memory.usage > 95) {
      return 'critical'
    }
    if (system.cpu.usage > 70 || system.memory.usage > 80) {
      return 'warning'
    }
    return 'healthy'
  }

  _getHealthyServicesCount() {
    const recentMetrics = this._getRecentMetrics(300000)
    if (recentMetrics.length === 0) return 0

    const latestMetric = recentMetrics[recentMetrics.length - 1]
    const services = latestMetric.data.services

    return Object.values(services).filter((s) => s.status === 'healthy').length
  }

  _getRecentMetrics(timeRange) {
    const since = Date.now() - timeRange
    const systemMetrics = this.metrics.get('system_snapshot') || []

    return systemMetrics.filter((m) => m.timestamp >= since)
  }

  _getServiceSummary() {
    const recentMetrics = this._getRecentMetrics(300000)
    if (recentMetrics.length === 0) return {}

    const latestMetric = recentMetrics[recentMetrics.length - 1]
    return latestMetric.data.services
  }

  /**
   * Set custom threshold
   */
  setThreshold(metric, warning, critical, unit = '') {
    // Input validation
    if (!metric || typeof metric !== 'string') {
      throw new Error('Invalid metric name')
    }

    if (typeof warning !== 'number' || typeof critical !== 'number') {
      throw new Error('Thresholds must be numbers')
    }

    if (warning >= critical) {
      throw new Error('Warning threshold must be less than critical')
    }

    this.thresholds.set(metric, { warning, critical, unit })
    logger.info('Threshold updated', { metric, warning, critical })
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      metricsCollected: Array.from(this.metrics.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      alertsTriggered: this.alerts.length,
      monitoringActive: this.isMonitoring,
      uptime: process.uptime() * 1000,
      lastCollection: this.metrics.has('system_snapshot')
        ? Math.max(...this.metrics.get('system_snapshot').map((m) => m.timestamp))
        : null,
    }
  }
}

export const systemMonitor = new SystemMonitor()

// Auto-start monitoring
systemMonitor.startMonitoring()

export default systemMonitor
