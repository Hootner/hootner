// Layer 6 Governance - Central Export
// Policies, compliance, and content moderation

// Moderation Services
export { default as ContentModerationPolicyService } from './moderation/ContentModerationPolicyService.js';

// Compliance Services
export { default as UserReportingService } from './compliance/UserReportingService.js';
export { default as CopyrightService } from './compliance/CopyrightService.js';
export { default as PrivacyComplianceService } from './compliance/PrivacyComplianceService.js';

// Policy Services
export { default as CommunityGuidelinesService } from './policies/CommunityGuidelinesService.js';
export { default as AgeVerificationService } from './policies/AgeVerificationService.js';

/**
 * Layer 6 - Governance
 *
 * Purpose: Policies, compliance, and content moderation
 *
 * Components:
 * - Moderation: Content review, automated checks, actions (remove, warn, ban)
 * - Compliance: User reports, DMCA/copyright, privacy (GDPR/CCPA)
 * - Policies: Community guidelines, terms of service, strikes, age verification
 *
 * Layer Dependencies:
 * - Depends on: Layer 0 (Infrastructure) for logging and audit trails
 * - Depends on: Layer 1 (Foundation) for repositories
 * - Depends on: Layer 2 (Intelligence) for content moderation AI
 * - Provides: Governance capabilities for Layer 3 (Communication) and Layer 4 (Interface)
 */
