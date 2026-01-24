# Layer 6 - Governance

Policies, compliance, and content moderation for the Hootner video platform.

## 📁 Structure

```
6-governance/
├── moderation/                # Content Moderation
│   └── ContentModerationPolicyService.js  # Moderation policies & actions
├── compliance/                # Compliance Services
│   ├── UserReportingService.js            # User reports & flagging
│   ├── CopyrightService.js                # DMCA & copyright management
│   └── PrivacyComplianceService.js        # GDPR/CCPA compliance
├── policies/                  # Policy Services
│   ├── CommunityGuidelinesService.js      # Guidelines & strikes
│   └── AgeVerificationService.js          # Age verification & ratings
├── index.js                   # Central export
└── README.md                  # This file
```

## 🎯 Purpose

Layer 6 provides governance and policy enforcement:
- **Content Moderation**: Automated and manual content review
- **User Reporting**: Flagging system, report processing
- **Copyright**: DMCA takedowns, Content ID matching
- **Privacy Compliance**: GDPR/CCPA data requests
- **Community Guidelines**: Strikes, suspensions, appeals
- **Age Verification**: Content ratings, parental controls

## 🛡️ Content Moderation

### ContentModerationPolicyService
Content review and moderation actions:

**Moderation Actions:**
- `APPROVE` - Content passes review
- `REMOVE` - Content violates policies
- `WARN` - Send warning to creator
- `RESTRICT` - Limit content visibility
- `AGE_RESTRICT` - Require age verification (18+)
- `DEMONETIZE` - Disable monetization
- `BAN` - Permanently ban creator

**Severity Levels:**
- LOW - Minor violations
- MEDIUM - Moderate violations
- HIGH - Serious violations
- CRITICAL - Severe violations requiring immediate action

**Methods:**
- `reviewContent(contentId, contentType, moderatorId)` - Create review, run automated checks
- `takeAction(reviewId, action, reason, moderatorId)` - Execute moderation action
- `approveContent(review)` - Mark content as approved
- `removeContent(review)` - Remove content and notify creator
- `warnCreator(review)` - Issue warning
- `restrictContent(review)` - Restrict visibility
- `ageRestrictContent(review)` - Require 18+ verification
- `demonetizeContent(review)` - Disable ads/monetization
- `banCreator(review)` - Ban user account
- `getPendingReviews(limit)` - Get unreviewed content queue
- `getModerationQueue(filters)` - Get filtered moderation queue
- `getModerationStatistics(period)` - Stats (total, pending, by action, avg response time)
- `createAppeal(reviewId, userId, appealReason)` - Appeal moderation decision
- `reviewAppeal(appealId, moderatorId, decision, comments)` - Process appeal
- `reverseAction(reviewId)` - Reverse moderation (if appeal approved)

**Auto-Moderation:** High confidence violations (>90%) trigger automatic removal.

## 🚩 User Reporting

### UserReportingService
User flagging and report processing:

**Report Types:**
- SPAM - Unwanted promotional content
- HARASSMENT - Bullying, threats
- HATE_SPEECH - Discriminatory content
- VIOLENCE - Violent content
- SEXUAL_CONTENT - Explicit sexual material
- COPYRIGHT - Copyright infringement
- IMPERSONATION - Fake accounts
- MISINFORMATION - False information
- DANGEROUS_CONTENT - Harmful activities
- OTHER - Other violations

**Priority Levels:**
- CRITICAL - Violence, sexual content, dangerous content
- HIGH - Hate speech, harassment, impersonation
- MEDIUM - Copyright, misinformation, spam

**Methods:**
- `createReport(reportData)` - Submit user report
  - Validates type, checks duplicates
  - Triggers auto-review for high-priority
- `getReport(reportId)` - Get report details
- `getReportsByContent(contentId, contentType)` - All reports for content
- `getReportsByUser(userId, role)` - Reports by/about user
- `processReport(reportId, moderatorId, decision, comments)` - Review report
  - Decision: 'valid', 'invalid', 'needs_review'
  - Valid reports trigger content moderation
- `getReportStatistics(period)` - Stats (total, pending, by type/priority)
- `getTrendingReports(limit)` - Content with multiple reports
- `blockReporter(userId, reason)` - Block abusive reporters
- `getReportQueue(filters)` - Filtered report queue for moderators

## ⚖️ Copyright Compliance

### CopyrightService
DMCA takedown and Content ID management:

**DMCA Process:**
1. Copyright holder submits takedown notice
2. Content immediately removed (DMCA requirement)
3. Content owner notified
4. Owner can submit counter-notice
5. 10-14 day waiting period
6. Content restored unless legal action taken

**Methods:**
- `submitDMCANotice(noticeData)` - File DMCA takedown
  - Required fields: complainant info, copyrighted work, infringing content
  - Immediate takedown, notify content owner
- `takedownContent(contentId, contentType, noticeId)` - Remove content
- `submitCounterNotice(counterNoticeData)` - Contest takedown
  - Required: good faith statement, consent to jurisdiction
  - Notifies complainant, schedules restoration (14 days)
- `scheduleRestoration(contentId, days)` - Schedule content restoration
- `processScheduledRestorations()` - Restore eligible content
- `restoreContent(contentId)` - Restore taken-down content
- `getDMCANotice(noticeId)` - Get notice details
- `getUserDMCANotices(userId)` - User's notices
- `registerContentID(contentData)` - Register copyright for auto-detection
  - Registers audio/video fingerprint
  - Enables automated copyright matching
- `matchContentID(videoFingerprint)` - Match against registered copyrights
- `getCopyrightStatistics(period)` - Stats (notices, takedowns, counter-notices)

**Content ID:** Automated copyright detection using audio/video fingerprinting.

## 🔒 Privacy Compliance

### PrivacyComplianceService
GDPR and CCPA compliance:

**GDPR Rights:**
- Article 15: Right to access (data export)
- Article 17: Right to be forgotten (deletion)
- Article 20: Right to data portability
- Article 33-34: Data breach notification

**Methods:**
- `handleDataAccessRequest(userId)` - Export all user data (GDPR Article 15)
  - Collects: profile, videos, comments, playlists, likes, subscriptions, watch history, payments
  - Creates audit log
- `collectUserData(userId)` - Collect all user data
- `handleDataDeletionRequest(userId, keepAnonymizedData)` - Delete user data (GDPR Article 17)
  - Full deletion or anonymization
  - 30-day processing window
- `anonymizeUserData(userId)` - Replace PII with anonymized values
- `deleteUserData(userId)` - Complete data deletion
- `handleDataPortabilityRequest(userId, format)` - Export in portable format (GDPR Article 20)
  - Formats: JSON, CSV
- `updateConsentPreferences(userId, preferences)` - Update tracking consent
  - Analytics, marketing, personalization, third-party sharing
- `getConsentPreferences(userId)` - Get current consent
- `notifyDataBreach(breachData)` - Notify users and authorities (GDPR Article 33-34)
  - Within 72 hours for authorities
  - Immediate user notification
- `getComplianceReport(period)` - Compliance metrics (requests, response time, compliance rate)

**CCPA:** Similar rights (access, deletion, opt-out of sale).

## 📋 Community Guidelines

### CommunityGuidelinesService
Community standards and enforcement:

**Guideline Categories:**
- CONTENT_STANDARDS - Quality and appropriateness
- USER_CONDUCT - Behavior expectations
- COPYRIGHT - Copyright rules
- PRIVACY - Privacy policies
- SAFETY - Safety guidelines
- SPAM_MANIPULATION - Anti-spam rules
- MONETIZATION - Monetization policies

**Strike System:**
- Strike 1: Warning issued
- Strike 2: 7-day account restriction
- Strike 3: Account suspension
- Strikes expire after 90 days

**Methods:**
- `getCurrentGuidelines()` - Get active guidelines
- `getGuidelineVersion(version)` - Get specific version
- `updateGuidelines(guidelineData, updatedBy)` - Update guidelines
  - Archives old version, creates new
  - Notifies users of changes
- `recordTermsAcceptance(userId, termsVersion, ipAddress)` - Log terms acceptance
- `hasAcceptedLatestTerms(userId)` - Check if user accepted latest terms
- `issueStrike(userId, violationData)` - Issue guideline violation strike
  - Severity: minor, moderate, major, severe
  - Actions based on strike count
  - 90-day expiration
- `warnUser(userId, strikeId)` - Send warning
- `restrictAccount(userId, days)` - Temporary restriction
- `suspendAccount(userId, reason)` - Permanent suspension
- `removeStrike(strikeId, reason)` - Remove strike (appeal approved)
- `getUserStrikes(userId)` - User's strike history
- `processExpiredStrikes()` - Expire strikes after 90 days
- `getGuidelineStatistics(period)` - Stats (strikes by category/severity)

## 🔞 Age Verification

### AgeVerificationService
Age verification and content ratings:

**Content Ratings:**
- GENERAL (All Ages) - 0+
- PARENTAL_GUIDANCE (PG) - 7+
- TEEN - 13+
- MATURE - 17+
- ADULT - 18+

**Verification Methods:**
- ID_DOCUMENT - Government ID
- CREDIT_CARD - Credit card verification
- AGE_GATE - Self-reported date of birth

**Methods:**
- `verifyUserAge(userId, verificationData)` - Verify user age
  - Minimum platform age: 13
  - Creates verification record
- `calculateAge(dateOfBirth)` - Calculate age from DOB
- `rateContent(contentId, contentType, rating, reasons)` - Assign content rating
- `canAccessContent(userId, contentId)` - Check if user can view content
  - Checks age verification and minimum age
- `autoRateContent(contentId, contentType)` - AI-powered auto-rating
  - Detects: violence, profanity, sexual content, drugs
  - Assigns appropriate rating
- `enableParentalControls(parentUserId, childUserId, restrictions)` - Set up parental controls
  - Max rating, allowed categories, blocked keywords, time restrictions
- `checkParentalControls(userId, contentId)` - Validate against parental controls
- `getAgeStatistics()` - User age distribution

**Parental Controls:**
- Maximum content rating
- Allowed categories
- Blocked keywords
- Time restrictions (viewing hours)

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 0 (Infrastructure) - Logging, audit trails
- Layer 1 (Foundation) - Repositories, domain services
- Layer 2 (Intelligence) - Content moderation AI

**Provides:**
- Governance enforcement for Layer 3 (Communication)
- Policy compliance for Layer 4 (Interface)

## 📚 Usage Examples

### Content Moderation
```javascript
import { ContentModerationPolicyService } from './hexarchy/6-governance/index.js';

const moderationService = new ContentModerationPolicyService(repository, aiService);

// Review content
const review = await moderationService.reviewContent(videoId, 'video', moderatorId);

// Take action
if (!review.autoModeration.approved) {
  await moderationService.takeAction(review.id, 'REMOVE', 'Violates community guidelines');
}

// Get queue
const queue = await moderationService.getModerationQueue({ priority: 'high' });

// Appeal
const appeal = await moderationService.createAppeal(reviewId, userId, 'This was a mistake');
await moderationService.reviewAppeal(appeal.id, moderatorId, 'approved', 'Appeal granted');
```

### User Reporting
```javascript
import { UserReportingService } from './hexarchy/6-governance/index.js';

const reportingService = new UserReportingService(repository, moderationService);

// Submit report
const report = await reportingService.createReport({
  reporterId: userId,
  contentId: videoId,
  contentType: 'video',
  reportType: 'HARASSMENT',
  description: 'This video contains targeted harassment',
  evidence: ['screenshot1.jpg', 'screenshot2.jpg']
});

// Process report
await reportingService.processReport(report.id, moderatorId, 'valid', 'Report confirmed');

// Get trending reports
const trending = await reportingService.getTrendingReports(10);
```

### Copyright Management
```javascript
import { CopyrightService } from './hexarchy/6-governance/index.js';

const copyrightService = new CopyrightService(repository, contentRepository);

// Submit DMCA
const notice = await copyrightService.submitDMCANotice({
  complainantName: 'Copyright Holder',
  complainantEmail: 'holder@example.com',
  copyrightedWork: 'Original Song Title',
  infringingContent: { contentId: videoId, contentType: 'video', url: 'https://...' },
  goodFaithStatement: true,
  accuracyStatement: true,
  signature: 'Signature'
});

// Counter-notice
const counterNotice = await copyrightService.submitCounterNotice({
  noticeId: notice.id,
  userId: contentOwnerId,
  userName: 'Content Creator',
  goodFaithStatement: true,
  consentToJurisdiction: true
});

// Register Content ID
await copyrightService.registerContentID({
  userId: rightsholderId,
  title: 'My Song',
  fingerprint: audioFingerprint,
  referenceFile: 'reference.mp3'
});
```

### Privacy Compliance
```javascript
import { PrivacyComplianceService } from './hexarchy/6-governance/index.js';

const privacyService = new PrivacyComplianceService(userRepo, dataRepo, auditLogger);

// Data access request
const userData = await privacyService.handleDataAccessRequest(userId);
// Returns complete user data export

// Data deletion
await privacyService.handleDataDeletionRequest(userId, keepAnonymizedData = false);

// Update consent
await privacyService.updateConsentPreferences(userId, {
  analytics: true,
  marketing: false,
  personalization: true,
  thirdPartySharing: false
});

// Data breach notification
await privacyService.notifyDataBreach({
  breachType: 'unauthorized_access',
  affectedUsers: [userId1, userId2],
  breachDate: '2026-01-20',
  description: 'Unauthorized database access',
  mitigation: 'Passwords reset, additional security measures'
});
```

### Community Guidelines
```javascript
import { CommunityGuidelinesService } from './hexarchy/6-governance/index.js';

const guidelinesService = new CommunityGuidelinesService(repository, userRepository);

// Issue strike
const strike = await guidelinesService.issueStrike(userId, {
  category: 'USER_CONDUCT',
  description: 'Harassment in comments',
  contentId: commentId,
  severity: 'MAJOR'
});

// Get user strikes
const strikes = await guidelinesService.getUserStrikes(userId);
console.log('Active strikes:', strikes.filter(s => !s.expired).length);

// Record terms acceptance
await guidelinesService.recordTermsAcceptance(userId, '2.0', ipAddress);

// Update guidelines
await guidelinesService.updateGuidelines({
  category: 'CONTENT_STANDARDS',
  content: 'Updated content standards...',
  effectiveDate: '2026-02-01'
}, adminId);
```

### Age Verification
```javascript
import { AgeVerificationService } from './hexarchy/6-governance/index.js';

const ageService = new AgeVerificationService(userRepo, contentRepo);

// Verify age
await ageService.verifyUserAge(userId, {
  dateOfBirth: '2000-01-15',
  verificationMethod: 'id_document',
  documentData: { type: 'drivers_license', number: '***' }
});

// Rate content
await ageService.rateContent(videoId, 'video', 'MATURE', ['Violence', 'Strong language']);

// Auto-rate
const rating = await ageService.autoRateContent(videoId, 'video');

// Check access
const access = await ageService.canAccessContent(userId, videoId);
if (!access.canAccess) {
  console.log('Access denied:', access.reason);
}

// Parental controls
await ageService.enableParentalControls(parentId, childId, {
  maxRating: 'PG',
  allowedCategories: ['Education', 'Entertainment'],
  blockedKeywords: ['violence', 'scary'],
  timeRestrictions: { maxHoursPerDay: 2 }
});
```

## ✅ Complete

Layer 6 (Governance) is **100% complete** with:
- ✅ 1 content moderation service
- ✅ 3 compliance services (reporting, copyright, privacy)
- ✅ 2 policy services (guidelines, age verification)
- ✅ Central export file

**Total: 7 files** providing comprehensive governance and compliance for the Hootner video platform.

**Key Features:**
- Automated + manual content moderation
- DMCA takedown process with counter-notices
- GDPR/CCPA compliance (data access, deletion, portability)
- Strike system with 90-day expiration
- Age verification and content ratings (5 levels)
- Parental controls
- User reporting with priority levels
- Content ID copyright matching
- Data breach notification
- Appeal process for moderation decisions
