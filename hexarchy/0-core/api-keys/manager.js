// API Key Management
import { generateToken, hash } from '../utils/crypto.js';
import { docClient } from '../database/dynamodb/config.js';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const API_KEYS_TABLE = process.env.API_KEYS_TABLE || 'ApiKeys';

export const createApiKey = async (userId, name, scopes = []) => {
  const apiKey = `hootner_${generateToken(32)}`;
  const hashedKey = hash(apiKey);

  const keyData = {
    id: hashedKey,
    userId,
    name,
    scopes,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    expiresAt: null, // null = never expires
    isActive: true,
    usageCount: 0
  };

  await docClient.send(new PutCommand({
    TableName: API_KEYS_TABLE,
    Item: keyData
  }));

  return { apiKey, ...keyData };
};

export const validateApiKey = async (apiKey) => {
  const hashedKey = hash(apiKey);

  try {
    const result = await docClient.send(new GetCommand({
      TableName: API_KEYS_TABLE,
      Key: { id: hashedKey }
    }));

    const keyData = result.Item;

    if (!keyData) {
      return { valid: false, reason: 'Invalid API key' };
    }

    if (!keyData.isActive) {
      return { valid: false, reason: 'API key is inactive' };
    }

    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
      return { valid: false, reason: 'API key has expired' };
    }

    // Update last used timestamp
    await docClient.send(new UpdateCommand({
      TableName: API_KEYS_TABLE,
      Key: { id: hashedKey },
      UpdateExpression: 'SET lastUsed = :now, usageCount = usageCount + :inc',
      ExpressionAttributeValues: {
        ':now': new Date().toISOString(),
        ':inc': 1
      }
    }));

    return { valid: true, keyData };
  } catch (error) {
    return { valid: false, reason: 'Validation failed' };
  }
};

export const revokeApiKey = async (apiKey) => {
  const hashedKey = hash(apiKey);

  await docClient.send(new UpdateCommand({
    TableName: API_KEYS_TABLE,
    Key: { id: hashedKey },
    UpdateExpression: 'SET isActive = :false',
    ExpressionAttributeValues: { ':false': false }
  }));
};

export const deleteApiKey = async (apiKey) => {
  const hashedKey = hash(apiKey);

  await docClient.send(new DeleteCommand({
    TableName: API_KEYS_TABLE,
    Key: { id: hashedKey }
  }));
};

// Middleware
export const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    return res.status(401).json({ error: validation.reason });
  }

  req.apiKey = validation.keyData;
  req.user = { id: validation.keyData.userId };
  next();
};

export default { createApiKey, validateApiKey, revokeApiKey, deleteApiKey, apiKeyAuth };
