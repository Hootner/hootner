/**
 * API Keys Layer - Shared utilities for Lambda functions
 * Provides centralized access to secrets and API keys
 */

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get secret from AWS Secrets Manager with caching
 * @param {string} secretName - Name of the secret
 * @returns {Promise<object>} Parsed secret value
 */
async function getSecret(secretName) {
  const cached = secretsCache.get(secretName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'us-east-1'
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );

    const value = JSON.parse(response.SecretString);
    secretsCache.set(secretName, { value, timestamp: Date.now() });
    return value;
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Get API keys for the application
 * Falls back to environment variables for local development
 */
async function getAPIKeys() {
  if (process.env.NODE_ENV === 'development' || process.env.IS_OFFLINE) {
    return {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY
    };
  }

  const stackName = process.env.AWS_STACK_NAME || 'hootner';
  return getSecret(`${stackName}/api-keys`);
}

/**
 * Get JWT secret
 * Falls back to environment variable for local development
 */
async function getJWTSecret() {
  if (process.env.NODE_ENV === 'development' || process.env.IS_OFFLINE) {
    return process.env.JWT_SECRET || 'dev-secret-change-in-production';
  }

  const stackName = process.env.AWS_STACK_NAME || 'hootner';
  const secret = await getSecret(`${stackName}/jwt-secret`);
  return secret.secret;
}

module.exports = {
  getSecret,
  getAPIKeys,
  getJWTSecret
};
