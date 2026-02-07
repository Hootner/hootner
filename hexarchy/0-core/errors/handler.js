// Global Error Handler
import { AppError } from './custom-errors.js';
import { logger } from '../logging/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Default to 500 server error
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
      false
    );
  }

  // Log error
  if (!error.isOperational || error.statusCode >= 500) {
    logger.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      user: req.user?.id
    });
  }

  // Send error response
  const response = {
    status: 'error',
    statusCode: error.statusCode,
    message: error.message,
    timestamp: error.timestamp || new Date().toISOString()
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Include validation details if present
  if (error.details) {
    response.details = error.details;
  }

  res.status(error.statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Unhandled rejection handler
export const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
    // Optional: exit process in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

// Uncaught exception handler
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
    process.exit(1);
  });
};

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler
};
