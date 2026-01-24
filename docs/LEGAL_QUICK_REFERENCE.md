# Quick Reference: Legal & Community Protection

## 🚀 Quick Start

```bash
# Import services
import copyrightService from './services/copyright-service.js';
import dmcaService from './services/dmca-service.js';
import communityNormsService from './services/community-norms-service.js';

# Add copyright to content
const copyright = copyrightService.generateCopyright({
  creatorName: 'Creator Name',
  creatorId: 'user123',
  contentType: 'video',
  license: 'cc-by-nc-sa',
  contentTitle: 'My Video'
});

# File DMCA takedown
const result = await dmcaService.submitTakedownNotice({ ... });
```

## 📋 License Quick Reference

| License | Symbol | Use |
|---------|--------|-----|
| **All Rights Reserved** ⭐ | © | Full protection |
| **CC BY-NC-SA** ⭐ | 🅭🅯🅬 | Homeschool sharing |
| **CC BY-NC** | 🅭🅯 | Non-commercial |
| **CC BY** | 🅭 | Open sharing |
| **Public Domain** | 🄍 | No restrictions |

⭐ = Recommended for homeschool creators

## 🔧 GraphQL Examples

```graphql
# Set default license
mutation {
  setCreatorLicense(userId: "user123", licenseType: CC_BY_NC_SA) {
    defaultLicense
  }
}

# Get copyright info
query {
  copyrightInfo(contentId: "video123", contentType: VIDEO) {
    notice
    fullNotice
    licenseInfo { name url description }
  }
}

# Submit DMCA takedown
mutation {
  submitDMCATakedown(input: {
    complainantName: "John Doe"
    complainantEmail: "john@example.com"
    # ... other required fields
  }) {
    noticeId
    status
  }
}
```

## ⚖️ DMCA Timeline

```
Day 0:  Notice submitted
Day 2:  Content removed (after review)
Day 12: Counter-notice filed
Day 26: Content restored (if no lawsuit)
```

## 🛡️ Legal Checklist

Before production:

- [ ] Register with U.S. Copyright Office as service provider
- [ ] Designate DMCA agent
- [ ] Configure service provider info in `dmca-service.js`
- [ ] Create public copyright policy page
- [ ] Add DMCA contact info to site footer
- [ ] Implement repeat infringer policy
- [ ] Test takedown/counter-notice flow
- [ ] Set up audit logging
- [ ] Configure email notifications
- [ ] Train staff on DMCA procedures

## 📚 Documentation

- [Complete Guide](./LEGAL_COMPLIANCE_GUIDE.md) - Full documentation
- [GraphQL Schema](../api/graphql/schema.graphql) - API reference
- [Copyright Service](../services/copyright-service.js) - Service API
- [DMCA Service](../services/dmca-service.js) - DMCA API
- [Community Norms](../services/community-norms-service.js) - Guidelines

## 🆘 Quick Help

**For Creators:**
- Choose license: "All Rights Reserved" or "CC BY-NC-SA"
- File DMCA: `/dmca/file-notice`
- Support: creators@hootner.com

**For Users:**
- Check license before sharing
- Always credit creators
- Report violations: `/report`

**Legal Contact:**
- DMCA: dmca@hootner.com
- Legal: legal@hootner.com

---

**Version**: 1.0.0 | **Status**: ✅ Ready
