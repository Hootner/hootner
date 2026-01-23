import { v4 as uuidv4 } from 'uuid';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamoClient.js';

const contactKey = (id) => ({ PK: `CONTACT#${id}`, SK: 'META' });

async function createContact({ name, email, subject, message }) {
  const now = new Date().toISOString();
  const id = uuidv4();
  const item = {
    ...contactKey(id),
    entityType: 'CONTACT',
    contactId: id,
    name,
    email,
    subject,
    message,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function listContacts(limit = 50) {
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: { '#type': 'entityType' },
      ExpressionAttributeValues: { ':type': 'CONTACT' },
    })
  );
  return (res.Items || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export { createContact, listContacts };
