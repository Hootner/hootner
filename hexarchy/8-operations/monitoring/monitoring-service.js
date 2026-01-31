import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import { RedisClientType, createClient } from 'redis'

export class MonitoringService {
  constructor() {
    this.cloudwatch = new CloudWatchClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
    this.redis = createClient({ 
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    this.metrics = new Map()
  }

  async initialize() {
    if (!process.env.REDIS_URL) {
      console.warn('Redis URL not configured, using in-memory cache')
      return
    }
    
    try {
      await this.redis.connect()
      this.startMetricsCollection()
    } catch (error) {
      console.error('Redis connection failed:', error)
    }
  }

  async trackAPIPerformance(endpoint, duration, statusCode) {
    const metric = {
      endpoint,
      duration,
      statusCode,
      timestamp: Date.now()
    }

    // Store in Redis for real-time access (if available)
    if (this.redis.isOpen) {
      try {
        await this.redis.lpush(`metrics:api:${endpoint}`, JSON.stringify(metric))
        await this.redis.expire(`metrics:api:${endpoint}`, 3600) // 1 hour TTL
      } catch (error) {
        console.warn('Redis storage failed, continuing without cache:', error.message)
      }
    }

    // Send to CloudWatch
    await this.sendToCloudWatch('API/Performance', [
      {
        MetricName: 'ResponseTime',
        Value: duration,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Endpoint', Value: endpoint },
          { Name: 'StatusCode', Value: statusCode.toString() }
        ]
      }
    ])
  }

  async trackVideoProcessing(videoId, stage, duration) {
    await this.sendToCloudWatch('Video/Processing', [
      {
        MetricName: 'ProcessingTime',
        Value: duration,
        Unit: 'Seconds',
        Dimensions: [
          { Name: 'VideoId', Value: videoId },
          { Name: 'Stage', Value: stage }
        ]
      }
    ])
  }

  async trackUserActivity(userId, action, metadata = {}) {
    await this.sendToCloudWatch('User/Activity', [
      {
        MetricName: 'UserActions',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'UserId', Value: userId },
          { Name: 'Action', Value: action }
        ]
      }
    ])

    // Store detailed activity in Redis (if available)
    if (this.redis.isOpen) {
      try {
        const activity = { userId, action, metadata, timestamp: Date.now() }
        await this.redis.lpush('user:activity', JSON.stringify(activity))
      } catch (error) {
        console.warn('Redis activity storage failed:', error.message)
      }
    }
  }

  async trackBusinessMetrics(metric, value, dimensions = {}) {
    const metricData = {
      MetricName: metric,
      Value: value,
      Unit: 'Count',
      Dimensions: Object.entries(dimensions).map(([name, value]) => ({
        Name: name,
        Value: value.toString()
      }))
    }

    await this.sendToCloudWatch('Business/Metrics', [metricData])
  }

  async getRealtimeMetrics(type, timeRange = '1h') {
    if (!this.redis.isOpen) {
      console.warn('Redis not available, returning empty metrics')
      return []
    }
    
    try {
      const keys = await this.redis.keys(`metrics:${type}:*`)
      const metrics = []

      for (const key of keys) {
        const data = await this.redis.lrange(key, 0, -1)
        metrics.push(...data.map(d => JSON.parse(d)))
      }

      return metrics.filter(m => 
        Date.now() - m.timestamp < this.parseTimeRange(timeRange)
      )
    } catch (error) {
      console.error('Failed to get realtime metrics:', error)
      return []
    }
  }

  async sendToCloudWatch(namespace, metricData) {
    try {
      await this.cloudwatch.send(new PutMetricDataCommand({
        Namespace: `HOOTNER/${namespace}`,
        MetricData: metricData.map(metric => ({
          ...metric,
          Timestamp: new Date()
        }))
      }))
    } catch (error) {
      console.error('Failed to send metrics to CloudWatch:', error)
    }
  }

  parseTimeRange(range) {
    const units = { m: 60000, h: 3600000, d: 86400000 }
    const match = range.match(/(\d+)([mhd])/)
    if (!match) return 3600000 // default 1 hour
    return parseInt(match[1]) * units[match[2]]
  }

  startMetricsCollection() {
    // Collect system metrics every minute
    setInterval(async () => {
      const memoryUsage = process.memoryUsage()
      
      await this.sendToCloudWatch('System/Resources', [
        {
          MetricName: 'MemoryUsage',
          Value: memoryUsage.heapUsed / 1024 / 1024,
          Unit: 'Megabytes'
        },
        {
          MetricName: 'MemoryTotal',
          Value: memoryUsage.heapTotal / 1024 / 1024,
          Unit: 'Megabytes'
        }
      ])
    }, 60000)
  }
}

export default new MonitoringService()