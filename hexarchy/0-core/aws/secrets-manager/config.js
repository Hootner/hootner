// AWS Secrets Manager Configuration
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Cache for secrets
const secretsCache = new Map();

export const getSecret = async (secretName) => {
  // Check cache first
  if (secretsCache.has(secretName)) {
    return secretsCache.get(secretName);
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName
    });

    const response = await secretsClient.send(command);
    const secret = response.SecretString ? JSON.parse(response.SecretString) : response.SecretBinary;

    // Cache the secret
    secretsCache.set(secretName, secret);

    console.log(`✅ Secret retrieved: ${secretName}`);
    return secret;
  } catch (error) {
    console.error(`❌ Failed to retrieve secret: ${secretName}`, error);
    throw error;
  }
};

// Clear cache (useful for rotation)
export const clearSecretCache = (secretName) => {
  if (secretName) {
    secretsCache.delete(secretName);
  } else {
    secretsCache.clear();
  }
};

export const secretNames = {
  databaseCredentials: process.env.SECRET_DATABASE || 'hootner/database',
  apiKeys: process.env.SECRET_API_KEYS || 'hootner/api-keys',
  stripeKeys: process.env.SECRET_STRIPE || 'hootner/stripe',
  firebaseConfig: process.env.SECRET_FIREBASE || 'hootner/firebase'
};

export { secretsClient };
export default { getSecret, clearSecretCache, secretNames };
