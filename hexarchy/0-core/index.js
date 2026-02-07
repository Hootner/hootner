// Layer 0: Core Infrastructure - Main Export
// Central export file for all Layer 0 modules

// Database
export * from './database/dynamodb/config.js';
export * from './database/redis/config.js';
export * from './database/utils/query-builder.js';
export { default as connectionPool } from './database/utils/connection-pool.js';
export { default as migrationRunner } from './database/migrations/runner.js';

// API
export * from './api/graphql/config.js';
export * from './api/rest/config.js';

// AWS
export * from './aws/s3/config.js';
export * from './aws/lambda/config.js';
export * from './aws/cloudfront/config.js';
export * from './aws/sqs/config.js';
export * from './aws/ses/config.js';
export * from './aws/sns/config.js';
export * from './aws/secrets-manager/config.js';

// Authentication
export * from './auth/firebase.js';
export * from './auth/jwt.js';
export * from './auth/session.js';
export * from './auth/middleware.js';

// Security
export * from './security/cors.js';
export * from './security/helmet.js';
export * from './security/rate-limit.js';
export * from './security/validation.js';

// Real-time
export * from './realtime/socket.js';
export * from './realtime/event-bus.js';

// Logging
export * from './logging/logger.js';
export * from './logging/cloudwatch.js';
export * from './logging/health.js';

// Payment
export * from './payment/stripe.js';

// Notifications
export * from './notifications/email.js';
export * from './notifications/push.js';

// Errors
export * from './errors/custom-errors.js';
export * from './errors/handler.js';

// Storage
export * from './storage/upload.js';

// Cache
export * from './cache/strategies.js';

// Middleware
export * from './middleware/compression.js';
export * from './middleware/sanitization.js';
export * from './middleware/request-id.js';
export * from './middleware/response-time.js';

// Documentation
export * from './documentation/swagger.js';
export * from './documentation/graphql-docs.js';

// Metrics
export * from './metrics/prometheus.js';

// Constants
export * from './constants/http-status.js';
export * from './constants/error-codes.js';
export * from './constants/limits.js';

// Utilities
export * from './utils/crypto.js';
export * from './utils/date.js';
export * from './utils/string.js';

// Resilience
export * from './resilience/circuit-breaker.js';
export * from './resilience/retry.js';
export * from './resilience/timeout.js';
export * from './resilience/bulkhead.js';

// Testing
export * from './testing/fixtures.js';
export * from './testing/mocks.js';

// Config
export { default as env } from './config/env.js';
export * from './config/features.js';
