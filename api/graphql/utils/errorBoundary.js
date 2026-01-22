/**
 * Error Boundary Utility
 * Comprehensive error handling for GraphQL resolvers
 *
 * Author: HOOTNER Code Guardian
 */

const { ApolloError, UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server-express');

/**
 * Error codes for different error types
 */
const ErrorCodes = {
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    BAD_USER_INPUT: 'BAD_USER_INPUT',
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
};

/**
 * Custom error class for application errors
 */
class AppError extends ApolloError {
    constructor(message, code, extensions = {}) {
        super(message, code, extensions);
        this.name = 'AppError';
    }
}

/**
 * Wrap a resolver with error boundary
 * @param {function} resolver - Resolver function
 * @param {string} resolverName - Name of the resolver (for logging)
 * @returns {function} Wrapped resolver
 */
function withErrorBoundary(resolver, resolverName = 'Unknown') {
    return async (...args) => {
        try {
            return await resolver(...args);
        } catch (error) {
            return handleResolverError(error, resolverName, args);
        }
    };
}

/**
 * Wrap all resolvers in an object with error boundaries
 * @param {object} resolvers - Object containing resolver functions
 * @param {string} category - Category name (Query, Mutation, etc.)
 * @returns {object} Wrapped resolvers
 */
function wrapResolvers(resolvers, category = 'Resolver') {
    const wrappedResolvers = {};

    for (const [key, resolver] of Object.entries(resolvers)) {
        if (typeof resolver === 'function') {
            wrappedResolvers[key] = async (...args) => {
                try {
                    return await resolver(...args);
                } catch (error) {
                    return handleResolverError(error, `${category}.${key}`, args);
                }
            };
        } else {
            wrappedResolvers[key] = resolver;
        }
    }

    return wrappedResolvers;
}

/**
 * Handle resolver errors with proper logging and formatting
 * @param {Error} error - Original error
 * @param {string} resolverName - Name of the resolver
 * @param {Array} args - Resolver arguments
 * @throws {ApolloError} Formatted error
 */
function handleResolverError(error, resolverName, args) {
    // Log error details
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ Error in resolver: ${resolverName}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('Type:', error.constructor.name);
    console.error('Timestamp:', new Date().toISOString());

    if (args[1]) {
        const sanitizedArgs = JSON.stringify(args[1], null, 2);
        console.error('Arguments:', sanitizedArgs);
    }

    if (error.stack) {
        const sanitizedStack = error.stack.replace(/[^\w\s\n\r\t\-.()\[\]{}:;,/\\]/g, '');
        console.error('Stack:', sanitizedStack);
    }

    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Re-throw known Apollo errors
    if (error instanceof AuthenticationError) {
        throw error;
    }

    if (error instanceof ForbiddenError) {
        throw error;
    }

    if (error instanceof UserInputError) {
        throw error;
    }

    if (error instanceof ApolloError) {
        throw error;
    }

    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
        throw new AppError(
            'External service unavailable',
            ErrorCodes.EXTERNAL_SERVICE_ERROR,
            {
                service: error.address,
                resolver: resolverName,
            }
        );
    }

    if (error.code === 'ETIMEDOUT') {
        throw new AppError(
            'Operation timed out',
            ErrorCodes.TIMEOUT,
            {
                resolver: resolverName,
            }
        );
    }

    if (error.name === 'ValidationError') {
        throw new UserInputError('Validation failed', {
            validationErrors: error.errors,
            resolver: resolverName,
        });
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
        throw new AppError(
            'Database operation failed',
            ErrorCodes.DATABASE_ERROR,
            {
                resolver: resolverName,
                originalError: error.message,
            }
        );
    }

    // Default: Internal server error
    throw new AppError(
        'An unexpected error occurred',
        ErrorCodes.INTERNAL_SERVER_ERROR,
        {
            resolver: resolverName,
            originalError: process.env.NODE_ENV === 'development' ? error.message : undefined,
        }
    );
}

/**
 * Format error for GraphQL response
 * @param {Error} error - Error object
 * @returns {object} Formatted error
 */
function formatError(error) {
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
        if (error.extensions?.code === ErrorCodes.INTERNAL_SERVER_ERROR) {
            return {
                message: 'An unexpected error occurred',
                extensions: {
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                },
            };
        }
    }

    return {
        message: error.message,
        extensions: {
            code: error.extensions?.code || 'UNKNOWN_ERROR',
            ...error.extensions,
        },
        locations: error.locations,
        path: error.path,
    };
}

/**
 * Validation helper - throws UserInputError if validation fails
 * @param {boolean} condition - Validation condition
 * @param {string} message - Error message
 * @param {string} field - Field name
 */
function validate(condition, message, field = null) {
    if (!condition) {
        throw new UserInputError(message, {
            validationErrors: field ? [{ field, message }] : [],
        });
    }
}

/**
 * Async error wrapper for try-catch
 * @param {function} fn - Async function
 * @returns {Promise<[Error|null, any]>} [error, result] tuple
 */
async function asyncTryCatch(fn) {
    try {
        const result = await fn();
        return [null, result];
    } catch (error) {
        return [error, null];
    }
}

/**
 * Rate limiting helper
 * @param {string} key - Rate limit key (e.g., user ID, IP)
 * @param {number} limit - Max requests
 * @param {number} window - Time window in seconds
 */
const rateLimitCache = new Map();

function checkRateLimit(key, limit = 100, window = 60) {
    const now = Date.now();
    const windowMs = window * 1000;

    if (!rateLimitCache.has(key)) {
        rateLimitCache.set(key, [now]);
        return true;
    }

    const requests = rateLimitCache.get(key).filter(time => now - time < windowMs);

    if (requests.length >= limit) {
        throw new AppError(
            `Rate limit exceeded. Maximum ${limit} requests per ${window} seconds`,
            ErrorCodes.RATE_LIMIT_EXCEEDED,
            {
                limit,
                window,
                retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000),
            }
        );
    }

    requests.push(now);
    rateLimitCache.set(key, requests);

    return true;
}

// Cleanup rate limit cache every minute
setInterval(() => {
    const now = Date.now();
    const maxAge = 60 * 1000;

    for (const [key, requests] of rateLimitCache.entries()) {
        const validRequests = requests.filter(time => now - time < maxAge);

        if (validRequests.length === 0) {
            rateLimitCache.delete(key);
        } else {
            rateLimitCache.set(key, validRequests);
        }
    }
}, 60000);

module.exports = {
    ErrorCodes,
    AppError,
    withErrorBoundary,
    wrapResolvers,
    handleResolverError,
    formatError,
    validate,
    asyncTryCatch,
    checkRateLimit,
};
