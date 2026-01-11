/**
 * Fraud Detection System
 * Detects and prevents fraudulent activity in rewards and marketplace
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { eventBus } from '../../0-core/orchestration/event-bus.js';
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js';

const logger = createLogger('economy', 'fraud-detection');

class FraudDetectionSystem {
  constructor() {
    this.suspiciousActivities = new Map();
    this.blockedUsers = new Set();
    this.riskThresholds = {
      low: 30,
      medium: 60,
      high: 85
    };
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Monitor all economic activities
    eventBus.subscribe(EventTypes.REWARD_EARNED, (event) => {
      this.analyzeRewardActivity(event.payload);
    });

    eventBus.subscribe(EventTypes.TRANSACTION_COMPLETED, (event) => {
      this.analyzeTransactionActivity(event.payload);
    });
  }

  /**
   * Analyze reward earning patterns
   */
  async analyzeRewardActivity(rewardData) {
    const { userId, amount } = rewardData;

    const riskScore = await this._calculateRiskScore(userId, 'reward', rewardData);

    logger.debug('Analyzing reward activity', {
      userId,
      amount,
      riskScore
    });

    if (riskScore >= this.riskThresholds.high) {
      await this._flagSuspiciousActivity(userId, 'reward', riskScore, rewardData);
      return { allowed: false, reason: 'High fraud risk detected' };
    }

    return { allowed: true, riskScore };
  }

  /**
   * Analyze transaction patterns
   */
  async analyzeTransactionActivity(transactionData) {
    const { userId } = transactionData;

    const riskScore = await this._calculateRiskScore(userId, 'transaction', transactionData);

    if (riskScore >= this.riskThresholds.high) {
      await this._flagSuspiciousActivity(userId, 'transaction', riskScore, transactionData);
      return { allowed: false, reason: 'Suspicious transaction pattern' };
    }

    return { allowed: true, riskScore };
  }

  async _calculateRiskScore(userId, activityType, data) {
    let score = 0;

    // Check if user is already blocked
    if (this.blockedUsers.has(userId)) {
      return 100;
    }

    // Get user's activity history
    const history = this.suspiciousActivities.get(userId) || { activities: [], flags: 0 };

    // Pattern 1: Rapid successive activities
    const recentActivities = history.activities.filter(
      a => Date.now() - a.timestamp < 300000 // Last 5 minutes
    );
    if (recentActivities.length > 10) {
      score += 40;
      logger.warn('Rapid activity detected', { userId, count: recentActivities.length });
    }

    // Pattern 2: Unusual amounts
    if (activityType === 'reward' && data.amount > 1000) {
      score += 25;
    }

    // Pattern 3: Same session exploitation
    if (activityType === 'reward') {
      const sameSessionClaims = recentActivities.filter(
        a => a.sessionId === data.sessionId
      ).length;
      if (sameSessionClaims > 2) {
        score += 35;
        logger.warn('Multiple claims from same session', { userId, sessionId: data.sessionId });
      }
    }

    // Pattern 4: Bot-like behavior (perfectly timed actions)
    if (recentActivities.length >= 5) {
      const intervals = [];
      for (let i = 1; i < recentActivities.length; i++) {
        intervals.push(recentActivities[i].timestamp - recentActivities[i-1].timestamp);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 100) { // Very consistent timing = suspicious
        score += 30;
        logger.warn('Bot-like timing detected', { userId, variance });
      }
    }

    // Pattern 5: Previous flags
    score += history.flags * 15;

    // Update history
    history.activities.push({
      type: activityType,
      timestamp: Date.now(),
      data
    });
    // Keep only last 50 activities
    if (history.activities.length > 50) {
      history.activities = history.activities.slice(-50);
    }
    this.suspiciousActivities.set(userId, history);

    return Math.min(score, 100);
  }

  async _flagSuspiciousActivity(userId, activityType, riskScore, data) {
    const history = this.suspiciousActivities.get(userId) || { activities: [], flags: 0 };
    history.flags++;
    this.suspiciousActivities.set(userId, history);

    logger.warn('Suspicious activity flagged', {
      userId,
      activityType,
      riskScore,
      totalFlags: history.flags
    });

    // Auto-block if too many flags
    if (history.flags >= 3) {
      this.blockedUsers.add(userId);
      logger.error('User auto-blocked', { userId, flags: history.flags });
    }

    // Publish security incident event
    const event = new DomainEvent(
      EventTypes.SECURITY_INCIDENT,
      {
        userId,
        type: 'fraud_detected',
        severity: riskScore >= 90 ? 'critical' : 'high',
        activityType,
        riskScore,
        details: data
      },
      { source: 'fraud-detection' }
    );

    await eventBus.publish(event);
  }

  /**
   * Check if user is allowed to perform action
   */
  isUserAllowed(userId) {
    return !this.blockedUsers.has(userId);
  }

  /**
   * Manually review and unblock user
   */
  unblockUser(userId, reviewedBy) {
    this.blockedUsers.delete(userId);
    logger.info('User unblocked after review', { userId, reviewedBy });
  }

  /**
   * Get fraud statistics
   */
  getStats() {
    return {
      totalFlagged: this.suspiciousActivities.size,
      blockedUsers: this.blockedUsers.size,
      recentFlags: Array.from(this.suspiciousActivities.values())
        .filter(h => h.flags > 0)
        .length
    };
  }
}

export const fraudDetectionSystem = new FraudDetectionSystem();
export default fraudDetectionSystem;
