import { v4 as uuidv4 } from 'uuid';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamoClient.js';

const productKey = (id) => ({ PK: `PRODUCT#${id}`, SK: 'META' });

async function createProduct(input) {
  const now = new Date().toISOString();
  const productId = uuidv4();
  const item = {
    ...productKey(productId),
    entityType: 'PRODUCT',
    productId,
    name: input.name,
    price: input.price,
    category: input.category,
    verified: Boolean(input.verified),
    description: input.description,
    icon: input.icon || '📦',
    thumbnail: input.thumbnail,
    preview: input.preview,
    rating: input.rating || 0,
    sales: input.sales || 0,
    sellerId: input.sellerId,
    active: input.active !== false,
    createdAt: now,
    updatedAt: now
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function listProducts(limit = 50) {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: '#type = :type',
    ExpressionAttributeNames: { '#type': 'entityType' },
    ExpressionAttributeValues: { ':type': 'PRODUCT' }
  }));
  return (res.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

export { createProduct, listProducts };
