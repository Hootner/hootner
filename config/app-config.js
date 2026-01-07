import { LIMITS, TIMEOUTS } from '../constants/index.js';
const parseIntSafe = (value, defaultValue, min = 0, max = Number.MAX_SAFE_INTEGER) => { const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min || parsed > max) { return defaultValue; }
  return parsed; };

const config = { // Audit Service
  audit: { port: parseIntSafe(process.env.AUDIT_SERVICE_PORT, LIMITS.MIN_PORT, 1024, LIMITS.MAX_PORT),
    maxLogSize: parseIntSafe(process.env.MAX_LOG_SIZE, 10 * 1024 * 1024, 1024, 100 * 1024 * 1024),
    allowedServices: (process.env.ALLOWED_SERVICES || 'auth,payment,security,video,analytics')
      .split(',')
      .map((s) => s.trim()),
    maxEventLength: parseIntSafe(process.env.MAX_EVENT_LENGTH, 100, 1, 1000), },

  // Backup Service
  backup: { port: parseIntSafe(process.env.BACKUP_SERVICE_PORT, LIMITS.HUB_PORT, 1024, LIMITS.MAX_PORT),
    cronSchedule: process.env.BACKUP_CRON || '0 2 * * *',
    bucketName: process.env.BACKUP_BUCKET || 'hootner-backups',
    waitTimeMs: parseIntSafe(process.env.BACKUP_WAIT_TIME, TIMEOUTS.FIVE_SECONDS, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_MINUTE),
    rateLimit: { windowMs: parseIntSafe(process.env.BACKUP_RATE_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.BACKUP_RATE_MAX, 10, 1, 1000), }, },

  // Security Service
  security: { port: parseIntSafe(process.env.SECURITY_SERVICE_PORT, LIMITS.DEFAULT_PORT, 1024, LIMITS.MAX_PORT),
    maxTargetLength: parseIntSafe(process.env.MAX_TARGET_LENGTH, LIMITS.RATE_LIMIT_MAX, 1, LIMITS.MAX_BUFFER_SIZE),
    validScanTypes: (process.env.VALID_SCAN_TYPES || 'vulnerability,malware,compliance,xss,sqli')
      .split(',')
      .map((s) => s.trim()),
    threatScoreMultiplier: parseIntSafe(process.env.THREAT_SCORE_MULTIPLIER, 25, 1, 100), },

  // Rate Limiting
  rateLimit: { default: { windowMs: parseIntSafe(process.env.RATE_LIMIT_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.RATE_LIMIT_MAX, 100, 1, LIMITS.MAX_RETRY_COUNT), },
    auth: { windowMs: parseIntSafe(process.env.AUTH_RATE_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.AUTH_RATE_MAX, 20, 1, 1000), },
    payment: { windowMs: parseIntSafe(process.env.PAYMENT_RATE_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.PAYMENT_RATE_MAX, 10, 1, 1000), },
    security: { windowMs: parseIntSafe(process.env.SECURITY_RATE_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.SECURITY_RATE_MAX, 50, 1, 1000), },
    audit: { windowMs: parseIntSafe(process.env.AUDIT_RATE_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.AUDIT_RATE_MAX, LIMITS.RATE_LIMIT_MIN, 1, LIMITS.MAX_RETRY_COUNT), },
    analytics: { windowMs: parseIntSafe(process.env.ANALYTICS_RATE_WINDOW, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
      max: parseIntSafe(process.env.ANALYTICS_RATE_MAX, LIMITS.RATE_LIMIT_MAX, 1, LIMITS.MAX_RETRY_COUNT), }, },

  // Circuit Breaker
  circuitBreaker: { threshold: parseIntSafe(process.env.CIRCUIT_BREAKER_THRESHOLD, 5, 1, 100),
    timeout: parseIntSafe(process.env.CIRCUIT_BREAKER_TIMEOUT, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.FIVE_MINUTES), },

  // Retry Logic
  retry: { maxRetries: parseIntSafe(process.env.MAX_RETRIES, 3, 0, 10),
    baseDelay: parseIntSafe(process.env.RETRY_BASE_DELAY, TIMEOUTS.ONE_SECOND, 100, TIMEOUTS.TEN_SECONDS),
    maxDelay: parseIntSafe(process.env.RETRY_MAX_DELAY, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.FIVE_MINUTES),
    maxRetriesLimit: parseIntSafe(process.env.MAX_RETRIES_LIMIT, 10, 1, 100),
    minDelay: parseIntSafe(process.env.RETRY_MIN_DELAY, 100, 10, TIMEOUTS.TEN_SECONDS),
    maxDelayLimit: parseIntSafe(process.env.RETRY_MAX_DELAY_LIMIT, TIMEOUTS.THIRTY_SECONDS, TIMEOUTS.ONE_SECOND, TIMEOUTS.FIVE_MINUTES), },

  // Timeout
  timeout: { default: parseIntSafe(process.env.DEFAULT_TIMEOUT, TIMEOUTS.FIVE_SECONDS, TIMEOUTS.ONE_SECOND, TIMEOUTS.FIVE_MINUTES),
    max: parseIntSafe(process.env.MAX_TIMEOUT, TIMEOUTS.FIVE_MINUTES, TIMEOUTS.ONE_SECOND, 600000),
    middleware: parseIntSafe(process.env.MIDDLEWARE_TIMEOUT, TIMEOUTS.THIRTY_SECONDS, TIMEOUTS.ONE_SECOND, TIMEOUTS.FIVE_MINUTES), },

  // Server
  server: { port: parseIntSafe(process.env.PORT, TIMEOUTS.FIVE_SECONDS, 1024, LIMITS.MAX_PORT),
    rateLimitWindow: parseIntSafe(process.env.SERVER_RATE_WINDOW, 15 * TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_SECOND, TIMEOUTS.ONE_HOUR),
    rateLimitMax: parseIntSafe(process.env.SERVER_RATE_MAX, 100, 1, LIMITS.MAX_RETRY_COUNT),
    jsonLimit: process.env.JSON_LIMIT || '10mb',
    compressionLevel: parseIntSafe(process.env.COMPRESSION_LEVEL, 6, 0, 9),
    compressionThreshold: parseIntSafe(process.env.COMPRESSION_THRESHOLD, 1024, 0, LIMITS.MAX_FILE_SIZE_MB),
    sessionMaxAge: parseIntSafe(process.env.SESSION_MAX_AGE, TIMEOUTS.ONE_HOUR, TIMEOUTS.ONE_MINUTE, TIMEOUTS.ONE_DAY),
    maxFileSize: parseIntSafe(process.env.MAX_FILE_SIZE, 100 * 1024 * 1024, 1024, 1024 * 1024 * 1024),
    maxFiles: parseIntSafe(process.env.MAX_FILES, 1, 1, 100),
    maxFilenameLength: parseIntSafe(process.env.MAX_FILENAME_LENGTH, 100, 1, LIMITS.MAX_STRING_LENGTH),
    staticMaxAge: process.env.STATIC_MAX_AGE || '1h',
    uploadsMaxAge: process.env.UPLOADS_MAX_AGE || '1d', }, };

export { config };
export default config;
