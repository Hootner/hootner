import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE_NAME } from './dynamoClient.js'

const SUBSCRIPTION_LEVELS = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']
const ROLES = ['USER', 'CREATOR', 'MODERATOR', 'ADMIN']

const userKey = (userId) => ({ PK: `USER#${userId}`, SK: 'PROFILE' })

function normalizeUser(item) {
  if (!item) return null
  return {
    id: item.userId,
    userId: item.userId,
    email: item.email,
    name: item.name,
    avatar: item.avatar,
    subscription: item.subscription,
    role: item.role,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    passwordHash: item.passwordHash,
  }
}

async function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim()
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :type AND #email = :email',
      ExpressionAttributeNames: {
        '#type': 'entityType',
        '#email': 'email',
      },
      ExpressionAttributeValues: {
        ':type': 'USER',
        ':email': normalized,
      },
      Limit: 1,
    })
  )

  return normalizeUser((result.Items || [])[0])
}

async function getUserById(id) {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: userKey(id),
    })
  )
  return normalizeUser(res.Item)
}

async function listUsers(limit = 20, offset = 0) {
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: { '#type': 'entityType' },
      ExpressionAttributeValues: { ':type': 'USER' },
    })
  )

  const items = (res.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  return items.slice(offset, offset + limit).map(normalizeUser)
}

async function createUser(input) {
  const now = new Date().toISOString()
  const userId = uuidv4()
  const passwordHash = await bcrypt.hash(input.password, 10)

  const item = {
    ...userKey(userId),
    entityType: 'USER',
    userId,
    email: input.email.toLowerCase().trim(),
    name: input.name,
    avatar: input.avatar,
    subscription: SUBSCRIPTION_LEVELS.includes(input.subscription)
      ? input.subscription
      : 'FREE',
    role: ROLES.includes(input.role) ? input.role : 'USER',
    passwordHash,
    createdAt: now,
    updatedAt: now,
  }

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
  return normalizeUser(item)
}

async function comparePassword(user, candidatePassword) {
  if (!user?.passwordHash) return false
  return bcrypt.compare(candidatePassword, user.passwordHash)
}

export { findUserByEmail, getUserById, listUsers, createUser, comparePassword }
