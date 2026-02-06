// Monitoring and Observability Service
import { logger } from '../../0-core/logging/logger.js';

export class MonitoringService {
  constructor(prometheusClient, grafanaClient, alertManager) {
    this.prometheusClient = prometheusClient;
    this.grafanaClient = grafanaClient;
    this.alertManager = alertManager;

    // Metric types
    this.metricTypes = {
      COUNTER: 'counter',
      GAUGE: 'gauge',
      HISTOGRAM: 'histogram',
      SUMMARY: 'summary'
    };

    // Alert severities
    this.severities = {
      CRITICAL: 'critical',
      WARNING: 'warning',
      INFO: 'info'
    };
  }

  // Record metric
  async recordMetric(metricData) {
    const {
      name,
      value,
      type = this.metricTypes.GAUGE,
      labels = {},
      timestamp = Date.now()
    } = metricData;

    await this.prometheusClient.pushMetric({
      metric: name,
      value,
      type,
      labels,
      timestamp
    });

    logger.debug('Metric recorded', { name, value });
  }

  // Query metrics
  async queryMetrics(query, startTime, endTime) {
    try {
      const results = await this.prometheusClient.query(query, {
        start: startTime,
        end: endTime
      });

      return results;
    } catch (error) {
      logger.error('Failed to query metrics:', error);
      throw error;
    }
  }

  // Get system metrics
  async getSystemMetrics(service, timeRange = '1h') {
    const metrics = {
      cpu: await this.getCPUUsage(service, timeRange),
      memory: await this.getMemoryUsage(service, timeRange),
      disk: await this.getDiskUsage(service, timeRange),
      network: await this.getNetworkMetrics(service, timeRange),
      requests: await this.getRequestMetrics(service, timeRange)
    };

    return metrics;
  }

  // Get CPU usage
  async getCPUUsage(service, timeRange) {
    const query = `avg(rate(container_cpu_usage_seconds_total{service="${service}"}[5m]))`;
    const results = await this.queryMetrics(query, this.getTimeRangeStart(timeRange), Date.now());

    return {
      current: results[results.length - 1]?.value || 0,
      average: results.reduce((sum, r) => sum + r.value, 0) / results.length,
      max: Math.max(...results.map(r => r.value)),
      timeline: results
    };
  }

  // Get memory usage
  async getMemoryUsage(service, timeRange) {
    const query = `avg(container_memory_usage_bytes{service="${service}"})`;
    const results = await this.queryMetrics(query, this.getTimeRangeStart(timeRange), Date.now());

    return {
      current: results[results.length - 1]?.value || 0,
      average: results.reduce((sum, r) => sum + r.value, 0) / results.length,
      max: Math.max(...results.map(r => r.value)),
      timeline: results
    };
  }

  // Get disk usage
  async getDiskUsage(service, timeRange) {
    const query = `avg(node_filesystem_avail_bytes{service="${service}"})`;
    const results = await this.queryMetrics(query, this.getTimeRangeStart(timeRange), Date.now());

    return {
      available: results[results.length - 1]?.value || 0,
      timeline: results
    };
  }

  // Get network metrics
  async getNetworkMetrics(service, timeRange) {
    const inQuery = `rate(container_network_receive_bytes_total{service="${service}"}[5m])`;
    const outQuery = `rate(container_network_transmit_bytes_total{service="${service}"}[5m])`;

    const incoming = await this.queryMetrics(inQuery, this.getTimeRangeStart(timeRange), Date.now());
    const outgoing = await this.queryMetrics(outQuery, this.getTimeRangeStart(timeRange), Date.now());

    return {
      incomingBytes: incoming[incoming.length - 1]?.value || 0,
      outgoingBytes: outgoing[outgoing.length - 1]?.value || 0,
      timeline: {
        incoming,
        outgoing
      }
    };
  }

  // Get request metrics
  async getRequestMetrics(service, timeRange) {
    const requestsQuery = `rate(http_requests_total{service="${service}"}[5m])`;
    const errorsQuery = `rate(http_requests_total{service="${service}", status=~"5.."}[5m])`;
    const latencyQuery = `histogram_quantile(0.95, http_request_duration_seconds{service="${service}"})`;

    const requests = await this.queryMetrics(requestsQuery, this.getTimeRangeStart(timeRange), Date.now());
    const errors = await this.queryMetrics(errorsQuery, this.getTimeRangeStart(timeRange), Date.now());
    const latency = await this.queryMetrics(latencyQuery, this.getTimeRangeStart(timeRange), Date.now());

    const totalRequests = requests.reduce((sum, r) => sum + r.value, 0);
    const totalErrors = errors.reduce((sum, r) => sum + r.value, 0);

    return {
      requestRate: requests[requests.length - 1]?.value || 0,
      errorRate: totalErrors / totalRequests || 0,
      p95Latency: latency[latency.length - 1]?.value || 0,
      timeline: {
        requests,
        errors,
        latency
      }
    };
  }

  // Create alert rule
  async createAlertRule(ruleConfig) {
    const {
      name,
      query,
      condition, // e.g., '> 0.8' for 80%
      duration = '5m',
      severity = this.severities.WARNING,
      annotations = {}
    } = ruleConfig;

    const rule = {
      alert: name,
      expr: `${query} ${condition}`,
      for: duration,
      labels: { severity },
      annotations
    };

    await this.alertManager.createRule(rule);
    logger.info('Alert rule created', { name });

    return rule;
  }

  // Get active alerts
  async getActiveAlerts(filters = {}) {
    const alerts = await this.alertManager.getAlerts(filters);
    return alerts;
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId, acknowledgedBy) {
    await this.alertManager.acknowledge(alertId, {
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString()
    });

    logger.info('Alert acknowledged', { alertId, acknowledgedBy });
  }

  // Resolve alert
  async resolveAlert(alertId, resolvedBy, resolution) {
    await this.alertManager.resolve(alertId, {
      resolvedBy,
      resolution,
      resolvedAt: new Date().toISOString()
    });

    logger.info('Alert resolved', { alertId, resolvedBy });
  }

  // Create dashboard
  async createDashboard(dashboardConfig) {
    const {
      title,
      description,
      panels = [],
      refresh = '30s'
    } = dashboardConfig;

    const dashboard = await this.grafanaClient.createDashboard({
      title,
      description,
      panels,
      refresh,
      timezone: 'browser'
    });

    logger.info('Dashboard created', { title, id: dashboard.id });
    return dashboard;
  }

  // Get dashboard
  async getDashboard(dashboardId) {
    return await this.grafanaClient.getDashboard(dashboardId);
  }

  // Create service health dashboard
  async createServiceHealthDashboard(service) {
    const panels = [
      {
        title: 'CPU Usage',
        type: 'graph',
        query: `avg(rate(container_cpu_usage_seconds_total{service="${service}"}[5m]))`
      },
      {
        title: 'Memory Usage',
        type: 'graph',
        query: `avg(container_memory_usage_bytes{service="${service}"})`
      },
      {
        title: 'Request Rate',
        type: 'graph',
        query: `rate(http_requests_total{service="${service}"}[5m])`
      },
      {
        title: 'Error Rate',
        type: 'graph',
        query: `rate(http_requests_total{service="${service}", status=~"5.."}[5m])`
      },
      {
        title: 'P95 Latency',
        type: 'graph',
        query: `histogram_quantile(0.95, http_request_duration_seconds{service="${service}"})`
      }
    ];

    return await this.createDashboard({
      title: `${service} - Service Health`,
      description: `Health metrics for ${service}`,
      panels
    });
  }

  // Get service health status
  async getServiceHealthStatus(service) {
    const metrics = await this.getSystemMetrics(service, '5m');

    // Define health thresholds
    const thresholds = {
      cpu: 0.8,        // 80%
      memory: 0.85,    // 85%
      errorRate: 0.05, // 5%
      latency: 1000    // 1 second
    };

    const health = {
      service,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // CPU check
    if (metrics.cpu.current > thresholds.cpu) {
      health.status = 'unhealthy';
      health.checks.cpu = { status: 'fail', value: metrics.cpu.current, threshold: thresholds.cpu };
    } else {
      health.checks.cpu = { status: 'pass', value: metrics.cpu.current };
    }

    // Memory check
    if (metrics.memory.current > thresholds.memory) {
      health.status = 'unhealthy';
      health.checks.memory = { status: 'fail', value: metrics.memory.current, threshold: thresholds.memory };
    } else {
      health.checks.memory = { status: 'pass', value: metrics.memory.current };
    }

    // Error rate check
    if (metrics.requests.errorRate > thresholds.errorRate) {
      health.status = 'degraded';
      health.checks.errorRate = { status: 'warn', value: metrics.requests.errorRate, threshold: thresholds.errorRate };
    } else {
      health.checks.errorRate = { status: 'pass', value: metrics.requests.errorRate };
    }

    // Latency check
    if (metrics.requests.p95Latency > thresholds.latency) {
      health.status = 'degraded';
      health.checks.latency = { status: 'warn', value: metrics.requests.p95Latency, threshold: thresholds.latency };
    } else {
      health.checks.latency = { status: 'pass', value: metrics.requests.p95Latency };
    }

    return health;
  }

  // Get time range start
  getTimeRangeStart(timeRange) {
    const now = Date.now();
    const match = timeRange.match(/(\d+)([smhd])/);

    if (!match) return now - (60 * 60 * 1000); // Default 1 hour

    const [, amount, unit] = match;
    const value = parseInt(amount);

    switch (unit) {
      case 's':
        return now - (value * 1000);
      case 'm':
        return now - (value * 60 * 1000);
      case 'h':
        return now - (value * 60 * 60 * 1000);
      case 'd':
        return now - (value * 24 * 60 * 60 * 1000);
      default:
        return now - (60 * 60 * 1000);
    }
  }

  // Get platform overview
  async getPlatformOverview() {
    const services = ['api', 'frontend', 'video-processing', 'database', 'cache'];

    const overview = {
      timestamp: new Date().toISOString(),
      services: {},
      alerts: await this.getActiveAlerts(),
      summary: {
        totalServices: services.length,
        healthyServices: 0,
        degradedServices: 0,
        unhealthyServices: 0
      }
    };

    for (const service of services) {
      const health = await this.getServiceHealthStatus(service);
      overview.services[service] = health;

      if (health.status === 'healthy') {
        overview.summary.healthyServices++;
      } else if (health.status === 'degraded') {
        overview.summary.degradedServices++;
      } else {
        overview.summary.unhealthyServices++;
      }
    }

    return overview;
  }
}

export default MonitoringService;
