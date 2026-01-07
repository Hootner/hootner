const logger = require('../lib/logger');
const { HTTP_STATUS } = require('../constants');

/**
 * errorHandler error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  try {
    if (res.headersSent) {
      return next(err);
    }

    const logData = {
      error: err?.message || 'Unknown error',
      url: req.url,
      method: req.method,
      ip: req.ip
    };

    if (process.env.NODE_ENV === 'development') {
      logData.stack = err.stack;
    }

    logger.error('Error occurred', logData);

    const statusCode = err.status || err.statusCode || 500;
    const response = {
      error: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Unknown error'
    };

    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Error handler failed', { message: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * asyncHandler middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * safeHandler
 * @param {Function} fn - Function to wrap
 * @returns {Function} Safe wrapped function
 */
const safeHandler = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    logger.error('Safe handler error:', { message: error.message });
    throw new Error('Operation failed');
  }
};

module.exports = { errorHandler, asyncHandler, safeHandler };
