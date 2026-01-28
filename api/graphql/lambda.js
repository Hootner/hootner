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
    console.error('Failed to load secrets:', error);
    // Use fallback values for development
    secrets = {
      JWT_SECRET: 'fallback-jwt-secret',
      STRIPE_SECRET_KEY: 'sk_test_fallback',
      ENCRYPTION_KEY: 'fallback-encryption-key'
    };
    return secrets;
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
