import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

async function viewDatabase() {
  try {
    const { Items = [] } = await client.send(new ScanCommand({
      TableName: 'HootnerActivities',
      Limit: 50
    }));

    if (Items.length === 0) {
      console.log('📭 Database is empty');
      return;
    }

    console.log(`📊 Found ${Items.length} items:\n`);
    Items.forEach((item, i) => {
      const data = unmarshall(item);
      console.log(`${i + 1}. ${data.PK} | ${data.SK}`);
      console.log(JSON.stringify(data, null, 2));
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewDatabase();
