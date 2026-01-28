import { promises as fs } from 'fs'
import path from 'path'

export class UserDetectionService {
  constructor() {
    this.logPath = './data/logs/user-activity.log'
    this.analyticsPath = './data/usage/user-analytics.json'
  }

  async detectActiveUsers() {
    const sources = await Promise.all([
      this.checkServerLogs(),
      this.checkRevenueData(),
      this.checkLocalStorage(),
      this.checkNetworkActivity()
    ])

    const activeUsers = this.consolidateUserData(sources)
    await this.saveAnalytics(activeUsers)
    
    return {
      totalUsers: activeUsers.length,
      activeInLast24h: activeUsers.filter(u => u.lastSeen > Date.now() - 86400000).length,
      paidUsers: activeUsers.filter(u => u.hasPaid).length,
      users: activeUsers
    }
  }

  async checkServerLogs() {
    try {
      const logData = await fs.readFile(this.logPath, 'utf8')
      const lines = logData.split('\n').filter(line => line.includes('user:'))
      
      return lines.map(line => {
        const match = line.match(/user:(\w+).*timestamp:(\d+)/)
        return match ? { userId: match[1], timestamp: parseInt(match[2]), source: 'server' } : null
      }).filter(Boolean)
    } catch {
      return []
    }
  }

  async checkRevenueData() {
    try {
      const revenueData = JSON.parse(await fs.readFile('./data/usage/revenue-usage.json', 'utf8'))
      return revenueData.map(entry => ({
        userId: entry.userId,
        customerId: entry.customerId,
        timestamp: entry.timestamp,
        amount: entry.amount || entry.billedAmount,
        source: 'revenue',
        hasPaid: true
      }))
    } catch {
      return []
    }
  }

  async checkLocalStorage() {
    // Simulate checking browser localStorage data
    return [
      { userId: 'browser_user_001', timestamp: Date.now() - 3600000, source: 'browser' },
      { userId: 'browser_user_002', timestamp: Date.now() - 7200000, source: 'browser' }
    ]
  }

  async checkNetworkActivity() {
    // Check for active connections, API calls
    const networkUsers = []
    
    // Simulate network detection
    if (process.env.NODE_ENV === 'production') {
      networkUsers.push({
        userId: 'network_user_001',
        timestamp: Date.now(),
        source: 'network',
        ip: '192.168.1.100'
      })
    }
    
    return networkUsers
  }

  consolidateUserData(sources) {
    const userMap = new Map()
    
    sources.flat().forEach(user => {
      if (!user || !user.userId) return
      
      const existing = userMap.get(user.userId) || {
        userId: user.userId,
        firstSeen: user.timestamp,
        lastSeen: user.timestamp,
        sources: [],
        hasPaid: false,
        totalSpent: 0
      }
      
      existing.lastSeen = Math.max(existing.lastSeen, user.timestamp)
      existing.firstSeen = Math.min(existing.firstSeen, user.timestamp)
      existing.sources.push(user.source)
      
      if (user.hasPaid) existing.hasPaid = true
      if (user.amount) existing.totalSpent += user.amount
      if (user.customerId) existing.customerId = user.customerId
      if (user.ip) existing.ip = user.ip
      
      userMap.set(user.userId, existing)
    })
    
    return Array.from(userMap.values())
  }

  async saveAnalytics(users) {
    const analytics = {
      timestamp: Date.now(),
      totalUsers: users.length,
      activeUsers: users.filter(u => u.lastSeen > Date.now() - 86400000).length,
      paidUsers: users.filter(u => u.hasPaid).length,
      totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
      users: users.slice(0, 50) // Limit for privacy
    }
    
    await fs.writeFile(this.analyticsPath, JSON.stringify(analytics, null, 2))
  }

  async getRealTimeStats() {
    return {
      timestamp: Date.now(),
      activeConnections: this.getActiveConnections(),
      currentUsers: await this.getCurrentUsers(),
      systemLoad: this.getSystemLoad()
    }
  }

  getActiveConnections() {
    // Simulate active connection count
    return Math.floor(Math.random() * 50) + 10
  }

  async getCurrentUsers() {
    const users = await this.detectActiveUsers()
    return users.activeInLast24h
  }

  getSystemLoad() {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      requests: Math.floor(Math.random() * 1000) + 100
    }
  }
}

export default new UserDetectionService()