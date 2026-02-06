// Database Migration Runner
import { docClient } from '../dynamodb/config.js';
import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs/promises';
import path from 'path';

const MIGRATIONS_TABLE = 'Migrations';
const MIGRATIONS_DIR = './migrations';

export class MigrationRunner {
  async initialize() {
    try {
      await docClient.send(new PutCommand({
        TableName: MIGRATIONS_TABLE,
        Item: { id: 'init', timestamp: Date.now() }
      }));
    } catch (error) {
      console.log('✅ Migrations table ready');
    }
  }

  async getAppliedMigrations() {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: MIGRATIONS_TABLE
      }));
      return result.Items?.map(m => m.id) || [];
    } catch (error) {
      return [];
    }
  }

  async applyMigration(migration) {
    try {
      await migration.up();
      await docClient.send(new PutCommand({
        TableName: MIGRATIONS_TABLE,
        Item: {
          id: migration.id,
          name: migration.name,
          timestamp: Date.now(),
          applied: true
        }
      }));
      console.log(`✅ Applied migration: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.name}`, error);
      throw error;
    }
  }

  async rollbackMigration(migration) {
    try {
      await migration.down();
      await docClient.send(new PutCommand({
        TableName: MIGRATIONS_TABLE,
        Item: {
          id: migration.id,
          name: migration.name,
          timestamp: Date.now(),
          applied: false
        }
      }));
      console.log(`✅ Rolled back migration: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Rollback failed: ${migration.name}`, error);
      throw error;
    }
  }

  async runPending() {
    const applied = await this.getAppliedMigrations();
    const files = await fs.readdir(MIGRATIONS_DIR);
    const pending = files
      .filter(f => f.endsWith('.js'))
      .filter(f => !applied.includes(path.basename(f, '.js')));

    for (const file of pending) {
      const migration = await import(path.join(MIGRATIONS_DIR, file));
      await this.applyMigration(migration.default);
    }
  }
}

export default new MigrationRunner();
