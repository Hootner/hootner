/**
 * Cache Constants
 * Shared constants across cache implementations
 */

module.exports = {
  // Cache key prefixes
  PREFIXES: {
    QUERY: "query:",
    USER: "User:",
    VIDEO: "Video:",
    COMMENT: "Comment:",
    TAG: "tag:",
    ROUTE: "route:",
  },

  // Cache events
  EVENTS: {
    CONNECTED: "connect",
    ERROR: "error",
    READY: "ready",
    RECONNECTING: "reconnecting",
  },

  // Redis connection states
  CONNECTION_STATES: {
    CONNECTING: "connecting",
    CONNECTED: "connected",
    READY: "ready",
    DISCONNECTED: "disconnected",
  },

  // Default limits
  LIMITS: {
    MAX_KEY_LENGTH: 256,
    MAX_VALUE_SIZE: 512 * 1024, // 512KB
    MAX_BATCH_SIZE: 100,
    MAX_PIPELINE_COMMANDS: 1000,
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 50,
    MAX_DELAY: 2000,
  },

  // Cache response headers
  HEADERS: {
    CACHE_STATUS: "X-Cache-Status",
    CACHE_KEY: "X-Cache-Key",
    CACHE_TTL: "X-Cache-TTL",
  },

  // Cache status values
  STATUS: {
    HIT: "HIT",
    MISS: "MISS",
    BYPASS: "BYPASS",
    ERROR: "ERROR",
  },
};
