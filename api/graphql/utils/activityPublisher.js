/**
 * Activity Publisher - Publishes real system events to WebSocket subscribers
 * Used by all services (video, deployment, security, etc.) to notify the dashboard
 */

import { pubsub } from '../resolvers/subscriptions.js';

export class ActivityPublisher {
  /**
   * Publish a system activity event
   * @param {Object} activity - Activity object with required fields
   */
  static async publishActivity(activity) {
    const enrichedActivity = {
      id: activity.id || `activity_${Date.now()}`,
      type: activity.type || 'SYSTEM_ALERT',
      message: activity.message || 'System event',
      description: activity.description || '',
      category: activity.category || 'general',
      service: activity.service || 'system',
      timestamp: activity.timestamp || new Date().toISOString(),
      userId: activity.userId || null,
      metadata: activity.metadata || null,
    };

    try {
      await pubsub.publish('ACTIVITY_STREAM', {
        activityStream: enrichedActivity,
      });
      console.log(
        `📨 Activity published: ${enrichedActivity.type} - ${enrichedActivity.message}`
      );
    } catch (error) {
      console.error('❌ Failed to publish activity:', error);
    }
  }

  /**
   * Publish video-related events
   */
  static async publishVideoEvent(videoId, type, message, userId) {
    await this.publishActivity({
      type: 'VIDEO_UPLOADED',
      message: message || `Video processed: ${videoId}`,
      description: `Video ID: ${videoId}`,
      category: 'content',
      service: 'video-service',
      userId: userId,
    });
  }

  /**
   * Publish deployment events
   */
  static async publishDeploymentEvent(version, status, message) {
    const type = status === 'success' ? 'DEPLOYMENT_SUCCESS' : 'DEPLOYMENT_FAILED';
    await this.publishActivity({
      type,
      message: message || `Deployment ${status}: v${version}`,
      description: `Version: ${version}`,
      category: 'deployment',
      service: 'deployment-pipeline',
    });
  }

  /**
   * Publish security events
   */
  static async publishSecurityEvent(scanType, findings, severity = 'low') {
    await this.publishActivity({
      type: 'SECURITY_SCAN',
      message: `Security scan completed: ${findings} issues found`,
      description: `Scan Type: ${scanType}, Severity: ${severity}`,
      category: 'security',
      service: 'security-service',
    });
  }

  /**
   * Publish AI agent events
   */
  static async publishAgentEvent(agentName, action, details) {
    await this.publishActivity({
      type: 'AI_AGENT_ACTIVATED',
      message: `AI Agent "${agentName}" ${action}`,
      description: details,
      category: 'ai',
      service: 'agent-hub',
    });
  }

  /**
   * Publish payment events
   */
  static async publishPaymentEvent(amount, status, currency = 'USD') {
    await this.publishActivity({
      type: 'PAYMENT_PROCESSED',
      message: `Payment processed: ${amount} ${currency}`,
      description: `Status: ${status}`,
      category: 'payment',
      service: 'payment-service',
    });
  }

  /**
   * Publish autoscaling events
   */
  static async publishScalingEvent(service, action, reason) {
    await this.publishActivity({
      type: 'AUTO_SCALING',
      message: `Auto-scaling: ${service} - ${action}`,
      description: `Reason: ${reason}`,
      category: 'infrastructure',
      service: 'auto-scaler',
    });
  }

  /**
   * Publish user events
   */
  static async publishUserEvent(action, userId, details) {
    const type = action === 'new' ? 'NEW_USER' : 'USER_ACTIVITY';
    await this.publishActivity({
      type,
      message: `User event: ${action}`,
      description: details,
      category: 'user',
      service: 'user-service',
      userId,
    });
  }

  /**
   * Publish analytics events
   */
  static async publishAnalyticsEvent(reportType, metrics) {
    await this.publishActivity({
      type: 'ANALYTICS_REPORT',
      message: `Analytics report generated: ${reportType}`,
      description: `Metrics: ${JSON.stringify(metrics).substring(0, 100)}...`,
      category: 'analytics',
      service: 'analytics-service',
    });
  }

  /**
   * Publish system health events
   */
  static async publishHealthEvent(status, message) {
    await this.publishActivity({
      type: status === 'healthy' ? 'SYSTEM_HEALTHY' : 'ALERT_CRITICAL',
      message: message || `System status: ${status}`,
      description: 'Health check completed',
      category: 'system',
      service: 'monitoring',
    });
  }

  /**
   * Publish collaboration events
   */
  static async publishCollaborationEvent(sessionId, participants, action) {
    await this.publishActivity({
      type: 'COLLABORATION_SESSION',
      message: `Collaboration session ${action}: ${participants} participants`,
      description: `Session ID: ${sessionId}`,
      category: 'collaboration',
      service: 'collab-service',
    });
  }

  /**
   * Batch publish multiple activities
   */
  static async publishBatch(activities) {
    for (const activity of activities) {
      await this.publishActivity(activity);
    }
  }

  /**
   * Generate demo activities for testing
   */
  static async generateDemoActivities() {
    const demoEvents = [
      {
        type: 'VIDEO_UPLOADED',
        message: 'User uploaded 4K video',
        description: 'Cinema Player Demo.mp4 (2.4 GB)',
        category: 'content',
        service: 'video-service',
      },
      {
        type: 'DEPLOYMENT_SUCCESS',
        message: 'Deployment successful: v2.1.4',
        description: 'All services deployed',
        category: 'deployment',
        service: 'deployment-pipeline',
      },
      {
        type: 'SECURITY_SCAN',
        message: 'Security scan completed: 2 issues found',
        description: 'Scan Type: DAST, Severity: low',
        category: 'security',
        service: 'security-service',
      },
      {
        type: 'AI_AGENT_ACTIVATED',
        message: 'AI Agent "CodeAnalyzer" activated',
        description: 'Analyzing repository',
        category: 'ai',
        service: 'agent-hub',
      },
      {
        type: 'PAYMENT_PROCESSED',
        message: 'Payment processed: $149.99',
        description: 'Status: completed',
        category: 'payment',
        service: 'payment-service',
      },
    ];

    for (const event of demoEvents) {
      await this.publishActivity(event);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Space out events
    }
  }
}

export default ActivityPublisher;
