export const PRICING_TIERS = {
  // App Download Fees (One-time)
  downloads: {
    'basic-player': { price: 0, name: 'Basic Video Player', features: ['720p', 'Basic controls'] },
    'advanced-player': { price: 9.99, name: 'Advanced Video Player', features: ['4K', 'AI upscaling', 'Advanced controls'] },
    'cinema-player': { price: 19.99, name: 'Cinema Player Pro', features: ['8K HDR', 'Dolby Atmos', 'Professional tools'] },
    'code-editor': { price: 14.99, name: 'Code Editor Pro', features: ['AI completion', 'Multi-language', 'Collaboration'] },
    'ai-video-generator': { price: 29.99, name: 'AI Video Generator', features: ['Stable Diffusion', 'Custom models', 'Batch processing'] }
  },

  // Usage-Based Charges (Per use)
  usage: {
    'video-streaming': { price: 0.05, unit: 'per GB', name: 'Video Streaming' },
    'ai-processing': { price: 0.25, unit: 'per minute', name: 'AI Video Processing' },
    'storage': { price: 0.10, unit: 'per GB/month', name: 'Cloud Storage' },
    'api-calls': { price: 0.01, unit: 'per 1000 calls', name: 'API Usage' },
    'premium-features': { price: 1.99, unit: 'per feature/day', name: 'Premium Features' }
  },

  // Subscription Tiers (Monthly)
  subscriptions: {
    'starter': { price: 9.99, name: 'Starter Plan', downloads: ['basic-player'], usage_discount: 0 },
    'professional': { price: 29.99, name: 'Professional Plan', downloads: ['basic-player', 'advanced-player'], usage_discount: 0.15 },
    'enterprise': { price: 99.99, name: 'Enterprise Plan', downloads: 'all', usage_discount: 0.30 }
  }
}

export class TieredBillingService {
  constructor() {
    this.userTiers = new Map()
    this.downloadHistory = new Map()
  }

  async chargeDownload(userId, appType) {
    const app = PRICING_TIERS.downloads[appType]
    if (!app) throw new Error(`Unknown app: ${appType}`)

    // Check if already purchased
    const userDownloads = this.downloadHistory.get(userId) || []
    if (userDownloads.includes(appType)) {
      return { success: true, message: 'Already purchased', charge: 0 }
    }

    // Check subscription tier
    const userTier = this.userTiers.get(userId)
    if (this.isIncludedInSubscription(userTier, appType)) {
      return { success: true, message: 'Included in subscription', charge: 0 }
    }

    // Charge for download
    const charge = {
      userId,
      type: 'download',
      item: appType,
      amount: app.price,
      timestamp: Date.now(),
      status: 'charged'
    }

    // Record purchase
    userDownloads.push(appType)
    this.downloadHistory.set(userId, userDownloads)

    return { success: true, charge }
  }

  async chargeUsage(userId, usageType, quantity) {
    const usage = PRICING_TIERS.usage[usageType]
    if (!usage) throw new Error(`Unknown usage type: ${usageType}`)

    const userTier = this.userTiers.get(userId)
    const discount = this.getUsageDiscount(userTier)
    const baseAmount = usage.price * quantity
    const finalAmount = baseAmount * (1 - discount)

    const charge = {
      userId,
      type: 'usage',
      item: usageType,
      quantity,
      baseAmount,
      discount,
      finalAmount,
      timestamp: Date.now(),
      status: 'charged'
    }

    return { success: true, charge }
  }

  isIncludedInSubscription(tierName, appType) {
    if (!tierName) return false
    const tier = PRICING_TIERS.subscriptions[tierName]
    if (!tier) return false
    
    return tier.downloads === 'all' || tier.downloads.includes(appType)
  }

  getUsageDiscount(tierName) {
    if (!tierName) return 0
    const tier = PRICING_TIERS.subscriptions[tierName]
    return tier?.usage_discount || 0
  }
}

export default new TieredBillingService()