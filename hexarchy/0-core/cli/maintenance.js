#!/usr/bin/env node
// Maintenance Mode Controller
import { program } from 'commander';
import { redisClient } from '../database/redis/config.js';

const MAINTENANCE_KEY = 'system:maintenance';

program
  .version('1.0.0')
  .description('HOOTNER Maintenance Mode Controller');

program
  .command('enable')
  .description('Enable maintenance mode')
  .option('-m, --message <message>', 'Maintenance message', 'System under maintenance')
  .action(async (options) => {
    try {
      await redisClient.connect();
      await redisClient.set(MAINTENANCE_KEY, JSON.stringify({
        enabled: true,
        message: options.message,
        startedAt: new Date().toISOString()
      }));
      console.log('🔧 Maintenance mode enabled');
      await redisClient.quit();
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to enable maintenance mode:', error);
      process.exit(1);
    }
  });

program
  .command('disable')
  .description('Disable maintenance mode')
  .action(async () => {
    try {
      await redisClient.connect();
      await redisClient.del(MAINTENANCE_KEY);
      console.log('✅ Maintenance mode disabled');
      await redisClient.quit();
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to disable maintenance mode:', error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check maintenance mode status')
  .action(async () => {
    try {
      await redisClient.connect();
      const status = await redisClient.get(MAINTENANCE_KEY);
      if (status) {
        const data = JSON.parse(status);
        console.log('🔧 Maintenance mode ENABLED');
        console.log('Message:', data.message);
        console.log('Started:', data.startedAt);
      } else {
        console.log('✅ Maintenance mode DISABLED');
      }
      await redisClient.quit();
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to check status:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
