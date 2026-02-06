/**
 * API Version Manager
 * Handles versioning for inter-domain APIs
 */

import { createLogger } from '../../0-core/utils/logger.js';

const logger = createLogger('governance', 'api-versioning');

class APIVersionManager {
  constructor() {
    this.versions = new Map();
    this.deprecatedVersions = new Set();
    this.migrationPaths = new Map();
  }

  /**
   * Register an API version
   */
  registerVersion(domain, version, config) {
    const key = `${domain}:${version}`;
    
    this.versions.set(key, {
      domain,
      version,
      endpoints: config.endpoints || [],
      schemas: config.schemas || {},
      releaseDate: config.releaseDate || Date.now(),
      sunsetDate: config.sunsetDate || null,
      status: 'active'
    });

    logger.info('API version registered', { domain, version });

    return key;
  }

  /**
   * Deprecate an API version
   */
  deprecateVersion(domain, version, sunsetDate) {
    const key = `${domain}:${version}`;
    const versionInfo = this.versions.get(key);

    if (!versionInfo) {
      throw new Error(`Version not found: ${key}`);
    }

    versionInfo.status = 'deprecated';
    versionInfo.sunsetDate = sunsetDate;
    this.deprecatedVersions.add(key);

    logger.warn('API version deprecated', {
      domain,
      version,
      sunsetDate: new Date(sunsetDate).toISOString()
    });

    return versionInfo;
  }

  /**
   * Check if version is supported
   */
  isVersionSupported(domain, version) {
    const key = `${domain}:${version}`;
    const versionInfo = this.versions.get(key);

    if (!versionInfo) {
      return { supported: false, reason: 'version_not_found' };
    }

    if (versionInfo.status === 'sunset') {
      return { supported: false, reason: 'version_sunset' };
    }

    if (versionInfo.status === 'deprecated') {
      return {
        supported: true,
        deprecated: true,
        sunsetDate: versionInfo.sunsetDate,
        message: 'This version is deprecated. Please migrate to a newer version.'
      };
    }

    return { supported: true };
  }

  /**
   * Get latest version for domain
   */
  getLatestVersion(domain) {
    const domainVersions = Array.from(this.versions.values())
      .filter(v => v.domain === domain && v.status === 'active')
      .sort((a, b) => this._compareVersions(b.version, a.version));

    return domainVersions[0] || null;
  }

  _compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 !== part2) {
        return part1 - part2;
      }
    }

    return 0;
  }

  /**
   * Register migration path between versions
   */
  registerMigration(domain, fromVersion, toVersion, migrationFn) {
    const key = `${domain}:${fromVersion}->${toVersion}`;
    
    this.migrationPaths.set(key, {
      domain,
      fromVersion,
      toVersion,
      migrate: migrationFn,
      createdAt: Date.now()
    });

    logger.info('Migration path registered', {
      domain,
      from: fromVersion,
      to: toVersion
    });
  }

  /**
   * Migrate data between versions
   */
  async migrateData(domain, fromVersion, toVersion, data) {
    const key = `${domain}:${fromVersion}->${toVersion}`;
    const migration = this.migrationPaths.get(key);

    if (!migration) {
      throw new Error(`No migration path found: ${key}`);
    }

    logger.info('Migrating data', { domain, fromVersion, toVersion });

    try {
      const migratedData = await migration.migrate(data);
      return {
        success: true,
        data: migratedData,
        fromVersion,
        toVersion
      };
    } catch (error) {
      logger.error('Migration failed', {
        domain,
        fromVersion,
        toVersion,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get version statistics
   */
  getStats() {
    const byDomain = {};
    
    for (const [key, versionInfo] of this.versions.entries()) {
      if (!byDomain[versionInfo.domain]) {
        byDomain[versionInfo.domain] = {
          total: 0,
          active: 0,
          deprecated: 0,
          sunset: 0
        };
      }

      byDomain[versionInfo.domain].total++;
      byDomain[versionInfo.domain][versionInfo.status]++;
    }

    return {
      totalVersions: this.versions.size,
      deprecatedVersions: this.deprecatedVersions.size,
      migrationPaths: this.migrationPaths.size,
      byDomain
    };
  }
}

// Example usage
export const apiVersionManager = new APIVersionManager();

// Register example versions
apiVersionManager.registerVersion('intelligence', '1.0.0', {
  endpoints: ['/tutoring/session', '/learning-path', '/assessment'],
  releaseDate: Date.now() - 31536000000 // 1 year ago
});

apiVersionManager.registerVersion('intelligence', '2.0.0', {
  endpoints: ['/v2/tutoring/session', '/v2/learning-path', '/v2/assessment', '/v2/personalization'],
  releaseDate: Date.now()
});

export default apiVersionManager;
