/**
 * DMCA Compliance Service
 * Handles takedown notices, counter-notices, and legal compliance
 *
 * IMPORTANT: This service provides technical infrastructure for DMCA compliance.
 * Legal registration as a service provider with the U.S. Copyright Office is required.
 * Consult with legal counsel before deploying to production.
 */

import crypto from 'crypto';
import { sendEmail } from './email-service.js';
import { logAuditEvent } from './audit-service.js';

/**
 * DMCA Notice Status
 */
export const DMCA_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CONTENT_REMOVED: 'content_removed',
  COUNTER_NOTICE_RECEIVED: 'counter_notice_received',
  COUNTER_NOTICE_FORWARDED: 'counter_notice_forwarded',
  RESTORED: 'restored',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

/**
 * Content Types for DMCA
 */
const CONTENT_TYPES = {
  VIDEO: 'video',
  CODE: 'code',
  LISTING: 'listing',
  PROFILE: 'profile',
  COMMENT: 'comment'
};

/**
 * DMCA Service Class
 */
export class DMCAService {
  constructor(config = {}) {
    this.config = {
      // Service Provider Information (MUST be registered with Copyright Office)
      serviceProvider: {
        name: config.serviceProviderName || 'HOOTNER Platform',
        agentName: config.agentName || 'DMCA Agent',
        address: config.address || '[Address Required]',
        phone: config.phone || '[Phone Required]',
        email: config.email || 'dmca@hootner.com'
      },
      // Timing configuration (statutory periods)
      counterNoticePeriod: 10, // days (10 business days per statute)
      restorationPeriod: 14, // days (10-14 business days per statute)
      reviewPeriod: 2, // days (internal review)
      // Auto-notification
      autoNotify: config.autoNotify !== false,
      // Storage
      storageProvider: config.storageProvider || 'dynamodb'
    };

    this.notices = new Map(); // In-memory cache (use database in production)
  }

  /**
   * Submit DMCA takedown notice
   * @param {Object} notice - Takedown notice details
   */
  async submitTakedownNotice(notice) {
    // Validate notice completeness (required by DMCA)
    const validation = this.validateTakedownNotice(notice);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Incomplete DMCA notice - missing required elements'
      };
    }

    // Generate unique notice ID
    const noticeId = this.generateNoticeId();
    const timestamp = new Date().toISOString();

    const dmcaNotice = {
      noticeId,
      type: 'takedown',
      status: DMCA_STATUS.SUBMITTED,
      submittedAt: timestamp,
      updatedAt: timestamp,

      // Complainant information (required by 17 USC 512(c)(3))
      complainant: {
        name: notice.complainantName,
        address: notice.complainantAddress,
        phone: notice.complainantPhone,
        email: notice.complainantEmail,
        isRightsHolder: notice.isRightsHolder || false,
        authorizedAgent: notice.authorizedAgent || null
      },

      // Infringing content (required)
      content: {
        type: notice.contentType,
        id: notice.contentId,
        url: notice.contentUrl,
        description: notice.contentDescription
      },

      // Original copyrighted work (required)
      copyrightedWork: {
        description: notice.copyrightedWorkDescription,
        url: notice.copyrightedWorkUrl,
        registrationNumber: notice.registrationNumber || null
      },

      // Good faith statement (required)
      statements: {
        goodFaith: notice.goodFaithStatement,
        accuracy: notice.accuracyStatement,
        penaltyOfPerjury: notice.penaltyOfPerjuryStatement
      },

      // Electronic signature (required)
      signature: {
        name: notice.signatureName,
        date: timestamp,
        ipAddress: notice.ipAddress
      },

      // Alleged infringer (content uploader)
      allegedInfringer: {
        userId: notice.uploaderUserId,
        username: notice.uploaderUsername,
        email: notice.uploaderEmail
      },

      // Internal tracking
      reviewedBy: null,
      reviewNotes: [],
      actions: []
    };

    // Store notice
    await this.storeNotice(dmcaNotice);

    // Log audit event
    await logAuditEvent({
      type: 'dmca_notice_submitted',
      noticeId,
      complainant: notice.complainantEmail,
      contentId: notice.contentId,
      timestamp
    });

    // Send confirmation to complainant
    if (this.config.autoNotify) {
      await this.sendComplainantConfirmation(dmcaNotice);
    }

    // Notify internal team for review
    await this.notifyInternalTeam(dmcaNotice);

    return {
      success: true,
      noticeId,
      status: DMCA_STATUS.SUBMITTED,
      message: 'DMCA notice submitted successfully. Under review.',
      estimatedReviewTime: `${this.config.reviewPeriod} business days`
    };
  }

  /**
   * Validate DMCA takedown notice (17 USC 512(c)(3) requirements)
   */
  validateTakedownNotice(notice) {
    const errors = [];
    const required = [
      // Identification of complainant
      { field: 'complainantName', message: 'Complainant name is required' },
      { field: 'complainantAddress', message: 'Complainant physical address is required' },
      { field: 'complainantEmail', message: 'Complainant email is required' },

      // Identification of copyrighted work
      { field: 'copyrightedWorkDescription', message: 'Description of copyrighted work is required' },

      // Identification of infringing material
      { field: 'contentId', message: 'Content ID is required' },
      { field: 'contentUrl', message: 'Content URL is required' },
      { field: 'contentDescription', message: 'Description of infringing material is required' },

      // Good faith statement
      { field: 'goodFaithStatement', message: 'Good faith belief statement is required' },

      // Accuracy statement under penalty of perjury
      { field: 'accuracyStatement', message: 'Statement of accuracy is required' },
      { field: 'penaltyOfPerjuryStatement', message: 'Statement under penalty of perjury is required' },

      // Signature
      { field: 'signatureName', message: 'Electronic signature is required' }
    ];

    required.forEach(({ field, message }) => {
      if (!notice[field]) {
        errors.push(message);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Process takedown notice (internal review)
   */
  async processTakedownNotice(noticeId, reviewData) {
    const notice = await this.getNotice(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    // Update status
    notice.status = DMCA_STATUS.UNDER_REVIEW;
    notice.reviewedBy = reviewData.reviewerId;
    notice.reviewedAt = new Date().toISOString();
    notice.reviewNotes.push({
      note: reviewData.notes,
      reviewer: reviewData.reviewerId,
      timestamp: new Date().toISOString()
    });

    await this.updateNotice(notice);

    // If approved, remove content
    if (reviewData.action === 'approve') {
      return await this.removeContent(noticeId);
    }

    // If rejected, notify complainant
    if (reviewData.action === 'reject') {
      return await this.rejectNotice(noticeId, reviewData.reason);
    }

    return { success: true, status: notice.status };
  }

  /**
   * Remove content (expedited takedown)
   */
  async removeContent(noticeId) {
    const notice = await this.getNotice(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    const timestamp = new Date().toISOString();

    // Mark content as removed (actual removal happens in content service)
    notice.status = DMCA_STATUS.CONTENT_REMOVED;
    notice.contentRemovedAt = timestamp;
    notice.actions.push({
      action: 'content_removed',
      timestamp,
      reason: 'DMCA takedown notice',
      noticeId
    });

    await this.updateNotice(notice);

    // Notify content uploader (required by DMCA)
    if (this.config.autoNotify) {
      await this.notifyContentUploader(notice);
    }

    // Log audit event
    await logAuditEvent({
      type: 'dmca_content_removed',
      noticeId,
      contentId: notice.content.id,
      timestamp
    });

    return {
      success: true,
      noticeId,
      status: DMCA_STATUS.CONTENT_REMOVED,
      message: 'Content removed per DMCA notice',
      contentId: notice.content.id
    };
  }

  /**
   * Submit counter-notice (content uploader disputes takedown)
   */
  async submitCounterNotice(counterNotice) {
    // Validate counter-notice
    const validation = this.validateCounterNotice(counterNotice);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Incomplete counter-notice - missing required elements'
      };
    }

    const notice = await this.getNotice(counterNotice.originalNoticeId);
    if (!notice) {
      throw new Error('Original DMCA notice not found');
    }

    const timestamp = new Date().toISOString();

    // Update notice with counter-notice
    notice.status = DMCA_STATUS.COUNTER_NOTICE_RECEIVED;
    notice.counterNotice = {
      submittedAt: timestamp,
      subscriber: {
        name: counterNotice.subscriberName,
        address: counterNotice.subscriberAddress,
        phone: counterNotice.subscriberPhone,
        email: counterNotice.subscriberEmail
      },
      statements: {
        goodFaith: counterNotice.goodFaithStatement,
        consent: counterNotice.consentToJurisdiction,
        penaltyOfPerjury: counterNotice.penaltyOfPerjuryStatement
      },
      signature: {
        name: counterNotice.signatureName,
        date: timestamp
      },
      explanation: counterNotice.explanation
    };

    // Calculate restoration date (10-14 business days)
    const restorationDate = new Date();
    restorationDate.setDate(restorationDate.getDate() + this.config.restorationPeriod);
    notice.restorationDate = restorationDate.toISOString();

    await this.updateNotice(notice);

    // Forward counter-notice to complainant (required)
    if (this.config.autoNotify) {
      await this.forwardCounterNoticeToComplainant(notice);
      notice.status = DMCA_STATUS.COUNTER_NOTICE_FORWARDED;
      await this.updateNotice(notice);
    }

    // Log audit event
    await logAuditEvent({
      type: 'dmca_counter_notice_received',
      noticeId: notice.noticeId,
      contentId: notice.content.id,
      timestamp
    });

    return {
      success: true,
      noticeId: notice.noticeId,
      status: notice.status,
      message: 'Counter-notice submitted and forwarded to complainant',
      restorationDate: notice.restorationDate,
      note: 'Content will be restored in 10-14 business days unless complainant files lawsuit'
    };
  }

  /**
   * Validate counter-notice (17 USC 512(g)(3) requirements)
   */
  validateCounterNotice(counterNotice) {
    const errors = [];
    const required = [
      { field: 'originalNoticeId', message: 'Original notice ID is required' },
      { field: 'subscriberName', message: 'Subscriber name is required' },
      { field: 'subscriberAddress', message: 'Subscriber address is required' },
      { field: 'subscriberPhone', message: 'Subscriber phone is required' },
      { field: 'goodFaithStatement', message: 'Good faith statement is required' },
      { field: 'consentToJurisdiction', message: 'Consent to jurisdiction is required' },
      { field: 'penaltyOfPerjuryStatement', message: 'Statement under penalty of perjury is required' },
      { field: 'signatureName', message: 'Electronic signature is required' },
      { field: 'explanation', message: 'Explanation for counter-notice is required' }
    ];

    required.forEach(({ field, message }) => {
      if (!counterNotice[field]) {
        errors.push(message);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Restore content after counter-notice period
   */
  async restoreContent(noticeId, reason = 'counter_notice_period_expired') {
    const notice = await this.getNotice(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    const timestamp = new Date().toISOString();

    notice.status = DMCA_STATUS.RESTORED;
    notice.restoredAt = timestamp;
    notice.actions.push({
      action: 'content_restored',
      timestamp,
      reason
    });

    await this.updateNotice(notice);

    // Notify uploader of restoration
    if (this.config.autoNotify && notice.counterNotice) {
      await sendEmail({
        to: notice.counterNotice.subscriber.email,
        subject: 'HOOTNER: Content Restored',
        template: 'dmca-content-restored',
        data: {
          subscriberName: notice.counterNotice.subscriber.name,
          contentUrl: notice.content.url,
          restoredAt: timestamp
        }
      });
    }

    // Log audit event
    await logAuditEvent({
      type: 'dmca_content_restored',
      noticeId,
      contentId: notice.content.id,
      reason,
      timestamp
    });

    return {
      success: true,
      noticeId,
      status: DMCA_STATUS.RESTORED,
      message: 'Content restored',
      contentId: notice.content.id
    };
  }

  /**
   * Generate notice ID
   */
  generateNoticeId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `DMCA-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Send confirmation to complainant
   */
  async sendComplainantConfirmation(notice) {
    await sendEmail({
      to: notice.complainant.email,
      subject: 'HOOTNER: DMCA Notice Received',
      template: 'dmca-complainant-confirmation',
      data: {
        noticeId: notice.noticeId,
        complainantName: notice.complainant.name,
        contentUrl: notice.content.url,
        submittedAt: notice.submittedAt,
        estimatedReview: `${this.config.reviewPeriod} business days`
      }
    });
  }

  /**
   * Notify content uploader of takedown
   */
  async notifyContentUploader(notice) {
    await sendEmail({
      to: notice.allegedInfringer.email,
      subject: 'HOOTNER: DMCA Takedown Notice - Content Removed',
      template: 'dmca-uploader-notification',
      data: {
        uploaderUsername: notice.allegedInfringer.username,
        contentUrl: notice.content.url,
        removedAt: notice.contentRemovedAt,
        noticeId: notice.noticeId,
        complainant: notice.complainant.name,
        counterNoticeUrl: `https://hootner.com/dmca/counter-notice/${notice.noticeId}`,
        counterNoticePeriod: `${this.config.counterNoticePeriod} days`
      }
    });
  }

  /**
   * Forward counter-notice to complainant
   */
  async forwardCounterNoticeToComplainant(notice) {
    await sendEmail({
      to: notice.complainant.email,
      subject: 'HOOTNER: Counter-Notice Received',
      template: 'dmca-counter-notice-forward',
      data: {
        complainantName: notice.complainant.name,
        noticeId: notice.noticeId,
        counterNotice: notice.counterNotice,
        restorationDate: notice.restorationDate,
        contentUrl: notice.content.url
      }
    });
  }

  /**
   * Notify internal team
   */
  async notifyInternalTeam(notice) {
    await sendEmail({
      to: this.config.serviceProvider.email,
      subject: `[DMCA] New Takedown Notice: ${notice.noticeId}`,
      template: 'dmca-internal-notification',
      data: {
        noticeId: notice.noticeId,
        complainant: notice.complainant,
        content: notice.content,
        submittedAt: notice.submittedAt
      }
    });
  }

  /**
   * Reject notice (invalid/incomplete)
   */
  async rejectNotice(noticeId, reason) {
    const notice = await this.getNotice(noticeId);
    notice.status = DMCA_STATUS.REJECTED;
    notice.rejectedAt = new Date().toISOString();
    notice.rejectionReason = reason;

    await this.updateNotice(notice);

    if (this.config.autoNotify) {
      await sendEmail({
        to: notice.complainant.email,
        subject: 'HOOTNER: DMCA Notice Rejected',
        template: 'dmca-notice-rejected',
        data: {
          noticeId,
          reason,
          complainantName: notice.complainant.name
        }
      });
    }

    return { success: true, status: DMCA_STATUS.REJECTED };
  }

  /**
   * Get all notices for a content item
   */
  async getNoticesForContent(contentId) {
    // In production, query from database
    return Array.from(this.notices.values()).filter(
      notice => notice.content.id === contentId
    );
  }

  /**
   * Get notice by ID
   */
  async getNotice(noticeId) {
    // In production, fetch from database
    return this.notices.get(noticeId) || null;
  }

  /**
   * Store notice
   */
  async storeNotice(notice) {
    // In production, store in database
    this.notices.set(notice.noticeId, notice);
  }

  /**
   * Update notice
   */
  async updateNotice(notice) {
    notice.updatedAt = new Date().toISOString();
    this.notices.set(notice.noticeId, notice);
  }

  /**
   * Get service provider information for copyright office registration
   */
  getServiceProviderInfo() {
    return {
      ...this.config.serviceProvider,
      registrationRequired: true,
      registrationUrl: 'https://www.copyright.gov/dmca-directory/',
      note: 'Service provider must be registered with U.S. Copyright Office'
    };
  }
}

export default new DMCAService();
