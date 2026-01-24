// Community Guidelines and Terms of Service Management
import { logger } from '../../0-core/logging/logger.js';

export class CommunityGuidelinesService {
  constructor(guidelinesRepository, userRepository) {
    this.guidelinesRepository = guidelinesRepository;
    this.userRepository = userRepository;

    // Guideline categories
    this.categories = {
      CONTENT_STANDARDS: 'content_standards',
      USER_CONDUCT: 'user_conduct',
      COPYRIGHT: 'copyright',
      PRIVACY: 'privacy',
      SAFETY: 'safety',
      SPAM_MANIPULATION: 'spam_manipulation',
      MONETIZATION: 'monetization'
    };

    // Violation severity
    this.severity = {
      MINOR: 'minor',
      MODERATE: 'moderate',
      MAJOR: 'major',
      SEVERE: 'severe'
    };
  }

  // Get current guidelines
  async getCurrentGuidelines() {
    return await this.guidelinesRepository.findActive();
  }

  // Get guideline version
  async getGuidelineVersion(version) {
    return await this.guidelinesRepository.findByVersion(version);
  }

  // Update guidelines
  async updateGuidelines(guidelineData, updatedBy) {
    try {
      const {
        category,
        content,
        effectiveDate
      } = guidelineData;

      // Get current version
      const current = await this.guidelinesRepository.findActiveByCategory(category);
      const newVersion = current ? current.version + 1 : 1;

      // Archive current version
      if (current) {
        current.status = 'archived';
        await this.guidelinesRepository.update(current.id, current);
      }

      // Create new version
      const guideline = await this.guidelinesRepository.create({
        category,
        content,
        version: newVersion,
        effectiveDate: effectiveDate || new Date().toISOString(),
        status: 'active',
        updatedBy,
        createdAt: new Date().toISOString()
      });

      // Notify users of changes
      await this.notifyGuidelineChanges(category, newVersion);

      logger.info('Guidelines updated', { category, version: newVersion });
      return guideline;
    } catch (error) {
      logger.error('Failed to update guidelines:', error);
      throw error;
    }
  }

  // Notify users of guideline changes
  async notifyGuidelineChanges(category, version) {
    logger.info('Users notified of guideline changes', { category, version });
  }

  // Record user acceptance of terms
  async recordTermsAcceptance(userId, termsVersion, ipAddress) {
    try {
      await this.guidelinesRepository.createAcceptance({
        userId,
        termsVersion,
        ipAddress,
        acceptedAt: new Date().toISOString()
      });

      // Update user record
      await this.userRepository.update(userId, {
        acceptedTermsVersion: termsVersion,
        acceptedTermsAt: new Date().toISOString()
      });

      logger.info('Terms acceptance recorded', { userId, termsVersion });
    } catch (error) {
      logger.error('Failed to record terms acceptance:', error);
      throw error;
    }
  }

  // Check if user has accepted latest terms
  async hasAcceptedLatestTerms(userId) {
    const user = await this.userRepository.findById(userId);
    const latestTerms = await this.guidelinesRepository.findLatestTermsVersion();

    return user.acceptedTermsVersion === latestTerms.version;
  }

  // Issue strike for guideline violation
  async issueStrike(userId, violationData) {
    try {
      const {
        category,
        description,
        contentId,
        severity
      } = violationData;

      // Create strike record
      const strike = await this.guidelinesRepository.createStrike({
        userId,
        category,
        description,
        contentId,
        severity,
        issuedAt: new Date().toISOString()
      });

      // Get user's total strikes
      const strikes = await this.guidelinesRepository.findUserStrikes(userId);
      const activeStrikes = strikes.filter(s => !s.expired);

      // Determine action based on strike count
      if (activeStrikes.length >= 3) {
        await this.suspendAccount(userId, 'Three strikes - guideline violations');
      } else if (activeStrikes.length === 2) {
        await this.restrictAccount(userId, 7); // 7-day restriction
      } else {
        await this.warnUser(userId, strike.id);
      }

      // Set expiration (strikes expire after 90 days)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90);
      strike.expiresAt = expirationDate.toISOString();
      await this.guidelinesRepository.updateStrike(strike.id, strike);

      logger.info('Strike issued', { strikeId: strike.id, userId, severity });
      return strike;
    } catch (error) {
      logger.error('Failed to issue strike:', error);
      throw error;
    }
  }

  // Warn user
  async warnUser(userId, strikeId) {
    await this.userRepository.update(userId, {
      warningCount: (await this.userRepository.findById(userId)).warningCount + 1
    });
    logger.info('User warned', { userId, strikeId });
  }

  // Restrict account
  async restrictAccount(userId, days) {
    const restrictedUntil = new Date();
    restrictedUntil.setDate(restrictedUntil.getDate() + days);

    await this.userRepository.update(userId, {
      restricted: true,
      restrictedUntil: restrictedUntil.toISOString()
    });

    logger.info('Account restricted', { userId, days });
  }

  // Suspend account
  async suspendAccount(userId, reason) {
    await this.userRepository.update(userId, {
      suspended: true,
      suspensionReason: reason,
      suspendedAt: new Date().toISOString()
    });

    logger.info('Account suspended', { userId, reason });
  }

  // Remove strike (appeal approved)
  async removeStrike(strikeId, reason) {
    const strike = await this.guidelinesRepository.findStrikeById(strikeId);
    if (!strike) {
      throw new Error('Strike not found');
    }

    strike.removed = true;
    strike.removalReason = reason;
    strike.removedAt = new Date().toISOString();

    await this.guidelinesRepository.updateStrike(strikeId, strike);
    logger.info('Strike removed', { strikeId, reason });
  }

  // Get user strikes
  async getUserStrikes(userId) {
    return await this.guidelinesRepository.findUserStrikes(userId);
  }

  // Process expired strikes
  async processExpiredStrikes() {
    const expiredStrikes = await this.guidelinesRepository.findExpiredStrikes();

    for (const strike of expiredStrikes) {
      strike.expired = true;
      await this.guidelinesRepository.updateStrike(strike.id, strike);
    }

    logger.info('Expired strikes processed', { count: expiredStrikes.length });
  }

  // Get guideline statistics
  async getGuidelineStatistics(period = '30d') {
    const strikes = await this.guidelinesRepository.findStrikesByPeriod(period);

    const stats = {
      totalStrikes: strikes.length,
      byCategory: {},
      bySeverity: {},
      activeStrikes: strikes.filter(s => !s.expired && !s.removed).length,
      removedStrikes: strikes.filter(s => s.removed).length,
      expiredStrikes: strikes.filter(s => s.expired).length
    };

    strikes.forEach(strike => {
      stats.byCategory[strike.category] = (stats.byCategory[strike.category] || 0) + 1;
      stats.bySeverity[strike.severity] = (stats.bySeverity[strike.severity] || 0) + 1;
    });

    return stats;
  }
}

export default CommunityGuidelinesService;
