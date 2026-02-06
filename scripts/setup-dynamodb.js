const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local'
  }
});

const tableName = process.env.DYNAMODB_TABLE_NAME || 'hootner-dev';

const tableConfig = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' },
    { AttributeName: 'SK', KeyType: 'RANGE' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' },
    { AttributeName: 'SK', AttributeType: 'S' },
    { AttributeName: 'entityType', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EntityTypeIndex',
      KeySchema: [
        { AttributeName: 'entityType', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
  ],
  BillingMode: 'PROVISIONED',
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
};

async function setupTable() {
  try {
    const { TableNames } = await client.send(new ListTablesCommand({}));
    
    if (TableNames.includes(tableName)) {
      console.log(`✅ Table already exists: ${tableName}`);
      return;
    }

    await client.send(new CreateTableCommand(tableConfig));
    console.log(`✅ Created table: ${tableName}`);
    console.log('   Single-table design with PK/SK pattern');
    console.log('   Supports: Users, Videos, Comments, Playlists, etc.');
  } catch (err) {
    console.error('❌ Error setting up table:', err.message);
    process.exit(1);
  }
}

setupTable();
