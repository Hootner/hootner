const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'local',
  credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' }
});

const tables = [
  {
    TableName: 'hootner-users',
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'hootner-videos',
    KeySchema: [{ AttributeName: 'videoId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'videoId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'hootner-comments',
    KeySchema: [
      { AttributeName: 'videoId', KeyType: 'HASH' },
      { AttributeName: 'commentId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'videoId', AttributeType: 'S' },
      { AttributeName: 'commentId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function setupTables() {
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`✅ Created table: ${table.TableName}`);
    } catch (err) {
      if (err.name === 'ResourceInUseException') {
        console.log(`⚠️  Table exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating ${table.TableName}:`, err.message);
      }
    }
  }
}

setupTables();
