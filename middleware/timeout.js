import { config } from '../config/app-config.js';
const { HTTP_STATUS } = require('../constants');

/**
 * Timeout middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _timeoutMiddleware = (timeoutMs = config.timeout.middleware) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        return res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({ error: 'Request timeout' });
      }
    }, timeoutMs);

    const cleanup = () => clearTimeout(timeout);
    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
  };
};
