/**
 * Activity Stream Generator - Simulates real system events for demo/testing
 * Publishes realistic events to WebSocket subscribers
 */

import ActivityPublisher from '../utils/activityPublisher.js';

let generatorInterval = null;
let isRunning = false;

export class ActivityStreamGenerator {
  /**
   * Start generating demo activities
   * @param {number} intervalMs - Interval between events (default 3 seconds)
   */
  static startGenerator(intervalMs = 3000) {
    if (isRunning) {
      console.log('⚠️ Activity generator already running');
      return;
    }

    isRunning = true;
    console.log('🚀 Starting Activity Stream Generator...');

    // Initial burst of events
    this.generateBurstEvents();

    // Generate ongoing events
    generatorInterval = setInterval(() => {
      this.generateRandomEvent();
    }, intervalMs);

    console.log(`✅ Activity generator running (event every ${intervalMs}ms)`);
  }

  /**
   * Stop generating activities
   */
  static stopGenerator() {
    if (generatorInterval) {
      clearInterval(generatorInterval);
      generatorInterval = null;
      isRunning = false;
      console.log('🛑 Activity generator stopped');
    }
  }

  /**
   * Generate a burst of initial events
   */
  static async generateBurstEvents() {
    const events = [
      {
        type: 'SYSTEM_HEALTHY',
        message: 'System online and healthy',
        description: 'All services operational',
        category: 'system',
        service: 'monitoring'
      },
      {
        type: 'VIDEO_UPLOADED',
        message: 'User @creator_pro uploaded 4K video',
        description: 'File: "Summer_Vacation.mp4" (2.4 GB)',
        category: 'content',
        service: 'video-service',
        userId: 'user_123'
      },
      {
        type: 'DEPLOYMENT_SUCCESS',
        message: 'Deployment successful: v2.1.4',
        description: 'Frontend + Backend deployed to production',
        category: 'deployment',
        service: 'deployment-pipeline'
      }
    ];

    for (const event of events) {
      await ActivityPublisher.publishActivity(event);
      await this.delay(500);
    }
  }

  /**
   * Generate a random event
   */
  static async generateRandomEvent() {
    const eventTypes = [
      {
        type: 'VIDEO_UPLOADED',
        message: () => `User uploaded video: "${this.randomVideoTitle()}"`,
        description: () => `Size: ${this.randomSize()} | Duration: ${this.randomDuration()}m`,
        category: 'content',
        service: 'video-service'
      },
      {
        type: 'DEPLOYMENT_SUCCESS',
        message: () => `Deployment successful: v${this.randomVersion()}`,
        description: () => `Services: API, Frontend, Workers | Duration: ${this.random(2, 10)}s`,
        category: 'deployment',
        service: 'deployment-pipeline'
      },
      {
        type: 'AI_AGENT_ACTIVATED',
        message: () => `AI Agent "${this.randomAgent()}" activated`,
        description: () => `Processing: ${this.randomTask()}`,
        category: 'ai',
        service: 'agent-hub'
      },
      {
        type: 'PAYMENT_PROCESSED',
        message: () => `Payment processed: $${this.random(10, 999)}.99`,
        description: () => 'Subscription renewal | Status: completed',
        category: 'payment',
        service: 'payment-service'
      },
      {
        type: 'SECURITY_SCAN',
        message: () => `Security scan completed: ${this.random(0, 5)} issues found`,
        description: () => `Scan Type: ${this.randomScanType()} | Severity: ${this.randomSeverity()}`,
        category: 'security',
        service: 'security-service'
      },
      {
        type: 'AUTO_SCALING',
        message: () => `Auto-scaling triggered: ${this.randomScalingService()}`,
        description: () => `Action: scale ${this.randomDirection()} | Reason: ${this.randomReason()}`,
        category: 'infrastructure',
        service: 'auto-scaler'
      },
      {
        type: 'NEW_USER',
        message: () => `New user registered: ${this.randomUserName()}`,
        description: () => `Email: ${this.randomEmail()} | Plan: ${this.randomPlan()}`,
        category: 'user',
        service: 'user-service'
      },
      {
        type: 'ANALYTICS_REPORT',
        message: () => 'Analytics report generated',
        description: () => `Viewers: ${this.random(1000, 50000)} | Watch time: ${this.random(100, 10000)}h`,
        category: 'analytics',
        service: 'analytics-service'
      },
      {
        type: 'COLLABORATION_SESSION',
        message: () => 'Collaboration session started',
        description: () => `Participants: ${this.random(2, 20)} | Duration: ${this.random(5, 120)}m`,
        category: 'collaboration',
        service: 'collab-service'
      }
    ];

    const eventTemplate = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    await ActivityPublisher.publishActivity({
      type: eventTemplate.type,
      message: typeof eventTemplate.message === 'function' ? eventTemplate.message() : eventTemplate.message,
      description: typeof eventTemplate.description === 'function' ? eventTemplate.description() : eventTemplate.description,
      category: eventTemplate.category,
      service: eventTemplate.service,
      userId: Math.random() > 0.7 ? `user_${this.random(1, 1000)}` : null
    });
  }

  /**
   * Utility methods for generating random data
   */
  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static randomVideoTitle() {
    const titles = [
      'Summer Vacation 4K',
      'Product Demo',
      'Tutorial: React Hooks',
      'Behind the Scenes',
      'Live Concert',
      'Conference Talk',
      'Gaming Highlights',
      'Nature Documentary'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  static randomSize() {
    return `${this.random(100, 2400)}MB`;
  }

  static randomDuration() {
    return this.random(5, 120);
  }

  static randomVersion() {
    return `${this.random(1, 5)}.${this.random(0, 9)}.${this.random(0, 9)}`;
  }

  static randomAgent() {
    const agents = [
      'CodeReview',
      'SecurityBot',
      'PerformanceOptimizer',
      'ContentModerator',
      'AnalyticsEngine',
      'RecommendationEngine'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  static randomTask() {
    const tasks = [
      'analyzing code',
      'running security scan',
      'optimizing performance',
      'generating recommendations',
      'moderating content',
      'processing analytics'
    ];
    return tasks[Math.floor(Math.random() * tasks.length)];
  }

  static randomScanType() {
    const types = ['DAST', 'SAST', 'Dependency', 'Infrastructure', 'Container'];
    return types[Math.floor(Math.random() * types.length)];
  }

  static randomSeverity() {
    const severities = ['critical', 'high', 'medium', 'low'];
    return severities[Math.floor(Math.random() * severities.length)];
  }

  static randomScalingService() {
    const services = ['API Cluster', 'Worker Pool', 'Cache Layer', 'Database Replicas'];
    return services[Math.floor(Math.random() * services.length)];
  }

  static randomDirection() {
    return Math.random() > 0.5 ? 'up' : 'down';
  }

  static randomReason() {
    const reasons = ['high CPU', 'high memory', 'high traffic', 'low traffic'];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  static randomUserName() {
    const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley'];
    const domains = ['creator', 'user', 'dev', 'pro'];
    return `${names[Math.floor(Math.random() * names.length)]}_${domains[Math.floor(Math.random() * domains.length)]}`;
  }

  static randomEmail() {
    return `${this.randomUserName()}@example.com`;
  }

  static randomPlan() {
    const plans = ['Free', 'Pro', 'Enterprise', 'Premium'];
    return plans[Math.floor(Math.random() * plans.length)];
  }

  /**
   * Check if generator is running
   */
  static isRunning() {
    return isRunning;
  }

  /**
   * Get generator status
   */
  static getStatus() {
    return {
      isRunning,
      interval: generatorInterval ? 'active' : 'inactive'
    };
  }
}

export default ActivityStreamGenerator;
