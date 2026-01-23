#!/usr/bin/env node
/**
 * Initialize DynamoDB Local on startup
 * Waits for DynamoDB to be ready, then creates table
 */

const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { execSync } = require('child_process');

async function waitForDynamoDB() {
  const client = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' }
  });

  console.log('⏳ Waiting for DynamoDB Local...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await client.send(new ListTablesCommand({}));
      console.log('✅ DynamoDB Local is ready');
      return true;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.error('❌ DynamoDB Local failed to start');
  return false;
}

async function initializeDatabase() {
  const ready = await waitForDynamoDB();
  
  if (!ready) {
    process.exit(1);
  }

  console.log('🔧 Setting up DynamoDB table...');
  try {
    execSync('node scripts/setup-dynamodb.js', { stdio: 'inherit' });
    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
