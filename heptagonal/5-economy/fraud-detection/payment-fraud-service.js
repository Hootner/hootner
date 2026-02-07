import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

export class PaymentFraudDetectionService {
  constructor() {
    this.dynamodb = new DynamoDBClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
    this.sns = new SNSClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
    this.riskThresholds = {
      velocity: 5, // max transactions per hour
      amount: 1000, // max amount in USD
      geographic: true // flag geographic anomalies
    }
  }

  async analyzeTransaction(transaction) {
    const riskScore = await this.calculateRiskScore(transaction)
    const fraudIndicators = await this.detectFraudPatterns(transaction)
    
    const analysis = {
      transactionId: transaction.id,
      customerId: transaction.customer,
      riskScore,
      fraudIndicators,
      recommendation: this.getRecommendation(riskScore, fraudIndicators),
      timestamp: new Date().toISOString()
    }

    // Store analysis
    await this.storeAnalysis(analysis)

    // Alert if high risk
    if (riskScore > 70 || fraudIndicators.length > 2) {
      await this.alertFraudTeam(analysis)
    }

    return analysis
  }

  async calculateRiskScore(transaction) {
    let score = 0

    // Velocity check
    const recentTransactions = await this.getRecentTransactions(
      transaction.customer, 
      '1h'
    )
    if (recentTransactions.length > this.riskThresholds.velocity) {
      score += 30
    }

    // Amount check
    if (transaction.amount > this.riskThresholds.amount * 100) { // Stripe uses cents
      score += 25
    }

    // Geographic check
    const geoRisk = await this.checkGeographicAnomaly(transaction)
    score += geoRisk

    // Payment method risk
    const paymentRisk = this.assessPaymentMethodRisk(transaction.payment_method)
    score += paymentRisk

    return Math.min(score, 100)
  }

  async detectFraudPatterns(transaction) {
    const indicators = []

    // Check for card testing
    if (await this.isCardTesting(transaction)) {
      indicators.push('CARD_TESTING')
    }

    // Check for unusual spending patterns
    if (await this.hasUnusualSpendingPattern(transaction)) {
      indicators.push('UNUSUAL_SPENDING')
    }

    // Check for suspicious email patterns
    if (this.hasSuspiciousEmail(transaction.receipt_email)) {
      indicators.push('SUSPICIOUS_EMAIL')
    }

    // Check for BIN attacks
    if (await this.isBINAttack(transaction)) {
      indicators.push('BIN_ATTACK')
    }

    return indicators
  }

  async getRecentTransactions(customerId, timeRange) {
    const params = {
      TableName: process.env.TRANSACTIONS_TABLE,
      IndexName: 'customer-timestamp-index',
      KeyConditionExpression: 'customerId = :customerId AND #ts > :timestamp',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':customerId': { S: customerId },
        ':timestamp': { N: (Date.now() - this.parseTimeRange(timeRange)).toString() }
      }
    }

    const result = await this.dynamodb.send(new QueryCommand(params))
    return result.Items || []
  }

  async checkGeographicAnomaly(transaction) {
    // Get customer's typical locations
    const customerLocations = await this.getCustomerLocations(transaction.customer)
    
    if (customerLocations.length === 0) return 0

    const currentCountry = transaction.billing_details?.address?.country
    const typicalCountries = customerLocations.map(l => l.country)

    if (currentCountry && !typicalCountries.includes(currentCountry)) {
      return 20 // Geographic anomaly
    }

    return 0
  }

  assessPaymentMethodRisk(paymentMethod) {
    if (!paymentMethod) return 10

    // Higher risk for certain card types or funding sources
    if (paymentMethod.type === 'card') {
      if (paymentMethod.card.funding === 'prepaid') return 15
      if (paymentMethod.card.country !== 'US') return 10
    }

    return 0
  }

  async isCardTesting(transaction) {
    // Check for multiple small transactions in short time
    const recentSmallTransactions = await this.getRecentTransactions(
      transaction.customer, 
      '10m'
    )

    return recentSmallTransactions.filter(t => 
      JSON.parse(t.amount.S) < 100 // Less than $1
    ).length > 3
  }

  async hasUnusualSpendingPattern(transaction) {
    const customerHistory = await this.getCustomerTransactionHistory(transaction.customer)
    
    if (customerHistory.length < 3) return false

    const avgAmount = customerHistory.reduce((sum, t) => 
      sum + JSON.parse(t.amount.S), 0
    ) / customerHistory.length

    // Flag if transaction is 5x the average
    return transaction.amount > avgAmount * 5
  }

  hasSuspiciousEmail(email) {
    if (!email) return false

    const suspiciousPatterns = [
      /\d{10,}@/, // Long number sequences
      /@(tempmail|guerrillamail|10minutemail)/, // Temporary email services
      /[a-z]{20,}@/ // Very long random strings
    ]

    return suspiciousPatterns.some(pattern => pattern.test(email))
  }

  async isBINAttack(transaction) {
    // Check for multiple transactions with same BIN but different last 4 digits
    const bin = transaction.payment_method?.card?.last4?.substring(0, 6)
    if (!bin) return false

    const recentBINTransactions = await this.getTransactionsByBIN(bin, '1h')
    return recentBINTransactions.length > 10
  }

  getRecommendation(riskScore, fraudIndicators) {
    if (riskScore > 80 || fraudIndicators.includes('CARD_TESTING')) {
      return 'BLOCK'
    } else if (riskScore > 50 || fraudIndicators.length > 1) {
      return 'REVIEW'
    } else if (riskScore > 30) {
      return 'MONITOR'
    }
    return 'APPROVE'
  }

  async storeAnalysis(analysis) {
    const item = {
      transactionId: { S: analysis.transactionId },
      customerId: { S: analysis.customerId },
      riskScore: { N: analysis.riskScore.toString() },
      fraudIndicators: { SS: analysis.fraudIndicators },
      recommendation: { S: analysis.recommendation },
      timestamp: { N: Date.now().toString() }
    }

    await this.dynamodb.send(new PutItemCommand({
      TableName: process.env.FRAUD_ANALYSIS_TABLE,
      Item: item
    }))
  }

  async alertFraudTeam(analysis) {
    const message = {
      alert: 'High-risk transaction detected',
      transactionId: analysis.transactionId,
      customerId: analysis.customerId,
      riskScore: analysis.riskScore,
      fraudIndicators: analysis.fraudIndicators,
      recommendation: analysis.recommendation,
      timestamp: analysis.timestamp
    }

    await this.sns.send(new PublishCommand({
      TopicArn: process.env.FRAUD_ALERT_TOPIC,
      Message: JSON.stringify(message),
      Subject: `Fraud Alert - Risk Score: ${analysis.riskScore}`
    }))
  }

  parseTimeRange(range) {
    const units = { m: 60000, h: 3600000, d: 86400000 }
    const match = range.match(/(\d+)([mhd])/)
    if (!match) return 3600000
    return parseInt(match[1]) * units[match[2]]
  }

  async getCustomerLocations(customerId) {
    // Implementation would query customer location history
    return []
  }

  async getCustomerTransactionHistory(customerId) {
    // Implementation would query customer transaction history
    return []
  }

  async getTransactionsByBIN(bin, timeRange) {
    // Implementation would query transactions by BIN
    return []
  }
}

export default new PaymentFraudDetectionService()