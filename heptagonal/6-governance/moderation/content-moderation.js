import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION })

export const handler = async (event) => {
  try {
    const { content, userId, contentType = 'text' } = JSON.parse(event.body || '{}')
    
    const moderationResult = await moderateContent(content, contentType)
    
    // Store moderation result
    await dynamodb.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        PK: { S: `MODERATION#${Date.now()}` },
        SK: { S: userId || 'anonymous' },
        content: { S: content.substring(0, 1000) }, // Truncate for storage
        contentType: { S: contentType },
        result: { S: JSON.stringify(moderationResult) },
        timestamp: { N: Date.now().toString() }
      }
    }))
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        moderation: moderationResult
      })
    }
  } catch (error) {
    console.error('Content moderation error:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}

async function moderateContent(content, contentType) {
  const flags = []
  let severity = 'LOW'
  
  // Basic text moderation
  if (contentType === 'text') {
    const profanityPatterns = [
      /\b(spam|scam|fraud)\b/gi,
      /\b(hate|violence|threat)\b/gi
    ]
    
    profanityPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        flags.push('INAPPROPRIATE_CONTENT')
        severity = 'HIGH'
      }
    })
    
    // Check for personal information
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(content)) { // SSN pattern
      flags.push('PERSONAL_INFO')
      severity = 'MEDIUM'
    }
  }
  
  return {
    approved: flags.length === 0,
    flags,
    severity,
    confidence: 0.85,
    timestamp: new Date().toISOString()
  }
}