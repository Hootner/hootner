/**
 * Global Configuration for Hexarchy System
 * Shared settings across all domains
 */

export const globalConfig = {
  // System metadata
  system: {
    name: 'Hexarchy Educational Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    deploymentId: process.env.DEPLOYMENT_ID || 'local'
  },

  // Domain registry
  domains: {
    foundation: { id: 1, port: 5001, health: '/health' },
    intelligence: { id: 2, port: 5002, health: '/health' },
    communication: { id: 3, port: 5003, health: '/health' },
    interface: { id: 4, port: 5004, health: '/health' },
    economy: { id: 5, port: 5005, health: '/health' },
    governance: { id: 6, port: 5006, health: '/health' },
    data: { id: 7, port: 5007, health: '/health' },
    operations: { id: 8, port: 5008, health: '/health' }
  },

  // Observability
  observability: {
    tracing: {
      enabled: true,
      serviceName: 'hexarchy',
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
    },
    metrics: {
      enabled: true,
      port: 9090,
      interval: 15000
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      outputs: ['console', 'file']
    }
  },

  // Circuit breaker defaults
  circuitBreaker: {
    threshold: 5,
    timeout: 60000,
    resetTimeout: 30000
  },

  // Retry policies
  retry: {
    maxAttempts: 3,
    backoff: 'exponential',
    initialDelay: 1000,
    maxDelay: 10000
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100
  },

  // Feature flags
  features: {
    aiTutoring: true,
    blockchain: true,
    advancedAnalytics: true,
    collaborativeWhiteboard: false
  }
};

export default globalConfig;
