import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT
  })
});

const docClient = DynamoDBDocumentClient.from(client);

const connectDB = async () => {
  try {
    console.log('✅ DynamoDB Client initialized');
    return docClient;
  } catch (error) {
    console.error(`❌ DynamoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
export { docClient };
