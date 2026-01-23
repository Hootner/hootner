import { v4 as uuidv4 } from 'uuid';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamoClient.js';

const messageKey = (conversationId, messageId) => ({ PK: `CONVO#${conversationId}`, SK: `MSG#${messageId}` });

async function createMessage({ conversationId, senderId, text, type = 'text' }) {
  const now = new Date().toISOString();
  const messageId = uuidv4();
  const item = {
    ...messageKey(conversationId, messageId),
    entityType: 'MESSAGE',
    messageId,
    conversationId,
    senderId,
    text,
    type,
    readBy: [],
    edited: false,
    createdAt: now,
    updatedAt: now
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function listMessages(conversationId, limit = 100) {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: '#type = :type AND begins_with(#pk, :pk)',
    ExpressionAttributeNames: { '#type': 'entityType', '#pk': 'PK' },
    ExpressionAttributeValues: { ':type': 'MESSAGE', ':pk': `CONVO#${conversationId}` }
  }));
  return (res.Items || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-limit);
}

export { createMessage, listMessages };