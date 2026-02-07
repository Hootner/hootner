import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import Stripe from 'stripe'

export class UsageTrackingService {
  constructor() {
    this.dynamodb = new DynamoDBClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
    this.stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
  }

  async trackUsage(userId, action, metadata = {}) {
    try {
      const usage = {
        userId: { S: userId },
        timestamp: { N: Date.now().toString() },
        action: { S: action },
        metadata: { S: JSON.stringify(metadata) }
      }

      await this.dynamodb.send(new PutItemCommand({
        TableName: process.env.USAGE_TABLE,
        Item: usage
      }))

      // Update Stripe usage
      await this.updateStripeUsage(userId, action)
    } catch (error) {
      console.error('Usage tracking failed:', error)
      throw error
    }
  }

  async updateStripeUsage(userId, action) {
    if (!this.stripe) {
      console.warn('Stripe not configured, skipping usage update')
      return null
    }
    
    try {
      const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(
        process.env.STRIPE_SUBSCRIPTION_ITEM_ID,
        {
          quantity: 1,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment'
        }
      )
      return usageRecord
    } catch (error) {
      console.error('Stripe usage update failed:', error)
      return null
    }
  }

  async getUsageStats(userId, timeRange = '24h') {
    const params = {
      TableName: process.env.USAGE_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId }
      }
    }

    const result = await this.dynamodb.send(new QueryCommand(params))
    return result.Items
  }
}

export default new UsageTrackingService()