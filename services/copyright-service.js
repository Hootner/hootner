/**
 * Copyright Management Service
 * Auto-adds copyright notices to all platform outputs
 * Supports multiple license types including Creative Commons
 */

import crypto from 'crypto';
import { format } from 'date-fns';

/**
 * Available license types
 */
export const LICENSE_TYPES = {
  ALL_RIGHTS_RESERVED: 'all-rights-reserved',
  CC_BY_NC: 'cc-by-nc', // Creative Commons Attribution-NonCommercial
  CC_BY_NC_SA: 'cc-by-nc-sa', // Creative Commons Attribution-NonCommercial-ShareAlike
  CC_BY: 'cc-by', // Creative Commons Attribution
  CC_BY_SA: 'cc-by-sa', // Creative Commons Attribution-ShareAlike
  PUBLIC_DOMAIN: 'public-domain'
};

/**
 * License metadata and terms
 */
const LICENSE_INFO = {
  [LICENSE_TYPES.ALL_RIGHTS_RESERVED]: {
    name: 'All Rights Reserved',
    url: null,
    description: 'No one may use, modify, or distribute this work without explicit permission',
    icon: '©',
    allowCommercial: false,
    allowModification: false,
    requireAttribution: true
  },
  [LICENSE_TYPES.CC_BY_NC]: {
    name: 'Creative Commons Attribution-NonCommercial 4.0',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    description: 'Others may share and adapt, but not for commercial purposes',
    icon: '🅭🅯',
    allowCommercial: false,
    allowModification: true,
    requireAttribution: true
  },
  [LICENSE_TYPES.CC_BY_NC_SA]: {
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    description: 'Share and adapt non-commercially, but derivatives must use same license',
    icon: '🅭🅯🅬',
    allowCommercial: false,
    allowModification: true,
    requireAttribution: true,
    requireShareAlike: true
  },
  [LICENSE_TYPES.CC_BY]: {
    name: 'Creative Commons Attribution 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    description: 'Others may share and adapt, even commercially, with attribution',
    icon: '🅭',
    allowCommercial: true,
    allowModification: true,
    requireAttribution: true
  },
  [LICENSE_TYPES.CC_BY_SA]: {
    name: 'Creative Commons Attribution-ShareAlike 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    description: 'Share and adapt commercially, but derivatives must use same license',
    icon: '🅭🅬',
    allowCommercial: true,
    allowModification: true,
    requireAttribution: true,
    requireShareAlike: true
  },
  [LICENSE_TYPES.PUBLIC_DOMAIN]: {
    name: 'Public Domain (CC0)',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    description: 'No copyright restrictions - free to use for any purpose',
    icon: '🄍',
    allowCommercial: true,
    allowModification: true,
    requireAttribution: false
  }
};

/**
 * Copyright Service Class
 */
export class CopyrightService {
  constructor() {
    this.defaultLicense = LICENSE_TYPES.ALL_RIGHTS_RESERVED;
  }

  /**
   * Generate copyright notice for content
   * @param {Object} options - Copyright options
   * @param {string} options.creatorName - Name of the creator
   * @param {string} options.creatorId - ID of the creator
   * @param {string} [options.contentType='video'] - Type of content (video, code, listing, etc.)
   * @param {string} [options.license] - License type
   * @param {number} [options.year] - Copyright year (defaults to current year)
   * @param {string} [options.contentTitle] - Title of the content
   * @returns {Object} Copyright metadata
   */
  generateCopyright(options) {
    const {
      creatorName,
      creatorId,
      contentType = 'video',
      license = this.defaultLicense,
      year = new Date().getFullYear(),
      contentTitle = 'Untitled'
    } = options;

    if (!creatorName || !creatorId) {
      throw new Error('Creator name and ID are required for copyright generation');
    }

    const licenseInfo = LICENSE_INFO[license] || LICENSE_INFO[this.defaultLicense];
    const copyrightId = this.generateCopyrightId(creatorId, contentTitle, year);

    return {
      copyrightId,
      notice: this.formatCopyrightNotice(creatorName, year, licenseInfo),
      fullNotice: this.formatFullCopyrightNotice(creatorName, year, licenseInfo, contentTitle),
      creatorName,
      creatorId,
      year,
      license,
      licenseInfo,
      contentType,
      contentTitle,
      timestamp: new Date().toISOString(),
      metadata: {
        canCopy: license !== LICENSE_TYPES.ALL_RIGHTS_RESERVED,
        canModify: licenseInfo.allowModification,
        canCommercialize: licenseInfo.allowCommercial,
        requiresAttribution: licenseInfo.requireAttribution,
        requiresShareAlike: licenseInfo.requireShareAlike || false
      }
    };
  }

  /**
   * Generate unique copyright ID
   */
  generateCopyrightId(creatorId, contentTitle, year) {
    const data = `${creatorId}-${contentTitle}-${year}-${Date.now()}`;
    return `CR-${crypto.createHash('md5').update(data).digest('hex').substring(0, 12).toUpperCase()}`;
  }

  /**
   * Format short copyright notice (for watermarks, headers)
   */
  formatCopyrightNotice(creatorName, year, licenseInfo) {
    const symbol = licenseInfo.icon || '©';
    return `${symbol} ${year} ${creatorName}`;
  }

  /**
   * Format full copyright notice (for descriptions, metadata)
   */
  formatFullCopyrightNotice(creatorName, year, licenseInfo, contentTitle) {
    let notice = `© ${year} ${creatorName}. `;

    if (contentTitle && contentTitle !== 'Untitled') {
      notice += `"${contentTitle}". `;
    }

    notice += licenseInfo.name;

    if (licenseInfo.url) {
      notice += ` (${licenseInfo.url})`;
    }

    notice += `. ${licenseInfo.description}.`;

    return notice;
  }

  /**
   * Add copyright to video metadata
   */
  addCopyrightToVideo(videoData, creatorData, licenseType) {
    const copyright = this.generateCopyright({
      creatorName: creatorData.name,
      creatorId: creatorData.id,
      contentType: 'video',
      license: licenseType || creatorData.defaultLicense,
      contentTitle: videoData.title
    });

    return {
      ...videoData,
      copyright: {
        ...copyright,
        // Add to video metadata for embedding in video file
        watermark: {
          text: copyright.notice,
          position: 'bottom-right',
          opacity: 0.7,
          enabled: true
        },
        // Add to video description
        description: videoData.description
          ? `${videoData.description}\n\n---\n${copyright.fullNotice}`
          : copyright.fullNotice
      }
    };
  }

  /**
   * Add copyright to code comments
   */
  addCopyrightToCode(code, creatorData, licenseType, fileName) {
    const copyright = this.generateCopyright({
      creatorName: creatorData.name,
      creatorId: creatorData.id,
      contentType: 'code',
      license: licenseType || creatorData.defaultLicense,
      contentTitle: fileName
    });

    const header = this.generateCodeHeader(copyright);
    return `${header}\n\n${code}`;
  }

  /**
   * Generate code file header with copyright
   */
  generateCodeHeader(copyright) {
    const lines = [
      '/**',
      ` * ${copyright.contentTitle}`,
      ` * ${copyright.notice}`,
      ' * ',
      ` * ${copyright.licenseInfo.name}`,
      copyright.licenseInfo.url ? ` * ${copyright.licenseInfo.url}` : null,
      ' * ',
      ` * ${copyright.licenseInfo.description}`,
      ' */'
    ].filter(Boolean);

    return lines.join('\n');
  }

  /**
   * Add copyright to marketplace listing
   */
  addCopyrightToListing(listingData, creatorData, licenseType) {
    const copyright = this.generateCopyright({
      creatorName: creatorData.name,
      creatorId: creatorData.id,
      contentType: 'listing',
      license: licenseType || creatorData.defaultLicense,
      contentTitle: listingData.title
    });

    return {
      ...listingData,
      copyright,
      licenseType,
      // Add to listing footer/metadata
      legalNotice: copyright.fullNotice,
      // Add badge for display
      licenseBadge: {
        icon: copyright.licenseInfo.icon,
        name: copyright.licenseInfo.name,
        url: copyright.licenseInfo.url
      }
    };
  }

  /**
   * Validate license compatibility for derivatives
   */
  canCreateDerivative(originalLicense, derivativeLicense) {
    const original = LICENSE_INFO[originalLicense];
    const derivative = LICENSE_INFO[derivativeLicense];

    if (!original || !derivative) {
      return { allowed: false, reason: 'Invalid license type' };
    }

    // Check if derivatives are allowed
    if (!original.allowModification) {
      return {
        allowed: false,
        reason: 'Original work does not allow modifications'
      };
    }

    // Check ShareAlike requirement
    if (original.requireShareAlike && derivativeLicense !== originalLicense) {
      return {
        allowed: false,
        reason: 'Original work requires derivative to use the same license (ShareAlike)'
      };
    }

    // Check commercial use restrictions
    if (!original.allowCommercial && derivative.allowCommercial) {
      return {
        allowed: false,
        reason: 'Original work is non-commercial, derivative cannot be used commercially'
      };
    }

    return { allowed: true };
  }

  /**
   * Get license information
   */
  getLicenseInfo(licenseType) {
    return LICENSE_INFO[licenseType] || null;
  }

  /**
   * Get all available licenses
   */
  getAllLicenses() {
    return Object.entries(LICENSE_INFO).map(([type, info]) => ({
      type,
      ...info
    }));
  }

  /**
   * Get recommended licenses for homeschool creators
   */
  getRecommendedLicenses() {
    return [
      {
        type: LICENSE_TYPES.ALL_RIGHTS_RESERVED,
        ...LICENSE_INFO[LICENSE_TYPES.ALL_RIGHTS_RESERVED],
        recommended: true,
        reason: 'Best protection - maintain full control over your work'
      },
      {
        type: LICENSE_TYPES.CC_BY_NC_SA,
        ...LICENSE_INFO[LICENSE_TYPES.CC_BY_NC_SA],
        recommended: true,
        reason: 'Encourage sharing within homeschool community while blocking commercial resale'
      },
      {
        type: LICENSE_TYPES.CC_BY_NC,
        ...LICENSE_INFO[LICENSE_TYPES.CC_BY_NC],
        recommended: false,
        reason: 'Allow sharing but not commercial use - watch for derivative works'
      }
    ];
  }
}

export default new CopyrightService();
