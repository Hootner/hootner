/**
 * Data Migration Manager
 * Handles schema versioning and data migrations
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { databaseManager } from '../storage/database-manager.js';

const logger = createLogger('data', 'migrations');

class MigrationManager {
  constructor() {
    this.migrations = [];
    this.executed = new Set();
  }

  /**
   * Register a migration
   */
  register(migration) {
    if (!migration.version || !migration.up || !migration.down) {
      throw new Error('Migration must have version, up, and down methods');
    }

    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
    
    logger.info('Registered migration', { version: migration.version, name: migration.name });
  }

  /**
   * Run pending migrations
   */
  async migrate(targetVersion = null) {
    logger.info('Starting migrations', { targetVersion });

    const currentVersion = await this._getCurrentVersion();
    const pendingMigrations = this.migrations.filter(
      m => m.version > currentVersion && (targetVersion === null || m.version <= targetVersion)
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return { migrationsRun: 0, currentVersion };
    }

    logger.info(`Running ${pendingMigrations.length} migrations`);

    for (const migration of pendingMigrations) {
      await this._runMigration(migration, 'up');
    }

    const newVersion = pendingMigrations[pendingMigrations.length - 1].version;
    await this._setCurrentVersion(newVersion);

    return {
      migrationsRun: pendingMigrations.length,
      currentVersion: newVersion
    };
  }

  /**
   * Rollback migrations
   */
  async rollback(targetVersion) {
    logger.info('Rolling back migrations', { targetVersion });

    const currentVersion = await this._getCurrentVersion();
    const migrationsToRollback = this.migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .reverse();

    for (const migration of migrationsToRollback) {
      await this._runMigration(migration, 'down');
    }

    await this._setCurrentVersion(targetVersion);

    return {
      migrationsRolledBack: migrationsToRollback.length,
      currentVersion: targetVersion
    };
  }

  async _runMigration(migration, direction) {
    logger.info(`Running migration ${direction}`, {
      version: migration.version,
      name: migration.name
    });

    try {
      const startTime = Date.now();
      
      if (direction === 'up') {
        await migration.up();
      } else {
        await migration.down();
      }

      const duration = Date.now() - startTime;
      
      logger.info('Migration completed', {
        version: migration.version,
        direction,
        duration: `${duration}ms`
      });

      this.executed.add(migration.version);
    } catch (error) {
      logger.error('Migration failed', {
        version: migration.version,
        direction,
        error: error.message
      });
      throw error;
    }
  }

  async _getCurrentVersion() {
    // In real implementation, would query migrations table
    // For now, return 0
    return 0;
  }

  async _setCurrentVersion(version) {
    // In real implementation, would update migrations table
    logger.info('Setting migration version', { version });
  }

  /**
   * Get migration status
   */
  getStatus() {
    return {
      totalMigrations: this.migrations.length,
      executedMigrations: this.executed.size,
      pendingMigrations: this.migrations.filter(m => !this.executed.has(m.version))
    };
  }
}

// Example migrations
export const exampleMigrations = [
  {
    version: 1,
    name: 'create_users_table',
    up: async () => {
      logger.info('Creating users table');
      // SQL: CREATE TABLE users (...)
    },
    down: async () => {
      logger.info('Dropping users table');
      // SQL: DROP TABLE users
    }
  },
  {
    version: 2,
    name: 'add_learning_paths_table',
    up: async () => {
      logger.info('Creating learning_paths table');
    },
    down: async () => {
      logger.info('Dropping learning_paths table');
    }
  }
];

export const migrationManager = new MigrationManager();
export default migrationManager;
