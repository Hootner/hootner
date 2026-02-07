/**
 * Business Metrics Service
 * KPI tracking and executive dashboards
 */

class BusinessMetrics {
  constructor() {
    this.metrics = new Map();
    this.kpis = new Map();
    this.dashboards = new Map();
    this.alerts = new Map();
    
    this.initializeKPIs();
  }

  initializeKPIs() {
    const kpiDefinitions = [
      { name: 'daily_active_users', type: 'gauge', target: 10000, unit: 'users' },
      { name: 'monthly_recurring_revenue', type: 'currency', target: 100000, unit: 'USD' },
      { name: 'customer_acquisition_cost', type: 'currency', target: 50, unit: 'USD' },
      { name: 'churn_rate', type: 'percentage', target: 5, unit: '%' },
      { name: 'video_upload_rate', type: 'rate', target: 1000, unit: 'uploads/day' },
      { name: 'user_engagement_score', type: 'score', target: 75, unit: 'score' },
      { name: 'revenue_per_user', type: 'currency', target: 15, unit: 'USD' },
      { name: 'content_moderation_accuracy', type: 'percentage', target: 95, unit: '%' }
    ];

    kpiDefinitions.forEach(kpi => {
      this.kpis.set(kpi.name, {
        ...kpi,
        currentValue: 0,
        previousValue: 0,
        trend: 'stable',
        lastUpdated: null,
        history: []
      });
    });
  }

  async trackKPI({ metric, value, dimensions = {}, timestamp = new Date().toISOString() }) {
    console.log(`📊 Tracking KPI: ${metric} = ${value}`);
    
    if (!this.kpis.has(metric)) {
      throw new Error(`KPI ${metric} not defined`);
    }

    const kpi = this.kpis.get(metric);
    const dataPoint = {
      value,
      dimensions,
      timestamp,
      id: `${metric}_${Date.now()}`
    };

    // Update KPI
    kpi.previousValue = kpi.currentValue;
    kpi.currentValue = value;
    kpi.lastUpdated = timestamp;
    kpi.trend = this.calculateTrend(kpi.previousValue, kpi.currentValue);
    
    // Add to history
    kpi.history.push(dataPoint);
    
    // Keep only last 100 data points
    if (kpi.history.length > 100) {
      kpi.history = kpi.history.slice(-100);
    }

    // Check for alerts
    await this.checkKPIAlerts(metric, kpi);
    
    return {
      metric,
      value,
      previousValue: kpi.previousValue,
      trend: kpi.trend,
      target: kpi.target,
      performance: this.calculatePerformance(value, kpi.target, kpi.type)
    };
  }

  calculateTrend(previous, current) {
    if (previous === 0) return 'stable';
    
    const change = (current - previous) / previous;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  calculatePerformance(value, target, type) {
    if (target === 0) return 'unknown';
    
    const ratio = value / target;
    
    // For percentage and rate metrics, higher is generally better
    if (['percentage', 'rate', 'gauge', 'score'].includes(type)) {
      if (ratio >= 1) return 'exceeding';
      if (ratio >= 0.9) return 'on_track';
      if (ratio >= 0.7) return 'at_risk';
      return 'critical';
    }
    
    // For cost metrics, lower is better
    if (type === 'currency' && ['cost', 'cac'].some(word => target < 100)) {
      if (ratio <= 0.8) return 'exceeding';
      if (ratio <= 1) return 'on_track';
      if (ratio <= 1.2) return 'at_risk';
      return 'critical';
    }
    
    // Default: higher is better
    if (ratio >= 1) return 'exceeding';
    if (ratio >= 0.9) return 'on_track';
    if (ratio >= 0.7) return 'at_risk';
    return 'critical';
  }

  async checkKPIAlerts(metricName, kpi) {
    const performance = this.calculatePerformance(kpi.currentValue, kpi.target, kpi.type);
    
    if (performance === 'critical') {
      const alert = {
        id: `alert_${metricName}_${Date.now()}`,
        metric: metricName,
        type: 'KPI_CRITICAL',
        severity: 'high',
        message: `${metricName} is critically below target: ${kpi.currentValue} vs ${kpi.target}`,
        value: kpi.currentValue,
        target: kpi.target,
        timestamp: new Date().toISOString()
      };
      
      this.alerts.set(alert.id, alert);
      console.log(`🚨 KPI Alert: ${alert.message}`);
    }
  }

  async generateDashboard({ name, kpis, timeRange = '7d' }) {
    console.log(`📈 Generating dashboard: ${name}`);
    
    const dashboard = {
      name,
      generatedAt: new Date().toISOString(),
      timeRange,
      kpis: [],
      summary: {
        totalKPIs: kpis.length,
        exceeding: 0,
        onTrack: 0,
        atRisk: 0,
        critical: 0
      }
    };

    for (const kpiName of kpis) {
      if (this.kpis.has(kpiName)) {
        const kpi = this.kpis.get(kpiName);
        const performance = this.calculatePerformance(kpi.currentValue, kpi.target, kpi.type);
        
        const kpiData = {
          name: kpiName,
          currentValue: kpi.currentValue,
          target: kpi.target,
          trend: kpi.trend,
          performance,
          unit: kpi.unit,
          lastUpdated: kpi.lastUpdated,
          sparkline: this.generateSparkline(kpi.history, timeRange)
        };
        
        dashboard.kpis.push(kpiData);
        dashboard.summary[performance.replace('_', '')]++;
      }
    }

    this.dashboards.set(name, dashboard);
    return dashboard;
  }

  generateSparkline(history, timeRange) {
    const rangeMs = this.parseTimeRange(timeRange);
    const cutoff = new Date(Date.now() - rangeMs);
    
    const recentData = history
      .filter(point => new Date(point.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-20); // Last 20 points
    
    return recentData.map(point => ({
      timestamp: point.timestamp,
      value: point.value
    }));
  }

  parseTimeRange(range) {
    const match = range.match(/(\d+)([dhm])/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    
    const [, value, unit] = match;
    const multipliers = { m: 60000, h: 3600000, d: 86400000 };
    
    return parseInt(value) * multipliers[unit];
  }

  async getExecutiveSummary() {
    const summary = {
      generatedAt: new Date().toISOString(),
      keyMetrics: {},
      performance: { exceeding: 0, onTrack: 0, atRisk: 0, critical: 0 },
      trends: { improving: 0, stable: 0, declining: 0 },
      alerts: Array.from(this.alerts.values()).slice(-5) // Last 5 alerts
    };

    // Key business metrics
    const keyKPIs = ['daily_active_users', 'monthly_recurring_revenue', 'churn_rate', 'user_engagement_score'];
    
    for (const kpiName of keyKPIs) {
      if (this.kpis.has(kpiName)) {
        const kpi = this.kpis.get(kpiName);
        const performance = this.calculatePerformance(kpi.currentValue, kpi.target, kpi.type);
        
        summary.keyMetrics[kpiName] = {
          value: kpi.currentValue,
          target: kpi.target,
          trend: kpi.trend,
          performance,
          unit: kpi.unit
        };
        
        summary.performance[performance.replace('_', '')]++;
        summary.trends[kpi.trend === 'increasing' ? 'improving' : kpi.trend === 'decreasing' ? 'declining' : 'stable']++;
      }
    }

    return summary;
  }

  async calculateMetric({ name, formula, dimensions = {} }) {
    // Mock metric calculation - replace with actual business logic
    const calculations = {
      customer_lifetime_value: () => Math.random() * 500 + 200,
      conversion_rate: () => Math.random() * 0.1 + 0.02,
      average_session_duration: () => Math.random() * 600 + 300,
      content_engagement_rate: () => Math.random() * 0.3 + 0.1
    };

    const value = calculations[name] ? calculations[name]() : Math.random() * 100;
    
    return {
      name,
      value,
      dimensions,
      calculatedAt: new Date().toISOString(),
      formula
    };
  }

  async track({ kpi, value, dimensions = {} }) {
    console.log(`📊 Tracking business metric: ${kpi} = ${value}`);
    return await this.trackKPI({ metric: kpi, value, dimensions });
  }

  async getDashboard(name) {
    return this.dashboards.get(name) || null;
  }

  async listKPIs() {
    return Array.from(this.kpis.entries()).map(([name, kpi]) => ({
      name,
      currentValue: kpi.currentValue,
      target: kpi.target,
      trend: kpi.trend,
      performance: this.calculatePerformance(kpi.currentValue, kpi.target, kpi.type),
      unit: kpi.unit,
      lastUpdated: kpi.lastUpdated
    }));
  }
}

module.exports = new BusinessMetrics();