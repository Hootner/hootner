// Lambda handler for GraphQL API (ESM)
import serverless from 'serverless-http';
import { app, initializeApp } from './server.js';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let cachedHandler;
let secrets;

// Load secrets from AWS Secrets Manager
async function loadSecrets() {
  if (secrets) return secrets;
  
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  
  try {
    const response = await client.send(new GetSecretValueCommand({
      SecretId: process.env.API_SECRETS_ARN
    }));
    
    secrets = JSON.parse(response.SecretString);
    
    // Set environment variables from secrets
    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.STRIPE_SECRET_KEY = secrets.STRIPE_SECRET_KEY;
    process.env.ENCRYPTION_KEY = secrets.ENCRYPTION_KEY;
    
    return secrets;
  } catch (error) {
    console.error('Failed to load secrets from AWS Secrets Manager:', error);
    // In production, secrets are required
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Failed to load required secrets from AWS Secrets Manager');
    }
    // Development: Check required environment variables
    const missingVars = [];
    if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
    if (!process.env.STRIPE_SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
    
    if (missingVars.length > 0) {
      throw new Error(`Required environment variables not set: ${missingVars.join(', ')}`);
    }
    console.warn('Using secrets from environment variables (development mode)');
    return null;
  }
}

export const handler = async (event, context) => {
  if (!cachedHandler) {
    await loadSecrets();
    await initializeApp();
    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};
