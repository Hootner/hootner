import { randomUUID } from 'crypto';

/**
 * Correlation ID middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};

/**
 * Get correlation ID from request
 * @param {Object} req - Express request
 * @returns {string} Correlation ID
 */
export const _getCorrelationId = (req) => {
  return req?.correlationId || 'unknown';
};
