/**
 * Graceful Degradation Middleware
 * Provides fallback mechanisms when services fail
 * 
 * Author: HOOTNER Security Team
 */

/**
 * Service health status tracker
 */
const serviceHealth = new Map();

/**
 * Circuit breaker for service protection
 */
class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minute
    this.failures = 0;
    this.successes = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(operation, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        console.warn(`Circuit breaker OPEN for ${this.service}, using fallback`);
        return fallback();
      }
      // Try half-open state
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      console.error(`Service ${this.service} failed:`, error.message);
      return fallback();
    }
  }

  onSuccess() {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successes = 0;
        console.log(`Circuit breaker CLOSED for ${this.service}`);
      }
    }

    serviceHealth.set(this.service, {
      status: 'healthy',
      lastCheck: Date.now(),
      failures: this.failures
    });
  }

  onFailure() {
    this.failures++;
    this.successes = 0;

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.error(`Circuit breaker OPEN for ${this.service} until ${new Date(this.nextAttempt).toISOString()}`);
    }

    serviceHealth.set(this.service, {
      status: this.state === 'OPEN' ? 'degraded' : 'unhealthy',
      lastCheck: Date.now(),
      failures: this.failures
    });
  }
}

/**
 * Circuit breakers for different services
 */
const circuitBreakers = {
  database: new CircuitBreaker('database', { failureThreshold: 3 }),
  redis: new CircuitBreaker('redis', { failureThreshold: 3 }),
  stripe: new CircuitBreaker('stripe', { failureThreshold: 5 }),
  s3: new CircuitBreaker('s3', { failureThreshold: 5 }),
  ai: new CircuitBreaker('ai', { failureThreshold: 5 }),
};

/**
 * Wrap database calls with graceful degradation
 */
export async function withDatabaseFallback(operation, fallback = () => []) {
  return circuitBreakers.database.execute(operation, fallback);
}

/**
 * Wrap Redis calls with graceful degradation
 */
export async function withRedisFallback(operation, fallback = () => null) {
  return circuitBreakers.redis.execute(operation, fallback);
}

/**
 * Wrap Stripe calls with graceful degradation
 */
export async function withStripeFallback(operation, fallback = () => ({ success: false, error: 'Payment service temporarily unavailable' })) {
  return circuitBreakers.stripe.execute(operation, fallback);
}

/**
 * Wrap S3 calls with graceful degradation
 */
export async function withS3Fallback(operation, fallback = () => null) {
  return circuitBreakers.s3.execute(operation, fallback);
}

/**
 * Wrap AI service calls with graceful degradation
 */
export async function withAIFallback(operation, fallback = () => ({ success: false, error: 'AI service temporarily unavailable' })) {
  return circuitBreakers.ai.execute(operation, fallback);
}

/**
 * Get service health status
 */
export function getServiceHealth() {
  const health = {};
  for (const [service, status] of serviceHealth.entries()) {
    health[service] = status;
  }
  return health;
}

/**
 * Express middleware for graceful error handling
 */
export function gracefulErrorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Determine error type and provide appropriate fallback
  if (err.name === 'DatabaseError' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'We are experiencing technical difficulties. Please try again in a few moments.',
      retryAfter: 60
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details || err.message
    });
  }

  if (err.name === 'AuthenticationError' || err.statusCode === 401) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to continue'
    });
  }

  if (err.name === 'ForbiddenError' || err.statusCode === 403) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this resource'
    });
  }

  if (err.statusCode === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later',
      retryAfter: 60
    });
  }

  // Generic error fallback
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.'
      : err.message
  });
}

/**
 * Timeout wrapper for operations
 */
export async function withTimeout(operation, timeoutMs = 30000, fallback = () => null) {
  return Promise.race([
    operation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]).catch(error => {
    console.error('Operation timed out or failed:', error.message);
    return fallback();
  });
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry(operation, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 10000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default {
  withDatabaseFallback,
  withRedisFallback,
  withStripeFallback,
  withS3Fallback,
  withAIFallback,
  gracefulErrorHandler,
  withTimeout,
  withRetry,
  getServiceHealth,
  circuitBreakers
};
