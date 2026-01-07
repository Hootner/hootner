import { rateLimiters } from './rate-limiter.js';

export const applyRateLimits = (app) => {
  app.use('/api/auth', rateLimiters.auth);
  app.use('/api/payment', rateLimiters.payment);
  app.use('/api/security', rateLimiters.security);
  app.use('/api/audit', rateLimiters.audit);
  app.use('/api/analytics', rateLimiters.analytics);
};
