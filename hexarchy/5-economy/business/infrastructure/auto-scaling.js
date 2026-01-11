/**
 * Auto-Scaling Service
 * Dynamic resource allocation with predictive scaling
 */

class AutoScaling {
  constructor() {
    this.scalingGroups = new Map();
    this.scalingPolicies = new Map();
    this.scalingHistory = new Map();
    this.metrics = new Map();
    
    this.initializeScalingGroups();
  }

  initializeScalingGroups() {
    const groups = [
      { name: 'video-api', minInstances: 2, maxInstances: 20, desiredCapacity: 5 },
      { name: 'user-service', minInstances: 2, maxInstances: 15, desiredCapacity: 3 },
      { name: 'payment-service', minInstances: 3, maxInstances: 10, desiredCapacity: 4 },
      { name: 'content-service', minInstances: 2, maxInstances: 25, desiredCapacity: 6 }
    ];

    groups.forEach(group => {
      this.scalingGroups.set(group.name, {
        ...group,
        currentInstances: group.desiredCapacity,
        status: 'stable',
        lastScalingAction: new Date().toISOString(),
        healthyInstances: group.desiredCapacity,
        unhealthyInstances: 0
      });
    });
  }

  async scaleService({ service, targetCPU = 70, minInstances = 2, maxInstances = 20, strategy = 'reactive' }) {
    console.log(`⚡ Configuring auto-scaling for ${service}: ${minInstances}-${maxInstances} instances`);
    
    const scalingId = `scale_${Date.now()}`;
    
    const scalingConfig = {
      id: scalingId,
      service,
      strategy,
      targetCPU,
      minInstances,
      maxInstances,
      createdAt: new Date().toISOString(),
      status: 'active',
      policies: {
        scaleUp: {
          threshold: targetCPU,
          cooldown: 300, // 5 minutes
          adjustment: '+25%'
        },
        scaleDown: {
          threshold: targetCPU * 0.5,
          cooldown: 600, // 10 minutes
          adjustment: '-20%'
        }
      }
    };

    this.scalingPolicies.set(service, scalingConfig);
    
    // Update or create scaling group
    if (this.scalingGroups.has(service)) {
      const group = this.scalingGroups.get(service);
      group.minInstances = minInstances;
      group.maxInstances = maxInstances;
    } else {
      this.scalingGroups.set(service, {
        name: service,
        minInstances,
        maxInstances,
        desiredCapacity: Math.ceil((minInstances + maxInstances) / 2),
        currentInstances: minInstances,
        status: 'initializing',
        lastScalingAction: new Date().toISOString(),
        healthyInstances: minInstances,
        unhealthyInstances: 0
      });
    }
    
    return scalingConfig;
  }

  async evaluateScaling({ service, metrics }) {
    console.log(`📊 Evaluating scaling for ${service}`);
    
    const group = this.scalingGroups.get(service);
    const policy = this.scalingPolicies.get(service);
    
    if (!group || !policy) {
      throw new Error(`Service ${service} not configured for auto-scaling`);
    }

    const evaluation = {
      service,
      timestamp: new Date().toISOString(),
      currentMetrics: metrics,
      currentInstances: group.currentInstances,
      recommendation: 'no_action',
      reason: 'Metrics within normal range'
    };

    // Evaluate CPU utilization
    if (metrics.cpu > policy.policies.scaleUp.threshold) {
      const newCapacity = this.calculateScaleUp(group, policy);
      if (newCapacity > group.currentInstances) {
        evaluation.recommendation = 'scale_up';
        evaluation.targetInstances = newCapacity;
        evaluation.reason = `CPU ${metrics.cpu}% exceeds threshold ${policy.policies.scaleUp.threshold}%`;
      }
    } else if (metrics.cpu < policy.policies.scaleDown.threshold) {
      const newCapacity = this.calculateScaleDown(group, policy);
      if (newCapacity < group.currentInstances) {
        evaluation.recommendation = 'scale_down';
        evaluation.targetInstances = newCapacity;
        evaluation.reason = `CPU ${metrics.cpu}% below threshold ${policy.policies.scaleDown.threshold}%`;
      }
    }

    // Check cooldown period
    if (evaluation.recommendation !== 'no_action') {
      const timeSinceLastAction = Date.now() - new Date(group.lastScalingAction).getTime();
      const cooldownPeriod = evaluation.recommendation === 'scale_up' ? 
        policy.policies.scaleUp.cooldown * 1000 : 
        policy.policies.scaleDown.cooldown * 1000;
      
      if (timeSinceLastAction < cooldownPeriod) {
        evaluation.recommendation = 'cooldown';
        evaluation.reason = `Cooldown period active (${Math.ceil((cooldownPeriod - timeSinceLastAction) / 1000)}s remaining)`;
      }
    }

    return evaluation;
  }

  calculateScaleUp(group, policy) {
    const adjustment = policy.policies.scaleUp.adjustment;
    let newCapacity;
    
    if (adjustment.endsWith('%')) {
      const percentage = parseInt(adjustment.replace('%', '').replace('+', '')) / 100;
      newCapacity = Math.ceil(group.currentInstances * (1 + percentage));
    } else {
      newCapacity = group.currentInstances + parseInt(adjustment.replace('+', ''));
    }
    
    return Math.min(newCapacity, group.maxInstances);
  }

  calculateScaleDown(group, policy) {
    const adjustment = policy.policies.scaleDown.adjustment;
    let newCapacity;
    
    if (adjustment.endsWith('%')) {
      const percentage = parseInt(adjustment.replace('%', '').replace('-', '')) / 100;
      newCapacity = Math.floor(group.currentInstances * (1 - percentage));
    } else {
      newCapacity = group.currentInstances - parseInt(adjustment.replace('-', ''));
    }
    
    return Math.max(newCapacity, group.minInstances);
  }

  async executeScaling({ service, targetInstances, reason }) {
    console.log(`🚀 Scaling ${service} to ${targetInstances} instances: ${reason}`);
    
    const scalingActionId = `action_${Date.now()}`;
    const group = this.scalingGroups.get(service);
    
    const scalingAction = {
      id: scalingActionId,
      service,
      fromInstances: group.currentInstances,
      toInstances: targetInstances,
      reason,
      status: 'in_progress',
      startTime: new Date().toISOString()
    };

    try {
      // Simulate scaling operation
      if (targetInstances > group.currentInstances) {
        await this.scaleUp(service, targetInstances - group.currentInstances);
      } else {
        await this.scaleDown(service, group.currentInstances - targetInstances);
      }
      
      // Update group state
      group.currentInstances = targetInstances;
      group.desiredCapacity = targetInstances;
      group.lastScalingAction = new Date().toISOString();
      group.status = 'stable';
      
      scalingAction.status = 'completed';
      scalingAction.endTime = new Date().toISOString();
      scalingAction.duration = Date.now() - new Date(scalingAction.startTime).getTime();
      
    } catch (error) {
      scalingAction.status = 'failed';
      scalingAction.error = error.message;
      scalingAction.endTime = new Date().toISOString();
    }
    
    // Store scaling history
    if (!this.scalingHistory.has(service)) {
      this.scalingHistory.set(service, []);
    }
    
    const history = this.scalingHistory.get(service);
    history.push(scalingAction);
    
    // Keep only recent history
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    return scalingAction;
  }

  async scaleUp(service, instanceCount) {
    console.log(`  📈 Launching ${instanceCount} new instances for ${service}`);
    
    // Simulate instance launch time
    const launchTime = instanceCount * 30000; // 30 seconds per instance
    await new Promise(resolve => setTimeout(resolve, Math.min(launchTime / 10, 3000)));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Failed to launch instances: Resource limit exceeded');
    }
    
    return { launched: instanceCount, time: launchTime };
  }

  async scaleDown(service, instanceCount) {
    console.log(`  📉 Terminating ${instanceCount} instances for ${service}`);
    
    // Simulate graceful shutdown time
    const shutdownTime = instanceCount * 15000; // 15 seconds per instance
    await new Promise(resolve => setTimeout(resolve, Math.min(shutdownTime / 10, 2000)));
    
    return { terminated: instanceCount, time: shutdownTime };
  }

  async configure({ strategy = 'predictive', metrics = ['cpu', 'memory'], scaleUpThreshold = 70, scaleDownThreshold = 30 }) {
    console.log(`⚙️ Configuring auto-scaling: ${strategy} strategy`);
    
    const configuration = {
      id: `config_${Date.now()}`,
      strategy,
      metrics,
      thresholds: {
        scaleUp: scaleUpThreshold,
        scaleDown: scaleDownThreshold
      },
      appliedAt: new Date().toISOString(),
      settings: {
        predictiveScaling: strategy === 'predictive',
        targetTracking: strategy === 'target_tracking',
        stepScaling: strategy === 'step_scaling',
        cooldownPeriods: {
          scaleUp: 300, // 5 minutes
          scaleDown: 600 // 10 minutes
        }
      }
    };
    
    return configuration;
  }

  async getScalingMetrics(service, timeRange = '24h') {
    const group = this.scalingGroups.get(service);
    const history = this.scalingHistory.get(service) || [];
    
    if (!group) {
      throw new Error(`Service ${service} not found`);
    }

    return {
      service,
      timeRange,
      generatedAt: new Date().toISOString(),
      currentState: {
        instances: group.currentInstances,
        healthyInstances: group.healthyInstances,
        unhealthyInstances: group.unhealthyInstances,
        status: group.status,
        utilization: this.calculateUtilization(group)
      },
      scalingActivity: {
        totalActions: history.length,
        scaleUpActions: history.filter(h => h.toInstances > h.fromInstances).length,
        scaleDownActions: history.filter(h => h.toInstances < h.fromInstances).length,
        failedActions: history.filter(h => h.status === 'failed').length,
        recentActions: history.slice(-10)
      },
      performance: {
        averageResponseTime: this.getAverageResponseTime(service),
        costOptimization: this.calculateCostSavings(history),
        availabilityImpact: this.calculateAvailabilityImpact(history)
      },
      recommendations: this.generateScalingRecommendations(group, history)
    };
  }

  calculateUtilization(group) {
    return {
      cpu: 45 + Math.random() * 30, // 45-75%
      memory: 50 + Math.random() * 25, // 50-75%
      network: 30 + Math.random() * 40 // 30-70%
    };
  }

  getAverageResponseTime(service) {
    return Math.floor(150 + Math.random() * 100); // 150-250ms
  }

  calculateCostSavings(history) {
    const totalActions = history.length;
    if (totalActions === 0) return { savings: 0, percentage: 0 };
    
    const scaleDownActions = history.filter(h => h.toInstances < h.fromInstances).length;
    const savingsPercentage = (scaleDownActions / totalActions) * 15; // Estimate 15% max savings
    
    return {
      savings: Math.round(savingsPercentage * 1000), // Monthly savings in USD
      percentage: Math.round(savingsPercentage)
    };
  }

  calculateAvailabilityImpact(history) {
    const failedActions = history.filter(h => h.status === 'failed').length;
    const totalActions = history.length;
    
    if (totalActions === 0) return { uptime: 99.9, impact: 'minimal' };
    
    const failureRate = failedActions / totalActions;
    const uptime = 99.9 - (failureRate * 0.5); // Estimate impact
    
    return {
      uptime: Math.max(uptime, 99.0),
      impact: failureRate > 0.1 ? 'significant' : failureRate > 0.05 ? 'moderate' : 'minimal'
    };
  }

  generateScalingRecommendations(group, history) {
    const recommendations = [];
    
    // Check if frequently scaling
    const recentActions = history.filter(h => 
      Date.now() - new Date(h.startTime).getTime() < 24 * 60 * 60 * 1000
    );
    
    if (recentActions.length > 10) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: 'Consider adjusting scaling thresholds to reduce frequent scaling',
        action: 'Review CPU/memory thresholds and cooldown periods'
      });
    }
    
    // Check capacity utilization
    const utilizationRatio = group.currentInstances / group.maxInstances;
    if (utilizationRatio > 0.8) {
      recommendations.push({
        type: 'capacity',
        priority: 'high',
        message: 'Consider increasing maximum instance limit',
        action: `Current: ${group.maxInstances}, Suggested: ${Math.ceil(group.maxInstances * 1.5)}`
      });
    }
    
    return recommendations;
  }

  async listScalingGroups() {
    return Array.from(this.scalingGroups.values()).map(group => ({
      name: group.name,
      currentInstances: group.currentInstances,
      minInstances: group.minInstances,
      maxInstances: group.maxInstances,
      status: group.status,
      healthyInstances: group.healthyInstances
    }));
  }

  async getScalingGroup(service) {
    return this.scalingGroups.get(service) || null;
  }

  async getScalingPolicy(service) {
    return this.scalingPolicies.get(service) || null;
  }

  async updateScalingPolicy({ service, scaleUpThreshold, scaleDownThreshold, cooldownPeriod }) {
    const policy = this.scalingPolicies.get(service);
    if (!policy) {
      throw new Error(`No scaling policy found for service: ${service}`);
    }
    
    if (scaleUpThreshold) policy.policies.scaleUp.threshold = scaleUpThreshold;
    if (scaleDownThreshold) policy.policies.scaleDown.threshold = scaleDownThreshold;
    if (cooldownPeriod) {
      policy.policies.scaleUp.cooldown = cooldownPeriod;
      policy.policies.scaleDown.cooldown = cooldownPeriod * 2; // Scale down slower
    }
    
    console.log(`⚙️ Updated scaling policy for ${service}`);
    
    return policy;
  }
}

module.exports = new AutoScaling();