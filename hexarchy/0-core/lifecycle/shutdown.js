// Graceful Shutdown Manager
import { logger } from '../logging/logger.js';
import connectionPool from '../database/utils/connection-pool.js';
import { getIO } from '../realtime/socket.js';

class ShutdownManager {
  constructor() {
    this.isShuttingDown = false;
    this.shutdownTimeout = 30000; // 30 seconds
    this.cleanupHandlers = [];
  }

  // Register cleanup handler
  onShutdown(handler) {
    this.cleanupHandlers.push(handler);
  }

  // Graceful shutdown
  async shutdown(signal) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // Set timeout for force shutdown
    const forceShutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      // Stop accepting new requests
      logger.info('Stopping new connections...');

      // Close WebSocket connections
      try {
        const io = getIO();
        io.close(() => {
          logger.info('✅ WebSocket connections closed');
        });
      } catch (error) {
        logger.warn('WebSocket not initialized or already closed');
      }

      // Run custom cleanup handlers
      logger.info('Running cleanup handlers...');
      await Promise.all(
        this.cleanupHandlers.map(async (handler) => {
          try {
            await handler();
          } catch (error) {
            logger.error('Cleanup handler failed:', error);
          }
        })
      );

      // Close database connections
      logger.info('Closing database connections...');
      await connectionPool.disconnectAll();

      clearTimeout(forceShutdownTimer);
      logger.info('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      clearTimeout(forceShutdownTimer);
      process.exit(1);
    }
  }

  // Initialize shutdown handlers
  initialize() {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGUSR2', () => this.shutdown('SIGUSR2')); // nodemon restart

    logger.info('✅ Graceful shutdown handlers registered');
  }
}

export default new ShutdownManager();
