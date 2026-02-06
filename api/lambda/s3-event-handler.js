/**
 * Lambda Handler for S3 Upload Events
 * Triggered when files are uploaded to the upload bucket
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
}));

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

let secrets;

async function getSecrets() {
  if (secrets) return secrets;
  
  try {
    const response = await secretsClient.send(new GetSecretValueCommand({
      SecretId: process.env.API_SECRETS_ARN
    }));
    secrets = JSON.parse(response.SecretString);
    return secrets;
  } catch (error) {
    console.error('Failed to load secrets:', error);
    return {};
  }
}

export const handler = async (event, context) => {
  console.log('S3 Event received:', JSON.stringify(event, null, 2));

  try {
    await getSecrets();
    
    // Process each S3 record
    for (const record of event.Records || []) {
      const bucket = record.s3?.bucket?.name;
      const key = record.s3?.object?.key;
      
      if (bucket && key) {
        // Log to DynamoDB
        await dynamoClient.send(new PutCommand({
          TableName: process.env.TABLE_NAME,
          Item: {
            PK: `S3EVENT#${Date.now()}`,
            SK: `FILE#${key}`,
            bucket,
            key,
            eventName: record.eventName,
            timestamp: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
          }
        }));
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'S3 event processed successfully',
        processed: event.Records?.length || 0
      })
    };
  } catch (error) {
    console.error('Error processing S3 event:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing S3 event',
        error: error.message
      })
    };
  }
};
