// Copyright and DMCA Management Service
import { logger } from '../../0-core/logging/logger.js';

export class CopyrightService {
  constructor(copyrightRepository, contentRepository) {
    this.copyrightRepository = copyrightRepository;
    this.contentRepository = contentRepository;
  }

  // Submit DMCA takedown notice
  async submitDMCANotice(noticeData) {
    try {
      const {
        complainantName,
        complainantEmail,
        complainantAddress,
        copyrightedWork,
        infringingContent, // { contentId, contentType, url }
        description,
        goodFaithStatement,
        accuracyStatement,
        signature
      } = noticeData;

      // Validate required fields
      if (!complainantName || !complainantEmail || !copyrightedWork || !infringingContent) {
        throw new Error('Missing required fields for DMCA notice');
      }

      // Create DMCA notice
      const notice = await this.copyrightRepository.createNotice({
        complainantName,
        complainantEmail,
        complainantAddress,
        copyrightedWork,
        infringingContent,
        description,
        goodFaithStatement,
        accuracyStatement,
        signature,
        status: 'received',
        createdAt: new Date().toISOString()
      });

      // Immediately take down content (per DMCA requirements)
      await this.takedownContent(infringingContent.contentId, infringingContent.contentType, notice.id);

      // Notify content owner
      await this.notifyContentOwner(infringingContent.contentId, notice.id);

      logger.info('DMCA notice submitted', { noticeId: notice.id, contentId: infringingContent.contentId });
      return notice;
    } catch (error) {
      logger.error('Failed to submit DMCA notice:', error);
      throw error;
    }
  }

  // Takedown content
  async takedownContent(contentId, contentType, noticeId) {
    await this.contentRepository.updateStatus(contentId, contentType, 'dmca_takedown');
    await this.contentRepository.updateMetadata(contentId, { dmcaNoticeId: noticeId });
    logger.info('Content taken down', { contentId, noticeId });
  }

  // Notify content owner
  async notifyContentOwner(contentId, noticeId) {
    logger.info('Content owner notified of DMCA takedown', { contentId, noticeId });
  }

  // Submit counter-notice
  async submitCounterNotice(counterNoticeData) {
    try {
      const {
        noticeId,
        userId,
        userName,
        userEmail,
        userAddress,
        goodFaithStatement,
        consentToJurisdiction,
        signature
      } = counterNoticeData;

      // Get original notice
      const originalNotice = await this.copyrightRepository.findNoticeById(noticeId);
      if (!originalNotice) {
        throw new Error('Original DMCA notice not found');
      }

      // Create counter-notice
      const counterNotice = await this.copyrightRepository.createCounterNotice({
        noticeId,
        userId,
        userName,
        userEmail,
        userAddress,
        goodFaithStatement,
        consentToJurisdiction,
        signature,
        status: 'received',
        createdAt: new Date().toISOString()
      });

      // Update original notice status
      originalNotice.counterNoticeId = counterNotice.id;
      originalNotice.status = 'counter_notice_received';
      await this.copyrightRepository.updateNotice(noticeId, originalNotice);

      // Notify complainant
      await this.notifyComplainant(originalNotice.complainantEmail, counterNotice.id);

      // Set 10-14 day timer for restoration (per DMCA)
      await this.scheduleRestoration(originalNotice.infringingContent.contentId, 14);

      logger.info('Counter-notice submitted', { counterNoticeId: counterNotice.id, noticeId });
      return counterNotice;
    } catch (error) {
      logger.error('Failed to submit counter-notice:', error);
      throw error;
    }
  }

  // Notify complainant
  async notifyComplainant(email, counterNoticeId) {
    logger.info('Complainant notified of counter-notice', { email, counterNoticeId });
  }

  // Schedule content restoration
  async scheduleRestoration(contentId, days) {
    const restoreDate = new Date();
    restoreDate.setDate(restoreDate.getDate() + days);

    await this.copyrightRepository.scheduleRestoration({
      contentId,
      restoreDate: restoreDate.toISOString(),
      status: 'scheduled'
    });

    logger.info('Content restoration scheduled', { contentId, restoreDate: restoreDate.toISOString() });
  }

  // Process scheduled restorations
  async processScheduledRestorations() {
    const restorations = await this.copyrightRepository.findDueRestorations();

    for (const restoration of restorations) {
      await this.restoreContent(restoration.contentId);
      await this.copyrightRepository.updateRestoration(restoration.id, { status: 'completed' });
    }

    logger.info('Scheduled restorations processed', { count: restorations.length });
  }

  // Restore content
  async restoreContent(contentId) {
    await this.contentRepository.updateStatus(contentId, null, 'approved');
    logger.info('Content restored', { contentId });
  }

  // Get DMCA notice
  async getDMCANotice(noticeId) {
    return await this.copyrightRepository.findNoticeById(noticeId);
  }

  // Get user's DMCA notices
  async getUserDMCANotices(userId) {
    return await this.copyrightRepository.findNoticesByUser(userId);
  }

  // Register content ID (for automated copyright detection)
  async registerContentID(contentData) {
    const {
      userId,
      title,
      fingerprint, // Audio/video fingerprint
      referenceFile,
      copyrightInfo
    } = contentData;

    const registration = await this.copyrightRepository.createContentIDRegistration({
      userId,
      title,
      fingerprint,
      referenceFile,
      copyrightInfo,
      status: 'active',
      createdAt: new Date().toISOString()
    });

    logger.info('Content ID registered', { registrationId: registration.id });
    return registration;
  }

  // Match against Content ID
  async matchContentID(videoFingerprint) {
    const registrations = await this.copyrightRepository.findActiveContentIDs();

    // Simplified matching (in production, use sophisticated audio/video fingerprinting)
    const matches = [];
    for (const registration of registrations) {
      const similarity = this.calculateFingerprint Similarity(videoFingerprint, registration.fingerprint);
      if (similarity > 0.8) {
        matches.push({
          registrationId: registration.id,
          title: registration.title,
          userId: registration.userId,
          similarity
        });
      }
    }

    return matches;
  }

  // Calculate fingerprint similarity
  calculateFingerprintSimilarity(fp1, fp2) {
    // Simplified (in production, use actual fingerprinting algorithm)
    return Math.random() * 0.5; // Placeholder
  }

  // Get copyright statistics
  async getCopyrightStatistics(period = '30d') {
    const notices = await this.copyrightRepository.findNoticesByPeriod(period);

    return {
      totalNotices: notices.length,
      pending: notices.filter(n => n.status === 'received').length,
      takedowns: notices.filter(n => n.status === 'dmca_takedown').length,
      counterNotices: notices.filter(n => n.status === 'counter_notice_received').length,
      resolved: notices.filter(n => n.status === 'resolved').length
    };
  }
}

export default CopyrightService;
