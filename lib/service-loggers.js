// Service Logger Setup - Add to each microservice
import { createLogger } from '../lib/logger.js';

// Analytics Service (Port 3001)
export const analyticsLogger = createLogger('analytics', 'services');

// Audit Service (Port 3002)
export const auditLogger = createLogger('audit', 'services');

// Auth Service (Port 3003)
export const authLogger = createLogger('auth', 'services');

// Content Moderation (Port 3004)
export const moderationLogger = createLogger('moderation', 'services');

// Event Service (Port 3005)
export const eventLogger = createLogger('event', 'services');

// Marketplace (Port 3006)
export const marketplaceLogger = createLogger('marketplace', 'services');

// Police Bot (Port 3007)
export const policeBotLogger = createLogger('police-bot', 'services');

// Profile Service (Port 3008)
export const profileLogger = createLogger('profile', 'services');

// Search Service (Port 3009)
export const searchLogger = createLogger('search', 'services');

// Security Service (Port 3010)
export const securityLogger = createLogger('security', 'services');

// Subscription Service (Port 3011)
export const subscriptionLogger = createLogger('subscription', 'services');

// Video Service (Port 3012)
export const videoLogger = createLogger('video', 'services');

// Usage example:
// import { analyticsLogger } from './lib/service-loggers.js';
// analyticsLogger.info('Analytics service started', { port: 3001 });
// analyticsLogger.error('Database connection failed', { error: err.message });
