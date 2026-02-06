#!/usr/bin/env node
// Database Migration CLI
import { program } from 'commander';
import migrationRunner from '../database/migrations/runner.js';

program
  .version('1.0.0')
  .description('HOOTNER Database Migration Tool');

program
  .command('up')
  .description('Run all pending migrations')
  .action(async () => {
    try {
      console.log('🔄 Running pending migrations...');
      await migrationRunner.initialize();
      await migrationRunner.runPending();
      console.log('✅ Migrations complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      const applied = await migrationRunner.getAppliedMigrations();
      console.log('Applied migrations:', applied);
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
