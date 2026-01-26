/**
 * DynamoDB Helper Functions
 * Replaces MongoDB/Mongoose patterns with DynamoDB single-table design
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.IS_OFFLINE && {
    endpoint: 'http://localhost:8000'
  })
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'HootnerActivities';

/**
 * Create video record
 * @param {object} videoData - Video data
 * @returns {Promise<object>} Created video
 */
async function createVideo(videoData) {
  const videoId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  const video = {
    PK: `VIDEO#${videoId}`,
    SK: `METADATA`,
    GSI1PK: `USER#${videoData.userId}`,
    GSI1SK: `VIDEO#${timestamp}`,
    id: videoId,
    userId: videoData.userId,
    title: videoData.title,
    description: videoData.description || '',
    status: videoData.status || 'processing',
    visibility: videoData.visibility || 'private',
    sourceKey: videoData.sourceKey,
    thumbnailKey: videoData.thumbnailKey || null,
    duration: videoData.duration || 0,
    views: 0,
    likes: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    type: 'video'
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: video
  }));

  return video;
}

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<object|null>} Video or null
 */
async function getVideo(videoId) {
  const response = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `VIDEO#${videoId}`,
      SK: 'METADATA'
    }
  }));

  return response.Item || null;
}

/**
 * Get videos by user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<object>} Videos with pagination
 */
async function getVideosByUser(userId, options = {}) {
  const { limit = 20, lastKey } = options;

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`
    },
    Limit: limit,
    ScanIndexForward: false // Newest first
  };

  if (lastKey) {
    params.ExclusiveStartKey = lastKey;
  }

  const response = await docClient.send(new QueryCommand(params));

  return {
    items: response.Items || [],
    lastKey: response.LastEvaluatedKey,
    hasMore: !!response.LastEvaluatedKey
  };
}

/**
 * Update video
 * @param {string} videoId - Video ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated video
 */
async function updateVideo(videoId, updates) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    updateExpressions.push(`#field${index} = :val${index}`);
    expressionAttributeNames[`#field${index}`] = key;
    expressionAttributeValues[`:val${index}`] = updates[key];
  });

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = Date.now();

  const response = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `VIDEO#${videoId}`,
      SK: 'METADATA'
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }));

  return response.Attributes;
}

/**
 * Delete video
 * @param {string} videoId - Video ID
 */
async function deleteVideo(videoId) {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `VIDEO#${videoId}`,
      SK: 'METADATA'
    }
  }));
}

/**
 * Increment video views
 * @param {string} videoId - Video ID
 * @returns {Promise<number>} New view count
 */
async function incrementViews(videoId) {
  const response = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `VIDEO#${videoId}`,
      SK: 'METADATA'
    },
    UpdateExpression: 'ADD #views :inc SET #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#views': 'views',
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':updatedAt': Date.now()
    },
    ReturnValues: 'ALL_NEW'
  }));

  return response.Attributes.views;
}

/**
 * Search videos (simplified - in production use OpenSearch)
 * @param {string} searchTerm - Search term
 * @param {object} options - Query options
 * @returns {Promise<object>} Search results
 */
async function searchVideos(searchTerm, options = {}) {
  // Note: DynamoDB doesn't support full-text search
  // In production, use Amazon OpenSearch or Algolia
  // This is a simplified implementation scanning the table

  console.warn('searchVideos: Using table scan - not recommended for production');

  const { limit = 20 } = options;

  const response = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :type',
    FilterExpression: 'contains(#title, :search) OR contains(#description, :search)',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#description': 'description'
    },
    ExpressionAttributeValues: {
      ':type': 'VIDEO',
      ':search': searchTerm
    },
    Limit: limit
  }));

  return {
    items: response.Items || [],
    count: response.Items?.length || 0
  };
}

module.exports = {
  createVideo,
  getVideo,
  getVideosByUser,
  updateVideo,
  deleteVideo,
  incrementViews,
  searchVideos,
  docClient,
  TABLE_NAME
};
