/**
 * Environment Variable Validation Utility
 * Validates required environment variables at startup
 */

/**
 * Validate a single environment variable
 * @param {string} name - Environment variable name
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether the variable is required
 * @param {string} options.defaultValue - Default value if not set
 * @param {number} options.minLength - Minimum length validation
 * @param {RegExp} options.pattern - Pattern to match
 * @param {Array<string>} options.allowedValues - Allowed values
 * @returns {string} - The validated value
 */
function validateEnvVar(name, options = {}) {
  const {
    required = false,
    defaultValue = null,
    minLength = 0,
    pattern = null,
    allowedValues = null,
  } = options;

  const value = process.env[name];

  // Check if required
  if (required && !value) {
    if (defaultValue !== null) {
      console.warn(`Warning: ${name} not set, using default value`);
      return defaultValue;
    }
    throw new Error(`Required environment variable ${name} is not set`);
  }

  // Return default if not set and not required
  if (!value) {
    return defaultValue;
  }

  // Validate minimum length
  if (minLength > 0 && value.length < minLength) {
    throw new Error(
      `Environment variable ${name} must be at least ${minLength} characters (current: ${value.length})`
    );
  }

  // Validate pattern
  if (pattern && !pattern.test(value)) {
    throw new Error(
      `Environment variable ${name} does not match required pattern`
    );
  }

  // Validate allowed values
  if (allowedValues && !allowedValues.includes(value)) {
    throw new Error(
      `Environment variable ${name} must be one of: ${allowedValues.join(', ')}`
    );
  }

  return value;
}

/**
 * Validate all required environment variables for the application
 * @param {string} context - Context name (e.g., 'server', 'api', 'worker')
 * @returns {Object} - Validated environment configuration
 */
function validateEnvironment(context = 'default') {
  const errors = [];
  const config = {};

  try {
    // Common variables for all contexts
    config.NODE_ENV = validateEnvVar('NODE_ENV', {
      defaultValue: 'development',
      allowedValues: ['development', 'test', 'staging', 'production'],
    });

    // Security variables
    try {
      config.JWT_SECRET = validateEnvVar('JWT_SECRET', {
        required: true,
        minLength: 32,
        defaultValue:
          config.NODE_ENV === 'production'
            ? null
            : 'dev-jwt-secret-minimum-32-characters-long',
      });
    } catch (err) {
      errors.push(err.message);
    }

    try {
      config.SESSION_SECRET = validateEnvVar('SESSION_SECRET', {
        required: true,
        minLength: 32,
        defaultValue:
          config.NODE_ENV === 'production'
            ? null
            : 'dev-session-secret-minimum-32-chars',
      });
    } catch (err) {
      errors.push(err.message);
    }

    // Context-specific validation
    if (context === 'api' || context === 'server') {
      // Database
      try {
        config.MONGODB_URI = validateEnvVar('MONGODB_URI', {
          required: true,
          defaultValue: 'mongodb://localhost:27017/hootner',
        });
      } catch (err) {
        errors.push(err.message);
      }

      try {
        config.REDIS_URL = validateEnvVar('REDIS_URL', {
          required: false,
          defaultValue: 'redis://localhost:6379',
        });
      } catch (err) {
        errors.push(err.message);
      }

      // API Configuration
      config.PORT = validateEnvVar('PORT', {
        defaultValue: '4000',
      });

      config.FRONTEND_URL = validateEnvVar('FRONTEND_URL', {
        defaultValue: 'http://localhost:3000',
      });

      // Internal service authentication
      config.INTERNAL_SERVICE_TOKEN = validateEnvVar('INTERNAL_SERVICE_TOKEN', {
        required: config.NODE_ENV === 'production',
        defaultValue: 'dev-token-change-in-production',
      });
    }

    if (context === 'payment' || context === 'api') {
      // Stripe (only required if payment features are enabled)
      if (process.env.ENABLE_PAYMENTS === 'true') {
        try {
          config.STRIPE_SECRET_KEY = validateEnvVar('STRIPE_SECRET_KEY', {
            required: true,
            pattern: /^sk_(test_|live_)/,
          });
        } catch (err) {
          errors.push(err.message);
        }

        try {
          config.STRIPE_WEBHOOK_SECRET = validateEnvVar(
            'STRIPE_WEBHOOK_SECRET',
            {
              required: true,
              pattern: /^whsec_/,
            }
          );
        } catch (err) {
          errors.push(err.message);
        }
      }
    }

    if (context === 'aws' || context === 'worker') {
      // AWS (optional, used for certain features)
      config.AWS_REGION = validateEnvVar('AWS_REGION', {
        defaultValue: 'us-east-1',
      });

      config.AWS_ACCESS_KEY_ID = validateEnvVar('AWS_ACCESS_KEY_ID', {
        required: false,
      });

      config.AWS_SECRET_ACCESS_KEY = validateEnvVar('AWS_SECRET_ACCESS_KEY', {
        required: false,
      });
    }

    // Report errors
    if (errors.length > 0) {
      console.error('\n❌ Environment validation errors:');
      errors.forEach((error) => console.error(`  - ${error}`));

      if (config.NODE_ENV === 'production') {
        throw new Error(
          `Environment validation failed with ${errors.length} error(s)`
        );
      } else {
        console.warn(
          '\n⚠️  Using default values for development. Set proper values in .env for production.\n'
        );
      }
    } else {
      console.log('✅ Environment validation passed');
    }

    return config;
  } catch (error) {
    console.error('❌ Critical environment validation error:', error.message);
    throw error;
  }
}

/**
 * Check if all required environment variables are set
 * @param {Array<string>} requiredVars - Array of required variable names
 * @returns {boolean} - True if all required vars are set
 */
function checkRequiredEnvVars(...requiredVars) {
  const missing = requiredVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
    return false;
  }

  return true;
}

/**
 * Get environment variable with fallback
 * @param {string} name - Environment variable name
 * @param {string} fallback - Fallback value
 * @returns {string} - The value or fallback
 */
function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

module.exports = {
  validateEnvVar,
  validateEnvironment,
  checkRequiredEnvVars,
  getEnv,
};
