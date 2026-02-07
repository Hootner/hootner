import { v4 as uuidv4 } from 'uuid'
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE_NAME } from './dynamoClient.js'

const STATUSES = ['UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED']
const VISIBILITY = ['PUBLIC', 'UNLISTED', 'PRIVATE']

const videoKey = (videoId) => ({ PK: `VIDEO#${videoId}`, SK: 'META' })

function normalizeVideo(item) {
  if (!item) return null
  return {
    id: item.videoId,
    videoId: item.videoId,
    title: item.title,
    description: item.description,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    duration: item.duration || 0,
    status: item.status,
    visibility: item.visibility,
    views: item.views || 0,
    likes: item.likes || [],
    comments: item.comments || [],
    userId: item.userId,
    resolution: item.resolution,
    format: item.format,
    size: item.size,
    metadata: item.metadata,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

async function createVideo({
  title,
  description,
  url,
  thumbnailUrl,
  userId,
  resolution,
  format,
  size,
  metadata,
}) {
  const now = new Date().toISOString()
  const videoId = uuidv4()
  const item = {
    ...videoKey(videoId),
    entityType: 'VIDEO',
    videoId,
    title,
    description,
    url,
    thumbnailUrl,
    duration: 0,
    status: 'UPLOADING',
    visibility: 'PUBLIC',
    views: 0,
    likes: [],
    comments: [],
    userId,
    resolution,
    format,
    size,
    metadata,
    createdAt: now,
    updatedAt: now,
  }

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
  return normalizeVideo(item)
}

async function getVideoById(id) {
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: videoKey(id) })
  )
  return normalizeVideo(res.Item)
}

async function listVideos(filter = {}, limit = 20, offset = 0) {
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: { '#type': 'entityType' },
      ExpressionAttributeValues: { ':type': 'VIDEO' },
    })
  )

  let items = res.Items || []
  if (filter.status) items = items.filter((v) => v.status === filter.status)
  if (filter.visibility) items = items.filter((v) => v.visibility === filter.visibility)
  if (filter.userId) items = items.filter((v) => v.userId === filter.userId)
  if (filter.search) {
    const term = filter.search.toLowerCase()
    items = items.filter(
      (v) =>
        (v.title || '').toLowerCase().includes(term) ||
        (v.description || '').toLowerCase().includes(term)
    )
  }

  items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const slice = items.slice(offset, offset + limit)
  return {
    items: slice.map(normalizeVideo),
    totalCount: items.length,
  }
}

async function trendingVideos(limit = 10) {
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :type AND #visibility = :vis AND #status = :ready',
      ExpressionAttributeNames: {
        '#type': 'entityType',
        '#visibility': 'visibility',
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':type': 'VIDEO',
        ':vis': 'PUBLIC',
        ':ready': 'READY',
      },
    })
  )

  const items = (res.Items || [])
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit)
  return items.map(normalizeVideo)
}

async function incrementViews(id) {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: videoKey(id),
      UpdateExpression:
        'SET views = if_not_exists(views, :zero) + :one, updatedAt = :now',
      ExpressionAttributeValues: {
        ':one': 1,
        ':zero': 0,
        ':now': new Date().toISOString(),
      },
    })
  )
}

async function updateVideo(id, input) {
  const current = await getVideoById(id)
  if (!current) return null

  const next = {
    ...current,
    ...input,
    status:
      input.status && STATUSES.includes(input.status) ? input.status : current.status,
    visibility:
      input.visibility && VISIBILITY.includes(input.visibility)
        ? input.visibility
        : current.visibility,
    updatedAt: new Date().toISOString(),
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...videoKey(id), ...next, entityType: 'VIDEO' },
    })
  )
  return normalizeVideo(next)
}

async function deleteVideo(id) {
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: videoKey(id) }))
  return true
}

async function toggleLike(videoId, userId) {
  const video = await getVideoById(videoId)
  if (!video) return null
  const likes = video.likes || []
  const idx = likes.indexOf(userId)
  if (idx > -1) likes.splice(idx, 1)
  else likes.push(userId)
  video.likes = likes
  video.updatedAt = new Date().toISOString()
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...videoKey(videoId), ...video, entityType: 'VIDEO' },
    })
  )
  return normalizeVideo(video)
}

async function addComment(videoId, userId, text) {
  const video = await getVideoById(videoId)
  if (!video) return null
  const comments = video.comments || []
  const comment = { id: uuidv4(), userId, text, createdAt: new Date().toISOString() }
  comments.push(comment)
  video.comments = comments
  video.updatedAt = new Date().toISOString()
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...videoKey(videoId), ...video, entityType: 'VIDEO' },
    })
  )
  return { video: normalizeVideo(video), comment }
}

async function deleteComment(videoId, commentId, requestingUserId, isAdmin = false) {
  const video = await getVideoById(videoId)
  if (!video) return null
  const comments = video.comments || []
  const comment = comments.find((c) => c.id === commentId)
  if (!comment) return null
  if (comment.userId !== requestingUserId && !isAdmin) return null
  video.comments = comments.filter((c) => c.id !== commentId)
  video.updatedAt = new Date().toISOString()
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...videoKey(videoId), ...video, entityType: 'VIDEO' },
    })
  )
  return normalizeVideo(video)
}

export {
  createVideo,
  getVideoById,
  listVideos,
  trendingVideos,
  incrementViews,
  updateVideo,
  deleteVideo,
  toggleLike,
  addComment,
  deleteComment,
}
