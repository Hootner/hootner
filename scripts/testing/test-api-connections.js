import { docClient, TABLE_NAME } from './api/graphql/models/dynamoClient.js';
import { createClient } from 'redis';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

async function testDynamoDB() {
  try {
    await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      Limit: 1
    }));
    return { success: true, message: `Connected to DynamoDB table: ${TABLE_NAME}` };
  } catch (error) {
    return { success: false, message: `DynamoDB Error: ${error.message}` };
  }
}

async function testRedis() {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD
  });
  
  try {
    await client.connect();
    await client.ping();
    return { success: true, message: 'Redis connected successfully' };
  } catch (error) {
    return { success: false, message: `Redis Error: ${error.message}` };
  } finally {
    await client.disconnect().catch(() => {});
  }
}

async function testGraphQLAPI() {
  try {
    const response = await fetch('http://localhost:4000/health');
    if (response.ok) {
      return { success: true, message: 'GraphQL API is running' };
    }
    return { success: false, message: `GraphQL API returned status ${response.status}` };
  } catch (error) {
    return { success: false, message: `GraphQL API Error: ${error.message}` };
  }
}

async function testVideoGenAPI() {
  try {
    const response = await fetch('http://localhost:5003/health');
    if (response.ok) {
      return { success: true, message: 'Video Generation API is running' };
    }
    return { success: false, message: `Video Gen API returned status ${response.status}` };
  } catch (error) {
    return { success: false, message: `Video Gen API Error: ${error.message}` };
  }
}

console.log('🦉 HOOTNER - Testing API Connections\n');

const results = await Promise.all([
  testDynamoDB(),
  testRedis(),
  testGraphQLAPI(),
  testVideoGenAPI()
]);

const labels = ['DynamoDB', 'Redis', 'GraphQL API', 'Video Gen API'];

results.forEach((result, i) => {
  const icon = result.success ? '✅' : '❌';
  console.log(`${icon} ${labels[i]}: ${result.message}`);
});

const allPassed = results.every(r => r.success);
console.log(`\n${allPassed ? '✅ All connections successful' : '⚠️ Some connections failed'}`);
process.exit(allPassed ? 0 : 1);
