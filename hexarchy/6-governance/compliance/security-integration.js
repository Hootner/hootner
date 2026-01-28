import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

export class SecurityIntegrationService {
  constructor() {
    this.cloudwatch = new CloudWatchClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
    this.sns = new SNSClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
  }

  async scanAPIEndpoint(endpoint, request) {
    const scanResult = await this.performSecurityScan(endpoint, request)
    
    if (scanResult.threats.length > 0) {
      await this.alertSecurityTeam(scanResult)
      await this.updateWAFRules(scanResult.threats)
    }

    await this.logSecurityMetrics(scanResult)
    return scanResult
  }

  async performSecurityScan(endpoint, request) {
    // SQL injection detection
    const sqlInjection = this.detectSQLInjection(request)
    
    // XSS detection
    const xss = this.detectXSS(request)
    
    // Rate limiting check
    const rateLimiting = this.checkRateLimit(request.ip)

    return {
      endpoint,
      threats: [...sqlInjection, ...xss, ...rateLimiting],
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity([...sqlInjection, ...xss, ...rateLimiting])
    }
  }

  async alertSecurityTeam(scanResult) {
    const message = {
      alert: 'Security threat detected',
      endpoint: scanResult.endpoint,
      threats: scanResult.threats,
      severity: scanResult.severity,
      timestamp: scanResult.timestamp
    }

    await this.sns.send(new PublishCommand({
      TopicArn: process.env.SECURITY_ALERT_TOPIC,
      Message: JSON.stringify(message),
      Subject: `Security Alert - ${scanResult.severity} severity`
    }))
  }

  async logSecurityMetrics(scanResult) {
    await this.cloudwatch.send(new PutMetricDataCommand({
      Namespace: 'HOOTNER/Security',
      MetricData: [
        {
          MetricName: 'ThreatCount',
          Value: scanResult.threats.length,
          Unit: 'Count',
          Timestamp: new Date()
        },
        {
          MetricName: 'SeverityLevel',
          Value: this.severityToNumber(scanResult.severity),
          Unit: 'None',
          Timestamp: new Date()
        }
      ]
    }))
  }

  detectSQLInjection(request) {
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b)/i,
      /('|(\\')|(;)|(\\;)|(\-\-)|(\#)/
    ]
    
    const threats = []
    const payload = JSON.stringify(request.body || {}) + (request.query || '')
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(payload)) {
        threats.push({ type: 'SQL_INJECTION', pattern: pattern.source })
      }
    })
    
    return threats
  }

  detectXSS(request) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ]
    
    const threats = []
    const payload = JSON.stringify(request.body || {}) + (request.query || '')
    
    xssPatterns.forEach(pattern => {
      if (pattern.test(payload)) {
        threats.push({ type: 'XSS', pattern: pattern.source })
      }
    })
    
    return threats
  }

  checkRateLimit(ip) {
    // Implementation would check Redis for rate limiting
    return []
  }

  calculateSeverity(threats) {
    if (threats.length === 0) return 'LOW'
    if (threats.some(t => t.type === 'SQL_INJECTION')) return 'CRITICAL'
    if (threats.some(t => t.type === 'XSS')) return 'HIGH'
    return 'MEDIUM'
  }

  severityToNumber(severity) {
    const levels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
    return levels[severity] || 1
  }

  async updateWAFRules(threats) {
    // Implementation would update WAF rules based on threats
    console.log('Updating WAF rules for threats:', threats)
  }
}

export default new SecurityIntegrationService()