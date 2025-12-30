#!/usr/bin/env node
const { execSync } = require('childProcess');

const type = process.argv[2] || 'full';

const commands = {
  full: 'node scripts/backup-manager.js --type=full',
  incremental: 'node scripts/backup-manager.js --type=incremental',
  pitr: './scripts/pitr-backup.sh'
};

try {
    execSync(commands[type] || commands.full, { stdio: 'inherit' });
  } catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
