import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.DYNAMO_TABLE || 'HootnerActivities';
const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT || undefined;

const dynamoClient = new DynamoDBClient({
  region: REGION,
  endpoint: DYNAMO_ENDPOINT || undefined
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true }
});

export { docClient, TABLE_NAME, REGION, DYNAMO_ENDPOINT };
