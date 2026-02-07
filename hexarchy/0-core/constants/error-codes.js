// Application Error Codes
export const ERROR_CODES = {
  // Authentication Errors (1xxx)
  AUTH_TOKEN_MISSING: 1001,
  AUTH_TOKEN_INVALID: 1002,
  AUTH_TOKEN_EXPIRED: 1003,
  AUTH_CREDENTIALS_INVALID: 1004,
  AUTH_SESSION_EXPIRED: 1005,

  // Authorization Errors (2xxx)
  AUTHZ_INSUFFICIENT_PERMISSIONS: 2001,
  AUTHZ_RESOURCE_FORBIDDEN: 2002,
  AUTHZ_OWNER_ONLY: 2003,

  // Validation Errors (3xxx)
  VALIDATION_FAILED: 3001,
  VALIDATION_REQUIRED_FIELD: 3002,
  VALIDATION_INVALID_FORMAT: 3003,
  VALIDATION_OUT_OF_RANGE: 3004,

  // Resource Errors (4xxx)
  RESOURCE_NOT_FOUND: 4001,
  RESOURCE_ALREADY_EXISTS: 4002,
  RESOURCE_DELETED: 4003,
  RESOURCE_LOCKED: 4004,

  // Upload Errors (5xxx)
  UPLOAD_FILE_TOO_LARGE: 5001,
  UPLOAD_INVALID_TYPE: 5002,
  UPLOAD_PROCESSING_FAILED: 5003,

  // Payment Errors (6xxx)
  PAYMENT_FAILED: 6001,
  PAYMENT_CARD_DECLINED: 6002,
  PAYMENT_INSUFFICIENT_FUNDS: 6003,
  PAYMENT_EXPIRED: 6004,

  // Rate Limit Errors (7xxx)
  RATE_LIMIT_EXCEEDED: 7001,
  QUOTA_EXCEEDED: 7002,

  // External Service Errors (8xxx)
  SERVICE_AWS_ERROR: 8001,
  SERVICE_STRIPE_ERROR: 8002,
  SERVICE_FIREBASE_ERROR: 8003,

  // System Errors (9xxx)
  SYSTEM_DATABASE_ERROR: 9001,
  SYSTEM_CACHE_ERROR: 9002,
  SYSTEM_NETWORK_ERROR: 9003,
  SYSTEM_UNKNOWN_ERROR: 9999
};

export const getErrorMessage = (code) => {
  const messages = {
    [ERROR_CODES.AUTH_TOKEN_MISSING]: 'Authentication token is missing',
    [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Authentication token is invalid',
    [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired',
    [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
    [ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed'
  };
  return messages[code] || 'An error occurred';
};

export default ERROR_CODES;
