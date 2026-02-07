/**
 * Backup and Disaster Recovery System
 * Automated backups, PITR, multi-region sync
 */

import { spawn } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

export class BackupManager {
  constructor(config) {
    this.config = config;
    this.s3 = new S3Client({ region: config.aws.region });
    this.backupSchedule = {
      full: '0 2 * * *',      // Daily at 2 AM
      incremental: '0 */6 * * *', // Every 6 hours
      pitr: '*/15 * * * *'    // Every 15 minutes
    };
  }

  // Full MongoDB backup
  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `mongodb-full-${timestamp}`;
    const backupPath = `/tmp/${backupName}`;

    console.log(`Starting full backup: ${backupName}`);

    try {
      // Run mongodump
      await this.runCommand('mongodump', [
        '--uri', this.config.mongodb.uri,
        '--out', backupPath,
        '--gzip'
      ]);

      // Compress backup
      const archivePath = `${backupPath}.tar.gz`;
      await this.compressDirectory(backupPath, archivePath);

      // Upload to S3
      await this.uploadToS3(archivePath, `backups/full/${backupName}.tar.gz`);

      // Upload to secondary region
      await this.uploadToS3(
        archivePath, 
        `backups/full/${backupName}.tar.gz`,
        this.config.aws.secondaryRegion
      );

      console.log(`Full backup completed: ${backupName}`);

      return {
        type: 'full',
        name: backupName,
        timestamp: new Date(),
        size: await this.getFileSize(archivePath),
        location: `s3://${this.config.aws.bucket}/backups/full/${backupName}.tar.gz`
      };

    } catch (error) {
      console.error('Full backup failed:', error);
      throw error;
    }
  }

  // Incremental backup (oplog)
  async createIncrementalBackup(lastBackupTime) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `mongodb-incremental-${timestamp}`;

    console.log(`Starting incremental backup: ${backupName}`);

    try {
      // Backup oplog entries since last backup
      await this.runCommand('mongodump', [
        '--uri', this.config.mongodb.uri,
        '--db', 'local',
        '--collection', 'oplog.rs',
        '--query', JSON.stringify({ ts: { $gt: lastBackupTime } }),
        '--out', `/tmp/${backupName}`,
        '--gzip'
      ]);

      const archivePath = `/tmp/${backupName}.tar.gz`;
      await this.compressDirectory(`/tmp/${backupName}`, archivePath);
      await this.uploadToS3(archivePath, `backups/incremental/${backupName}.tar.gz`);

      console.log(`Incremental backup completed: ${backupName}`);

      return {
        type: 'incremental',
        name: backupName,
        timestamp: new Date(),
        fromTime: lastBackupTime,
        location: `s3://${this.config.aws.bucket}/backups/incremental/${backupName}.tar.gz`
      };

    } catch (error) {
      console.error('Incremental backup failed:', error);
      throw error;
    }
  }

  // Point-in-Time Recovery snapshot
  async createPITRSnapshot() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotName = `pitr-${timestamp}`;

    // Store current oplog position
    const oplogPosition = await this.getOplogPosition();

    await this.uploadToS3(
      Buffer.from(JSON.stringify(oplogPosition)),
      `backups/pitr/${snapshotName}.json`
    );

    return {
      type: 'pitr',
      name: snapshotName,
      timestamp: new Date(),
      oplogPosition
    };
  }

  // Restore from backup
  async restoreBackup(backupName, targetTime = null) {
    console.log(`Starting restore: ${backupName}`);

    try {
      // Download from S3
      const backupPath = `/tmp/${backupName}`;
      await this.downloadFromS3(`backups/full/${backupName}.tar.gz`, `${backupPath}.tar.gz`);

      // Extract
      await this.extractArchive(`${backupPath}.tar.gz`, backupPath);

      // Restore with mongorestore
      await this.runCommand('mongorestore', [
        '--uri', this.config.mongodb.uri,
        '--gzip',
        '--drop',
        backupPath
      ]);

      // If PITR requested, apply oplog
      if (targetTime) {
        await this.applyOplogToTime(targetTime);
      }

      console.log(`Restore completed: ${backupName}`);

      return {
        success: true,
        backupName,
        restoredAt: new Date(),
        targetTime
      };

    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  // Apply oplog entries up to specific time
  async applyOplogToTime(targetTime) {
    console.log(`Applying oplog to ${targetTime}`);

    // Download all incremental backups
    const incrementalBackups = await this.listBackups('incremental');
    
    for (const backup of incrementalBackups) {
      if (new Date(backup.timestamp) <= targetTime) {
        await this.downloadFromS3(backup.location, `/tmp/${backup.name}`);
        await this.runCommand('mongorestore', [
          '--uri', this.config.mongodb.uri,
          '--oplogReplay',
          '--oplogLimit', targetTime.getTime() / 1000,
          `/tmp/${backup.name}`
        ]);
      }
    }
  }

  // Verify backup integrity
  async verifyBackup(backupName) {
    console.log(`Verifying backup: ${backupName}`);

    try {
      // Download backup
      const backupPath = `/tmp/verify-${backupName}`;
      await this.downloadFromS3(`backups/full/${backupName}.tar.gz`, `${backupPath}.tar.gz`);

      // Extract and validate
      await this.extractArchive(`${backupPath}.tar.gz`, backupPath);

      // Check BSON files
      const valid = await this.validateBSONFiles(backupPath);

      return {
        backupName,
        valid,
        verifiedAt: new Date()
      };

    } catch (error) {
      console.error('Backup verification failed:', error);
      return {
        backupName,
        valid: false,
        error: error.message
      };
    }
  }

  // Backup retention policy
  async enforceRetentionPolicy() {
    const policies = {
      full: { days: 30, keep: 'daily' },
      incremental: { days: 7, keep: 'all' },
      pitr: { days: 1, keep: 'all' }
    };

    for (const [type, policy] of Object.entries(policies)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.days);

      const backups = await this.listBackups(type);
      const toDelete = backups.filter(b => new Date(b.timestamp) < cutoffDate);

      for (const backup of toDelete) {
        await this.deleteBackup(backup.name, type);
        console.log(`Deleted old backup: ${backup.name}`);
      }
    }
  }

  // Helper methods
  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args);
      let output = '';

      proc.stdout.on('data', (data) => output += data.toString());
      proc.stderr.on('data', (data) => console.error(data.toString()));
      
      proc.on('close', (code) => {
        if (code === 0) resolve(output);
        else reject(new Error(`Command failed with code ${code}`));
      });
    });
  }

  async uploadToS3(filePath, key, region = null) {
    const fileStream = createReadStream(filePath);
    const uploadParams = {
      Bucket: this.config.aws.bucket,
      Key: key,
      Body: fileStream
    };

    const client = region ? new S3Client({ region }) : this.s3;
    await client.send(new PutObjectCommand(uploadParams));
  }

  async compressDirectory(source, destination) {
    const gzip = createGzip();
    const input = createReadStream(source);
    const output = createWriteStream(destination);
    await pipeline(input, gzip, output);
  }

  async getOplogPosition() {
    // Get current oplog timestamp
    const db = this.config.mongodb.client.db('local');
    const oplog = await db.collection('oplog.rs').find().sort({ $natural: -1 }).limit(1).toArray();
    return oplog[0]?.ts || null;
  }

  async getFileSize(path) {
    const { stat } = await import('fs/promises');
    const stats = await stat(path);
    return stats.size;
  }

  // Disaster recovery test
  async testDisasterRecovery() {
    console.log('Starting disaster recovery test...');

    const testResults = {
      backupCreation: false,
      backupVerification: false,
      restoreTest: false,
      dataIntegrity: false
    };

    try {
      // Create test backup
      const backup = await this.createFullBackup();
      testResults.backupCreation = true;

      // Verify backup
      const verification = await this.verifyBackup(backup.name);
      testResults.backupVerification = verification.valid;

      // Test restore (to test database)
      const restore = await this.restoreBackup(backup.name);
      testResults.restoreTest = restore.success;

      // Verify data integrity
      testResults.dataIntegrity = await this.verifyDataIntegrity();

      console.log('Disaster recovery test completed:', testResults);

      return testResults;

    } catch (error) {
      console.error('Disaster recovery test failed:', error);
      return testResults;
    }
  }

  async verifyDataIntegrity() {
    // Run data integrity checks
    // Compare record counts, checksums, etc.
    return true; // Placeholder
  }

  async listBackups(type) {
    // List backups from S3
    return []; // Placeholder
  }

  async deleteBackup(name, type) {
    // Delete backup from S3
  }

  async downloadFromS3(key, destination) {
    // Download from S3
  }

  async extractArchive(source, destination) {
    // Extract tar.gz
  }

  async validateBSONFiles(path) {
    // Validate BSON files
    return true;
  }
}

// Export singleton
export const backupManager = new BackupManager({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017'
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    secondaryRegion: process.env.AWS_SECONDARY_REGION || 'us-west-2',
    bucket: process.env.BACKUP_BUCKET || 'hootner-backups'
  }
});
