# Legal & Community Protection Guide
## Copyright, Licensing, and DMCA Compliance

> **Protecting Creators, Building Community** - Legal backstops for the HOOTNER platform

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Copyright Management](#copyright-management)
3. [Creative Commons Licensing](#creative-commons-licensing)
4. [DMCA Compliance](#dmca-compliance)
5. [Community Norms](#community-norms)
6. [Implementation Guide](#implementation-guide)
7. [API Reference](#api-reference)
8. [Legal Requirements](#legal-requirements)

---

## Overview

HOOTNER implements comprehensive legal protections to support homeschool creators while fostering a respectful community. The system provides:

- **Auto-Copyright** - Automatic copyright notices on all content
- **License Management** - Creative Commons and traditional licensing options
- **DMCA Protection** - Statutory compliance with takedown/counter-notice procedures
- **Community Education** - Onboarding and messaging about respecting creators

### Key Features

✅ Automatic copyright notices (© [Creator] [Year])
✅ 6 license types including CC-BY-NC recommended for homeschool creators
✅ Full DMCA compliance infrastructure
✅ Counter-notice support with statutory timelines
✅ Community guidelines and onboarding flows
✅ Audit logging for all legal actions

---

## Copyright Management

### Automatic Copyright Notices

Every piece of content uploaded to HOOTNER automatically receives copyright protection:

```javascript
import copyrightService from './services/copyright-service.js';

// Example: Adding copyright to video
const videoWithCopyright = copyrightService.addCopyrightToVideo(
  videoData,
  creatorData,
  'cc-by-nc-sa' // License type
);

// Result includes:
// - Copyright notice: © 2026 Jane Smith
// - Full legal notice with license terms
// - Watermark configuration
// - Metadata (can copy, can modify, etc.)
```

### Supported License Types

| License Type | Symbol | Commercial Use | Modifications | Attribution Required | Best For |
|--------------|--------|----------------|---------------|---------------------|----------|
| **All Rights Reserved** | © | ❌ No | ❌ No | ✅ Yes | Premium content, paid courses |
| **CC BY-NC-SA** ⭐ | 🅭🅯🅬 | ❌ No | ✅ Yes | ✅ Yes | Homeschool community sharing |
| **CC BY-NC** | 🅭🅯 | ❌ No | ✅ Yes | ✅ Yes | Free resources (watch derivatives) |
| **CC BY-SA** | 🅭🅬 | ✅ Yes | ✅ Yes | ✅ Yes | Open educational resources |
| **CC BY** | 🅭 | ✅ Yes | ✅ Yes | ✅ Yes | Maximum sharing |
| **Public Domain** | 🄍 | ✅ Yes | ✅ Yes | ❌ No | No restrictions |

⭐ **Recommended for Homeschool Creators**: CC BY-NC-SA blocks commercial resale while encouraging community sharing

### Copyright Service API

```javascript
// Generate copyright for any content type
const copyright = copyrightService.generateCopyright({
  creatorName: 'John Doe',
  creatorId: 'user123',
  contentType: 'video', // video, code, listing
  license: 'cc-by-nc-sa',
  contentTitle: 'Algebra Basics for Kids',
  year: 2026 // Optional, defaults to current year
});

// Result structure:
{
  copyrightId: 'CR-A1B2C3D4E5F6',
  notice: '🅭🅯🅬 2026 John Doe',
  fullNotice: '© 2026 John Doe. "Algebra Basics for Kids". Creative Commons Attribution-NonCommercial-ShareAlike 4.0...',
  licenseInfo: { name, url, description, icon, permissions },
  metadata: { canCopy, canModify, canCommercialize, requiresAttribution }
}
```

### Adding Copyright to Different Content Types

#### Videos
```javascript
const video = copyrightService.addCopyrightToVideo(videoData, creator, license);
// Adds watermark configuration and updates description
```

#### Code Files
```javascript
const code = copyrightService.addCopyrightToCode(sourceCode, creator, license, fileName);
// Adds header comment with copyright and license
```

#### Marketplace Listings
```javascript
const listing = copyrightService.addCopyrightToListing(listingData, creator, license);
// Adds legal notice and license badge
```

### License Compatibility

Check if derivative works are allowed:

```javascript
const compatibility = copyrightService.canCreateDerivative(
  'cc-by-nc-sa', // Original license
  'all-rights-reserved' // Proposed derivative license
);

if (!compatibility.allowed) {
  console.log(compatibility.reason);
  // "Original work requires derivative to use the same license (ShareAlike)"
}
```

---

## Creative Commons Licensing

### License Selection UI

Creators choose licenses through:

1. **Default License** - Set once, applies to all uploads
2. **Per-Content License** - Override for specific uploads
3. **Batch License Update** - Change license for multiple items

### GraphQL Mutations

```graphql
# Set creator's default license
mutation SetDefaultLicense {
  setCreatorLicense(
    userId: "user123"
    licenseType: CC_BY_NC_SA
  ) {
    userId
    defaultLicense
    copyrightedContentCount
  }
}

# Update specific content license
mutation UpdateContentLicense {
  updateContentLicense(
    contentId: "video456"
    contentType: VIDEO
    licenseType: ALL_RIGHTS_RESERVED
  ) {
    copyrightId
    notice
    fullNotice
    licenseInfo {
      name
      url
      description
      allowCommercial
      allowModification
    }
  }
}
```

### License Recommendations

The system provides context-aware recommendations:

```graphql
query GetRecommendedLicenses {
  recommendedLicenses(userType: CREATOR) {
    type
    name
    recommended
    reason
    description
  }
}
```

**Example Response:**
```json
[
  {
    "type": "ALL_RIGHTS_RESERVED",
    "recommended": true,
    "reason": "Best protection - maintain full control over your work"
  },
  {
    "type": "CC_BY_NC_SA",
    "recommended": true,
    "reason": "Encourage sharing within homeschool community while blocking commercial resale"
  }
]
```

---

## DMCA Compliance

### Legal Requirements

⚠️ **IMPORTANT**: Before deploying DMCA features to production:

1. **Register with U.S. Copyright Office** as a service provider
   - Required under 17 USC § 512(c)(2)
   - Online directory: https://www.copyright.gov/dmca-directory/
   - Form: https://www.copyright.gov/dmca-directory/registration.html

2. **Designate DMCA Agent**
   - Must be registered with Copyright Office
   - Contact info publicly available on platform

3. **Consult Legal Counsel**
   - Review policies and procedures
   - Ensure compliance with statutory requirements
   - Understand safe harbor provisions

### DMCA Service Provider Information

```javascript
const providerInfo = dmcaService.getServiceProviderInfo();

// Configure with your registered information:
const dmcaService = new DMCAService({
  serviceProviderName: 'HOOTNER Platform LLC',
  agentName: 'Jane Smith, DMCA Agent',
  address: '123 Main St, City, State, ZIP',
  phone: '+1-555-123-4567',
  email: 'dmca@hootner.com'
});
```

### Takedown Notice Process

#### 1. Submit Takedown Notice (17 USC § 512(c)(3) Requirements)

```javascript
const result = await dmcaService.submitTakedownNotice({
  // Complainant information
  complainantName: 'John Doe',
  complainantAddress: '123 Creator Lane, City, State, ZIP',
  complainantPhone: '+1-555-987-6543',
  complainantEmail: 'john@example.com',
  isRightsHolder: true,
  authorizedAgent: null,

  // Infringing content
  contentType: 'video',
  contentId: 'video123',
  contentUrl: 'https://hootner.com/videos/video123',
  contentDescription: 'Unauthorized copy of my educational video',

  // Copyrighted work
  copyrightedWorkDescription: 'My original algebra tutorial video',
  copyrightedWorkUrl: 'https://mysite.com/original-video',
  registrationNumber: 'TXu 2-123-456', // Optional

  // Required statements under penalty of perjury
  goodFaithStatement: true,
  accuracyStatement: true,
  penaltyOfPerjuryStatement: true,

  // Electronic signature
  signatureName: 'John Doe',
  ipAddress: '192.0.2.1',

  // Alleged infringer
  uploaderUserId: 'user456',
  uploaderUsername: 'contentposter',
  uploaderEmail: 'poster@example.com'
});

// Result:
{
  success: true,
  noticeId: 'DMCA-1234567890-A1B2C3D4',
  status: 'SUBMITTED',
  message: 'DMCA notice submitted successfully. Under review.',
  estimatedReviewTime: '2 business days'
}
```

#### 2. Internal Review (Platform Staff)

```javascript
await dmcaService.processTakedownNotice('DMCA-123...', {
  reviewerId: 'staff789',
  notes: 'Valid notice, clear copyright infringement',
  action: 'approve' // or 'reject'
});
```

#### 3. Content Removal

```javascript
const result = await dmcaService.removeContent('DMCA-123...');
// - Marks content as removed
// - Notifies uploader (statutory requirement)
// - Logs audit trail
// - Returns notice with updated status
```

**Automatic Notifications:**
- ✅ Complainant receives confirmation
- ✅ Uploader receives takedown notice with counter-notice option
- ✅ Internal team receives review request

### Counter-Notice Process

#### 1. Submit Counter-Notice (17 USC § 512(g)(3) Requirements)

```javascript
const result = await dmcaService.submitCounterNotice({
  originalNoticeId: 'DMCA-123...',

  // Subscriber information
  subscriberName: 'Jane Smith',
  subscriberAddress: '456 User Ave, City, State, ZIP',
  subscriberPhone: '+1-555-111-2222',
  subscriberEmail: 'jane@example.com',

  // Required statements
  goodFaithStatement: true, // Good faith belief content removed by mistake
  consentToJurisdiction: true, // Consent to federal court jurisdiction
  penaltyOfPerjuryStatement: true, // Statement under penalty of perjury

  // Signature
  signatureName: 'Jane Smith',

  // Explanation
  explanation: 'This is my original work, not a copy. I created this video myself and own all rights.'
});

// Result:
{
  success: true,
  noticeId: 'DMCA-123...',
  status: 'COUNTER_NOTICE_FORWARDED',
  message: 'Counter-notice submitted and forwarded to complainant',
  restorationDate: '2026-02-10T12:00:00Z',
  note: 'Content will be restored in 10-14 business days unless complainant files lawsuit'
}
```

#### 2. Counter-Notice Forwarded to Complainant

System automatically forwards counter-notice to original complainant, who has 10-14 business days to:
- File lawsuit and notify platform, OR
- Let restoration period expire

#### 3. Automatic Restoration

```javascript
// After 10-14 business days without lawsuit notification
await dmcaService.restoreContent('DMCA-123...', 'counter_notice_period_expired');

// - Content restored
// - Uploader notified
// - Audit trail logged
```

### DMCA Status Tracking

```graphql
query TrackDMCANotice {
  dmcaNotice(noticeId: "DMCA-123...") {
    noticeId
    status  # SUBMITTED, UNDER_REVIEW, CONTENT_REMOVED, etc.
    submittedAt
    contentRemovedAt
    restorationDate
    counterNotice {
      submittedAt
      explanation
    }
    actions {
      action
      timestamp
      reason
    }
  }
}
```

### DMCA Timeline

```
Day 0: Notice submitted → Under review (2 business days)
Day 2: Content removed → Uploader notified
Day 3-12: Counter-notice period (10 days)
Day 12: Counter-notice submitted → Forwarded to complainant
Day 26: Restoration (14 days after counter-notice)
```

---

## Community Norms

### Onboarding Flows

Three user types with tailored messaging:

#### 1. Creators

```javascript
const onboarding = communityNormsService.getOnboardingFlow('creator');

// Key messages:
// - "Your work is valuable - we help you protect it"
// - License selection guidance
// - DMCA protection overview
// - Auto-copyright features
```

#### 2. Consumers

```javascript
const onboarding = communityNormsService.getOnboardingFlow('consumer');

// Key messages:
// - "Respect creators - their work supports families"
// - Understanding license symbols
// - Proper attribution
// - Reporting violations
```

#### 3. Educators

```javascript
const onboarding = communityNormsService.getOnboardingFlow('educator');

// Key messages:
// - Fair use for education
// - Citation requirements
// - Commercial use restrictions
// - Supporting creator families
```

### Community Guidelines

```javascript
const guidelines = communityNormsService.getGuidelines();

// Principles:
// 1. Respect Creators' Work
// 2. Proper Attribution Matters
// 3. Copying Hurts Families
// 4. Build Together
```

### In-Platform Messaging

System provides contextual messages throughout the platform:

```javascript
// On upload
const uploadMessage = communityNormsService.getPlatformMessage('upload');
// "Protect Your Work - Choose a license for this upload"

// Before download
const downloadMessage = communityNormsService.getPlatformMessage('download');
// "Respect the Creator - Check license before sharing"

// When sharing
const shareMessage = communityNormsService.getPlatformMessage('share');
// "Sharing Responsibly - Include proper attribution"
```

### Attribution Generator

```javascript
const attribution = communityNormsService.generateAttribution(
  content,
  creator
);

// Result: "Algebra Basics for Kids" by John Doe (CC BY-NC-SA)
```

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install date-fns
# Copyright service uses date-fns for year formatting
```

### Step 2: Configure Services

```javascript
// services/copyright-service.js
import copyrightService from './copyright-service.js';

// services/dmca-service.js
import { DMCAService } from './dmca-service.js';

const dmcaService = new DMCAService({
  serviceProviderName: 'HOOTNER Platform',
  agentName: 'DMCA Agent Name',
  address: 'Your registered address',
  phone: 'Your phone',
  email: 'dmca@yourdomain.com',
  autoNotify: true // Enable automatic email notifications
});

// services/community-norms-service.js
import communityNormsService from './community-norms-service.js';
```

### Step 3: Add to GraphQL Server

```javascript
// api/graphql/resolvers/index.js
import copyrightResolvers from './copyright-resolvers.js';

export const resolvers = {
  Query: {
    ...copyrightResolvers.Query,
    // ... other queries
  },
  Mutation: {
    ...copyrightResolvers.Mutation,
    // ... other mutations
  }
};
```

### Step 4: Update Database Schema

Add fields to your data models:

```javascript
// User/Creator Profile
{
  userId: 'user123',
  defaultLicense: 'cc-by-nc-sa',
  licensePreferences: {},
  copyrightedContentCount: 42,
  dmcaNoticesReceived: 0,
  dmcaNoticesFiled: 1
}

// Content (Video/Code/Listing)
{
  id: 'content123',
  title: 'My Content',
  creatorId: 'user123',
  copyright: {
    copyrightId: 'CR-...',
    notice: '© 2026 Creator Name',
    fullNotice: 'Full legal notice...',
    license: 'cc-by-nc-sa',
    licenseInfo: { ... },
    metadata: { canCopy: true, ... }
  }
}
```

### Step 5: Add Middleware

Auto-add copyright to new uploads:

```javascript
// middleware/copyright-middleware.js
export const addCopyrightToUpload = async (req, res, next) => {
  if (req.file && req.user) {
    const copyright = copyrightService.generateCopyright({
      creatorName: req.user.name,
      creatorId: req.user.id,
      contentType: req.body.contentType || 'video',
      license: req.user.defaultLicense || 'all-rights-reserved',
      contentTitle: req.body.title
    });

    req.uploadData = {
      ...req.body,
      copyright
    };
  }
  next();
};
```

### Step 6: Add UI Components

**License Selection:**
```jsx
import { useLicenseSelector } from './hooks/useLicense';

function LicenseSelector() {
  const { licenses, selected, setLicense } = useLicenseSelector();
  
  return (
    <div>
      {licenses.map(license => (
        <LicenseBadge
          key={license.type}
          license={license}
          selected={selected === license.type}
          onClick={() => setLicense(license.type)}
        />
      ))}
    </div>
  );
}
```

**Copyright Display:**
```jsx
function CopyrightNotice({ content }) {
  return (
    <div className="copyright-notice">
      <span className="icon">{content.copyright.licenseInfo.icon}</span>
      <span className="notice">{content.copyright.notice}</span>
      <a href={content.copyright.licenseInfo.url} target="_blank">
        {content.copyright.licenseInfo.name}
      </a>
    </div>
  );
}
```

**DMCA Report Button:**
```jsx
function ReportCopyrightButton({ contentId }) {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowForm(true)}>
        Report Copyright Violation
      </button>
      {showForm && <DMCANoticeForm contentId={contentId} />}
    </>
  );
}
```

---

## API Reference

### GraphQL Schema

See [schema.graphql](../api/graphql/schema.graphql) for complete schema.

**Key Types:**
- `CopyrightInfo` - Copyright metadata for content
- `DMCANotice` - Takedown/counter-notice records
- `LicenseInfo` - License details and permissions
- `CommunityGuidelines` - Platform guidelines

**Key Queries:**
- `copyrightInfo(contentId, contentType)` - Get copyright for content
- `availableLicenses` - List all license options
- `recommendedLicenses(userType)` - Get recommendations
- `dmcaNotice(noticeId)` - Get DMCA notice details
- `communityGuidelines` - Get platform guidelines
- `onboardingFlow(userType)` - Get onboarding content

**Key Mutations:**
- `setCreatorLicense(userId, licenseType)` - Set default license
- `updateContentLicense(contentId, contentType, licenseType)` - Update content license
- `submitDMCATakedown(input)` - File takedown notice
- `submitDMCACounterNotice(input)` - File counter-notice
- `processDMCANotice(noticeId, action, reviewData)` - Review notice (staff)

### Service APIs

See source files for complete APIs:
- [copyright-service.js](../services/copyright-service.js)
- [dmca-service.js](../services/dmca-service.js)
- [community-norms-service.js](../services/community-norms-service.js)

---

## Legal Requirements

### Copyright Office Registration

**Required for DMCA Safe Harbor Protection:**

1. Register as service provider: https://www.copyright.gov/dmca-directory/
2. Pay registration fee ($6 as of 2026)
3. Update registration when contact info changes
4. Designate agent to receive DMCA notices

### Policy Requirements

Your platform must have:

1. **Copyright Policy** - Publicly visible
2. **Repeat Infringer Policy** - Terminate accounts of repeat offenders
3. **DMCA Notice Procedures** - Clear instructions for filing
4. **Contact Information** - DMCA agent email/address

### Statutory Timelines

- **Counter-Notice Period**: 10 business days minimum
- **Restoration Period**: 10-14 business days after counter-notice
- **Response Time**: "Expeditiously" remove content (generally within 24-48 hours)

### Record Keeping

Maintain records of:
- All DMCA notices received
- All counter-notices received
- Content removal actions
- Restoration actions
- Communications with parties

**Retention**: Recommend 7 years minimum

---

## Testing & Validation

### Test DMCA Flow

```bash
# Test takedown notice
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { submitDMCATakedown(input: { ... }) { noticeId status } }"}'

# Test counter-notice
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { submitDMCACounterNotice(input: { ... }) { noticeId status restorationDate } }"}'
```

### Validate Copyright Generation

```javascript
const assert = require('assert');

const copyright = copyrightService.generateCopyright({
  creatorName: 'Test Creator',
  creatorId: 'test123',
  contentType: 'video',
  license: 'cc-by-nc-sa',
  contentTitle: 'Test Video'
});

assert(copyright.notice.includes('Test Creator'));
assert(copyright.licenseInfo.name.includes('Creative Commons'));
assert(copyright.metadata.canCopy === true);
assert(copyright.metadata.canCommercialize === false);
```

---

## Support & Resources

### Documentation
- [DMCA Overview](https://www.copyright.gov/dmca/)
- [Creative Commons](https://creativecommons.org/)
- [Copyright Basics](https://www.copyright.gov/circs/circ01.pdf)

### Platform Links
- DMCA Notice Form: `/dmca/file-notice`
- Counter-Notice Form: `/dmca/counter-notice/:noticeId`
- License Guide: `/help/licenses`
- Community Guidelines: `/community/guidelines`

### Contact
- DMCA Agent: dmca@hootner.com
- Legal Questions: legal@hootner.com
- Creator Support: creators@hootner.com

---

**Last Updated**: January 24, 2026
**Version**: 1.0.0
**Status**: ✅ Implementation Complete
