// Content Moderation Policy Service
import { logger } from '../../0-core/logging/logger.js';

export class ContentModerationPolicyService {
  constructor(moderationRepository, contentModerationService) {
    this.moderationRepository = moderationRepository;
    this.contentModerationService = contentModerationService;

    // Moderation actions
    this.actions = {
      APPROVE: 'approve',
      REMOVE: 'remove',
      WARN: 'warn',
      RESTRICT: 'restrict',
      BAN: 'ban',
      AGE_RESTRICT: 'age_restrict',
      DEMONETIZE: 'demonetize'
    };

    // Violation severity
    this.severity = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  // Review content
  async reviewContent(contentId, contentType, moderatorId) {
    try {
      // Get content
      const content = await this.getContent(contentId, contentType);

      // Run automated checks
      const autoModeration = await this.contentModerationService.moderateContent(content, contentType);

      // Create review record
      const review = await this.moderationRepository.createReview({
        contentId,
        contentType,
        moderatorId,
        autoModeration,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Auto-action on high confidence flags
      if (autoModeration.confidence > 0.9 && !autoModeration.approved) {
        await this.takeAction(review.id, this.actions.REMOVE, 'Automated removal - high confidence violation');
      }

      logger.info('Content review created', { reviewId: review.id, contentId, contentType });
      return review;
    } catch (error) {
      logger.error('Failed to review content:', error);
      throw error;
    }
  }

  // Take moderation action
  async takeAction(reviewId, action, reason, moderatorId = null) {
    try {
      const review = await this.moderationRepository.findReviewById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Apply action
      switch (action) {
        case this.actions.APPROVE:
          await this.approveContent(review);
          break;
        case this.actions.REMOVE:
          await this.removeContent(review);
          break;
        case this.actions.WARN:
          await this.warnCreator(review);
          break;
        case this.actions.RESTRICT:
          await this.restrictContent(review);
          break;
        case this.actions.AGE_RESTRICT:
          await this.ageRestrictContent(review);
          break;
        case this.actions.DEMONETIZE:
          await this.demonetizeContent(review);
          break;
        case this.actions.BAN:
          await this.banCreator(review);
          break;
      }

      // Update review
      review.action = action;
      review.reason = reason;
      review.moderatorId = moderatorId;
      review.status = 'completed';
      review.completedAt = new Date().toISOString();

      await this.moderationRepository.updateReview(reviewId, review);

      logger.info('Moderation action taken', { reviewId, action, reason });
      return review;
    } catch (error) {
      logger.error('Failed to take action:', error);
      throw error;
    }
  }

  // Approve content
  async approveContent(review) {
    await this.moderationRepository.updateContentStatus(review.contentId, review.contentType, 'approved');
  }

  // Remove content
  async removeContent(review) {
    await this.moderationRepository.updateContentStatus(review.contentId, review.contentType, 'removed');
    await this.notifyCreator(review.contentId, 'content_removed', review.reason);
  }

  // Warn creator
  async warnCreator(review) {
    await this.moderationRepository.createWarning({
      userId: review.contentId, // Assuming contentId references user
      contentId: review.contentId,
      reason: review.reason,
      createdAt: new Date().toISOString()
    });
    await this.notifyCreator(review.contentId, 'warning', review.reason);
  }

  // Restrict content
  async restrictContent(review) {
    await this.moderationRepository.updateContentStatus(review.contentId, review.contentType, 'restricted');
    await this.notifyCreator(review.contentId, 'content_restricted', review.reason);
  }

  // Age restrict content
  async ageRestrictContent(review) {
    await this.moderationRepository.updateContentMetadata(review.contentId, { ageRestricted: true, minAge: 18 });
    await this.notifyCreator(review.contentId, 'age_restricted', review.reason);
  }

  // Demonetize content
  async demonetizeContent(review) {
    await this.moderationRepository.updateContentMetadata(review.contentId, { monetizationEnabled: false });
    await this.notifyCreator(review.contentId, 'demonetized', review.reason);
  }

  // Ban creator
  async banCreator(review) {
    await this.moderationRepository.banUser(review.contentId, review.reason);
    await this.notifyCreator(review.contentId, 'account_banned', review.reason);
  }

  // Notify creator
  async notifyCreator(userId, notificationType, reason) {
    // Send notification via notification service
    logger.info('Creator notified', { userId, notificationType, reason });
  }

  // Get content
  async getContent(contentId, contentType) {
    return await this.moderationRepository.findContent(contentId, contentType);
  }

  // Get pending reviews
  async getPendingReviews(limit = 50) {
    return await this.moderationRepository.findPendingReviews(limit);
  }

  // Get moderation queue
  async getModerationQueue(filters = {}) {
    const { priority, contentType, status } = filters;

    const reviews = await this.moderationRepository.findReviews({
      status: status || 'pending',
      contentType,
      orderBy: priority ? 'severity' : 'createdAt',
      limit: 100
    });

    return reviews;
  }

  // Get moderation statistics
  async getModerationStatistics(period = '30d') {
    const reviews = await this.moderationRepository.findReviewsByPeriod(period);

    const stats = {
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      completed: reviews.filter(r => r.status === 'completed').length,
      byAction: {},
      bySeverity: {},
      avgResponseTime: 0
    };

    reviews.forEach(review => {
      if (review.action) {
        stats.byAction[review.action] = (stats.byAction[review.action] || 0) + 1;
      }
      if (review.autoModeration?.severity) {
        stats.bySeverity[review.autoModeration.severity] = (stats.bySeverity[review.autoModeration.severity] || 0) + 1;
      }
    });

    // Calculate avg response time
    const completedReviews = reviews.filter(r => r.completedAt);
    if (completedReviews.length > 0) {
      const totalTime = completedReviews.reduce((sum, r) => {
        const created = new Date(r.createdAt);
        const completed = new Date(r.completedAt);
        return sum + (completed - created);
      }, 0);
      stats.avgResponseTime = Math.round(totalTime / completedReviews.length / 1000 / 60); // minutes
    }

    return stats;
  }

  // Appeal moderation decision
  async createAppeal(reviewId, userId, appealReason) {
    const review = await this.moderationRepository.findReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    const appeal = await this.moderationRepository.createAppeal({
      reviewId,
      userId,
      appealReason,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    logger.info('Appeal created', { appealId: appeal.id, reviewId });
    return appeal;
  }

  // Review appeal
  async reviewAppeal(appealId, moderatorId, decision, comments) {
    const appeal = await this.moderationRepository.findAppealById(appealId);
    if (!appeal) {
      throw new Error('Appeal not found');
    }

    appeal.moderatorId = moderatorId;
    appeal.decision = decision; // 'approved', 'rejected'
    appeal.comments = comments;
    appeal.status = 'completed';
    appeal.completedAt = new Date().toISOString();

    await this.moderationRepository.updateAppeal(appealId, appeal);

    // If approved, reverse original action
    if (decision === 'approved') {
      await this.reverseAction(appeal.reviewId);
    }

    logger.info('Appeal reviewed', { appealId, decision });
    return appeal;
  }

  // Reverse moderation action
  async reverseAction(reviewId) {
    const review = await this.moderationRepository.findReviewById(reviewId);
    if (!review) return;

    // Restore content status
    await this.moderationRepository.updateContentStatus(review.contentId, review.contentType, 'approved');
    await this.notifyCreator(review.contentId, 'appeal_approved', 'Your appeal has been approved');
  }
}

export default ContentModerationPolicyService;
