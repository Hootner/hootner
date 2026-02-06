import { v4 as uuidv4 } from 'uuid'
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE_NAME } from './dynamoClient.js'

const conversationKey = (id) => ({ PK: `CONVO#${id}`, SK: 'META' })

async function createConversation({ participants, type = 'direct', name }) {
  const now = new Date().toISOString()
  const id = uuidv4()
  const item = {
    ...conversationKey(id),
    entityType: 'CONVERSATION',
    conversationId: id,
    participants,
    type,
    name,
    lastMessage: null,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
  }
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
  return item
}

async function getConversation(id) {
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: conversationKey(id) })
  )
  return res.Item || null
}

async function listConversations(userId, limit = 50) {
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: { '#type': 'entityType' },
      ExpressionAttributeValues: { ':type': 'CONVERSATION' },
    })
  )
  let items = res.Items || []
  if (userId) items = items.filter((c) => (c.participants || []).includes(userId))
  return items
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    .slice(0, limit)
}

async function updateLastMessage(conversationId, lastMessage) {
  const now = new Date().toISOString()
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: conversationKey(conversationId),
      UpdateExpression:
        'SET lastMessage = :msg, lastMessageAt = :now, updatedAt = :now',
      ExpressionAttributeValues: { ':msg': lastMessage, ':now': now },
    })
  )
}

export { createConversation, getConversation, listConversations, updateLastMessage }
