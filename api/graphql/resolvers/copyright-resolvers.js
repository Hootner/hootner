/**
 * Copyright & Licensing GraphQL Resolvers
 */

import copyrightService from '../../../services/copyright-service.js';
import dmcaService from '../../../services/dmca-service.js';
import communityNormsService from '../../../services/community-norms-service.js';
import { logAuditEvent } from '../../../services/audit-service.js';

export const copyrightResolvers = {
  Query: {
    /**
     * Get copyright information for content
     */
    copyrightInfo: async (_, { contentId, contentType }, context) => {
      try {
        // Fetch content from database
        const content = await context.dataSources.getContent(contentId, contentType);
        if (!content || !content.copyright) {
          return null;
        }

        return content.copyright;
      } catch (error) {
        console.error('Error fetching copyright info:', error);
        throw new Error('Failed to fetch copyright information');
      }
    },

    /**
     * Get all available licenses
     */
    availableLicenses: async () => {
      const licenses = copyrightService.getAllLicenses();
      return licenses;
    },

    /**
     * Get recommended licenses for user type
     */
    recommendedLicenses: async (_, { userType = 'CREATOR' }) => {
      const recommended = copyrightService.getRecommendedLicenses();
      return recommended;
    },

    /**
     * Get creator profile with license preferences
     */
    creatorProfile: async (_, { userId }, context) => {
      try {
        const profile = await context.dataSources.getCreatorProfile(userId);
        return profile || {
          userId,
          defaultLicense: 'ALL_RIGHTS_RESERVED',
          licensePreferences: '{}',
          copyrightedContentCount: 0,
          dmcaNoticesReceived: 0,
          dmcaNoticesFiled: 0
        };
      } catch (error) {
        console.error('Error fetching creator profile:', error);
        throw new Error('Failed to fetch creator profile');
      }
    },

    /**
     * Get DMCA notice by ID
     */
    dmcaNotice: async (_, { noticeId }, context) => {
      try {
        const notice = await dmcaService.getNotice(noticeId);
        return notice;
      } catch (error) {
        console.error('Error fetching DMCA notice:', error);
        throw new Error('Failed to fetch DMCA notice');
      }
    },

    /**
     * Get DMCA notices (filtered)
     */
    dmcaNotices: async (_, { contentId, status, limit = 50 }, context) => {
      try {
        let notices;

        if (contentId) {
          notices = await dmcaService.getNoticesForContent(contentId);
        } else {
          notices = Array.from(dmcaService.notices.values());
        }

        if (status) {
          notices = notices.filter(n => n.status === status);
        }

        return notices.slice(0, limit);
      } catch (error) {
        console.error('Error fetching DMCA notices:', error);
        throw new Error('Failed to fetch DMCA notices');
      }
    },

    /**
     * Get current user's DMCA notices
     */
    myDMCANotices: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const notices = Array.from(dmcaService.notices.values()).filter(
          n => n.complainant.email === context.user.email ||
               n.allegedInfringer.userId === context.user.id
        );

        return notices;
      } catch (error) {
        console.error('Error fetching user DMCA notices:', error);
        throw new Error('Failed to fetch DMCA notices');
      }
    },

    /**
     * Get community guidelines
     */
    communityGuidelines: async () => {
      const guidelines = communityNormsService.getGuidelines();
      return guidelines;
    },

    /**
     * Get onboarding flow for user type
     */
    onboardingFlow: async (_, { userType }) => {
      const flow = communityNormsService.getOnboardingFlow(userType.toLowerCase());

      return {
        userType,
        welcome: flow.welcome,
        steps: flow.welcome.steps || [],
        guidelines: flow.welcome.principles || []
      };
    }
  },

  Mutation: {
    /**
     * Set creator's default license
     */
    setCreatorLicense: async (_, { userId, licenseType }, context) => {
      if (!context.user || context.user.id !== userId) {
        throw new Error('Unauthorized');
      }

      try {
        const profile = await context.dataSources.updateCreatorProfile(userId, {
          defaultLicense: licenseType
        });

        await logAuditEvent({
          type: 'creator_license_updated',
          userId,
          licenseType,
          timestamp: new Date().toISOString()
        });

        return profile;
      } catch (error) {
        console.error('Error setting creator license:', error);
        throw new Error('Failed to set license');
      }
    },

    /**
     * Update license for specific content
     */
    updateContentLicense: async (_, { contentId, contentType, licenseType }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        // Verify user owns content
        const content = await context.dataSources.getContent(contentId, contentType);
        if (content.creatorId !== context.user.id) {
          throw new Error('Unauthorized - you do not own this content');
        }

        // Generate new copyright with updated license
        const copyright = copyrightService.generateCopyright({
          creatorName: context.user.name,
          creatorId: context.user.id,
          contentType: contentType.toLowerCase(),
          license: licenseType.toLowerCase().replace(/_/g, '-'),
          contentTitle: content.title
        });

        // Update content
        await context.dataSources.updateContent(contentId, contentType, {
          copyright,
          licenseType
        });

        await logAuditEvent({
          type: 'content_license_updated',
          userId: context.user.id,
          contentId,
          contentType,
          licenseType,
          timestamp: new Date().toISOString()
        });

        return copyright;
      } catch (error) {
        console.error('Error updating content license:', error);
        throw new Error('Failed to update content license');
      }
    },

    /**
     * Submit DMCA takedown notice
     */
    submitDMCATakedown: async (_, { input }, context) => {
      try {
        const result = await dmcaService.submitTakedownNotice({
          ...input,
          contentType: input.contentType.toLowerCase(),
          ipAddress: context.ip
        });

        if (!result.success) {
          throw new Error(result.message);
        }

        return await dmcaService.getNotice(result.noticeId);
      } catch (error) {
        console.error('Error submitting DMCA takedown:', error);
        throw new Error(error.message || 'Failed to submit DMCA notice');
      }
    },

    /**
     * Submit DMCA counter-notice
     */
    submitDMCACounterNotice: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const result = await dmcaService.submitCounterNotice(input);

        if (!result.success) {
          throw new Error(result.message);
        }

        return await dmcaService.getNotice(result.noticeId);
      } catch (error) {
        console.error('Error submitting counter-notice:', error);
        throw new Error(error.message || 'Failed to submit counter-notice');
      }
    },

    /**
     * Process DMCA notice (internal staff only)
     */
    processDMCANotice: async (_, { noticeId, action, reviewData }, context) => {
      // Verify user is staff/admin
      if (!context.user || !context.user.isStaff) {
        throw new Error('Unauthorized - staff access required');
      }

      try {
        const actionMap = {
          APPROVE: 'approve',
          REJECT: 'reject',
          REMOVE_CONTENT: 'approve',
          RESTORE_CONTENT: 'restore'
        };

        const result = await dmcaService.processTakedownNotice(noticeId, {
          ...reviewData,
          action: actionMap[action]
        });

        return await dmcaService.getNotice(noticeId);
      } catch (error) {
        console.error('Error processing DMCA notice:', error);
        throw new Error('Failed to process DMCA notice');
      }
    },

    /**
     * Withdraw DMCA notice
     */
    withdrawDMCANotice: async (_, { noticeId, reason }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const notice = await dmcaService.getNotice(noticeId);

        // Verify user is complainant
        if (notice.complainant.email !== context.user.email) {
          throw new Error('Unauthorized - only complainant can withdraw notice');
        }

        notice.status = 'WITHDRAWN';
        notice.withdrawnAt = new Date().toISOString();
        notice.withdrawalReason = reason;

        await dmcaService.updateNotice(notice);

        await logAuditEvent({
          type: 'dmca_notice_withdrawn',
          noticeId,
          userId: context.user.id,
          reason,
          timestamp: new Date().toISOString()
        });

        return notice;
      } catch (error) {
        console.error('Error withdrawing DMCA notice:', error);
        throw new Error('Failed to withdraw DMCA notice');
      }
    }
  },

  // Type Resolvers
  CopyrightInfo: {
    licenseInfo: (parent) => parent.licenseInfo,
    metadata: (parent) => parent.metadata
  },

  DMCANotice: {
    complainant: (parent) => parent.complainant,
    content: (parent) => parent.content,
    copyrightedWork: (parent) => parent.copyrightedWork,
    statements: (parent) => parent.statements,
    signature: (parent) => parent.signature,
    allegedInfringer: (parent) => parent.allegedInfringer,
    reviewNotes: (parent) => parent.reviewNotes || [],
    actions: (parent) => parent.actions || [],
    counterNotice: (parent) => parent.counterNotice || null
  }
};

export default copyrightResolvers;
