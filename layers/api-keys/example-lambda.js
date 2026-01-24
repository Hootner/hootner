const { getAPIKeys, validateAPIKey } = require('api-key-manager');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  try {
    // Validate API key from request
    validateAPIKey(event);
    
    // Get secrets (JWT, Stripe, etc.)
    const secrets = await getAPIKeys();
    
    // Use DynamoDB
    const result = await dynamoClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { PK: 'VIDEO#123', SK: 'METADATA' }
    }));
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: error.message })
    };
  }
};
