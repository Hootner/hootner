/**
 * Content Licensing Service
 * Rights management and licensing verification
 */

class ContentLicensing {
  constructor() {
    this.licenseTypes = {
      'creative_commons': { commercial: false, attribution: true, shareAlike: true },
      'royalty_free': { commercial: true, attribution: false, shareAlike: false },
      'rights_managed': { commercial: true, attribution: true, exclusive: true },
      'public_domain': { commercial: true, attribution: false, restrictions: false },
      'fair_use': { commercial: false, educational: true, commentary: true }
    };
    
    this.territories = ['worldwide', 'US', 'EU', 'APAC', 'specific'];
    this.usageTypes = ['personal', 'commercial', 'educational', 'editorial', 'broadcast'];
  }

  async verifyLicense({ contentId, usageType, territory = 'worldwide', duration = 'perpetual' }) {
    console.log(`📋 Verifying license for content: ${contentId}`);
    
    const license = await this.getLicenseInfo(contentId);
    const verification = await this.checkUsageRights(license, usageType, territory, duration);
    
    return {
      contentId,
      licenseId: license.id,
      verified: verification.allowed,
      usageType,
      territory,
      duration,
      restrictions: verification.restrictions,
      expiresAt: verification.expiresAt,
      verifiedAt: new Date().toISOString()
    };
  }

  async getLicenseInfo(contentId) {
    // Mock license data - replace with actual license database
    const mockLicenses = {
      'video-123': {
        id: 'lic_123',
        type: 'royalty_free',
        owner: 'Content Creator Inc.',
        territory: 'worldwide',
        usageRights: ['personal', 'commercial'],
        restrictions: [],
        expiresAt: null // perpetual
      },
      'video-456': {
        id: 'lic_456',
        type: 'creative_commons',
        owner: 'Open Source Creator',
        territory: 'worldwide',
        usageRights: ['personal', 'educational'],
        restrictions: ['attribution_required', 'no_commercial'],
        expiresAt: null
      }
    };
    
    return mockLicenses[contentId] || {
      id: `lic_${Date.now()}`,
      type: 'unknown',
      owner: 'Unknown',
      territory: 'unknown',
      usageRights: [],
      restrictions: ['verification_required'],
      expiresAt: null
    };
  }

  async checkUsageRights(license, usageType, territory, duration) {
    const verification = {
      allowed: false,
      restrictions: [],
      expiresAt: license.expiresAt,
      warnings: []
    };

    // Check usage type permissions
    if (license.usageRights.includes(usageType)) {
      verification.allowed = true;
    } else if (usageType === 'commercial' && license.restrictions.includes('no_commercial')) {
      verification.allowed = false;
      verification.restrictions.push('Commercial use not permitted');
    }

    // Check territory restrictions
    if (license.territory !== 'worldwide' && license.territory !== territory) {
      verification.allowed = false;
      verification.restrictions.push(`Not licensed for territory: ${territory}`);
    }

    // Check attribution requirements
    if (license.restrictions.includes('attribution_required')) {
      verification.restrictions.push('Attribution required');
    }

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      verification.allowed = false;
      verification.restrictions.push('License expired');
    }

    return verification;
  }

  async registerLicense({ contentId, licenseType, owner, territory, usageRights, duration }) {
    const licenseId = `lic_${Date.now()}`;
    
    const license = {
      id: licenseId,
      contentId,
      type: licenseType,
      owner,
      territory,
      usageRights,
      restrictions: this.getLicenseRestrictions(licenseType),
      createdAt: new Date().toISOString(),
      expiresAt: duration === 'perpetual' ? null : new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log(`📝 Registered license ${licenseId} for content: ${contentId}`);
    return license;
  }

  getLicenseRestrictions(licenseType) {
    const typeConfig = this.licenseTypes[licenseType];
    if (!typeConfig) return ['unknown_license_type'];
    
    const restrictions = [];
    if (typeConfig.attribution) restrictions.push('attribution_required');
    if (!typeConfig.commercial) restrictions.push('no_commercial');
    if (typeConfig.shareAlike) restrictions.push('share_alike_required');
    
    return restrictions;
  }

  async checkLicense({ contentId, usageType, territory = 'worldwide' }) {
    console.log(`📋 Checking license for content: ${contentId} (${usageType})`);
    return await this.verifyLicense({ contentId, usageType, territory });
  }

  async generateLicenseReport(contentIds) {
    const report = {
      generatedAt: new Date().toISOString(),
      totalContent: contentIds.length,
      licenses: [],
      summary: {
        verified: 0,
        expired: 0,
        restricted: 0,
        unknown: 0
      }
    };

    for (const contentId of contentIds) {
      const license = await this.getLicenseInfo(contentId);
      const verification = await this.checkUsageRights(license, 'commercial', 'worldwide');
      
      report.licenses.push({
        contentId,
        license,
        verification
      });

      // Update summary
      if (verification.allowed) report.summary.verified++;
      else if (license.expiresAt && new Date(license.expiresAt) < new Date()) report.summary.expired++;
      else if (verification.restrictions.length > 0) report.summary.restricted++;
      else report.summary.unknown++;
    }

    return report;
  }
}

module.exports = new ContentLicensing();