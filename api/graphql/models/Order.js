import { v4 as uuidv4 } from 'uuid';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamoClient.js';

const orderKey = (id) => ({ PK: `ORDER#${id}`, SK: 'META' });

async function createOrder(input) {
  const now = new Date().toISOString();
  const orderId = uuidv4();
  const item = {
    ...orderKey(orderId),
    entityType: 'ORDER',
    orderId,
    userId: input.userId,
    items: input.items || [],
    total: input.total,
    status: input.status || 'pending',
    stripeSessionId: input.stripeSessionId,
    stripePaymentIntent: input.stripePaymentIntent,
    createdAt: now,
    updatedAt: now
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function listOrders(userId, limit = 50) {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: '#type = :type',
    ExpressionAttributeNames: { '#type': 'entityType' },
    ExpressionAttributeValues: { ':type': 'ORDER' }
  }));
  let items = res.Items || [];
  if (userId) items = items.filter(o => o.userId === userId);
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

export { createOrder, listOrders };
