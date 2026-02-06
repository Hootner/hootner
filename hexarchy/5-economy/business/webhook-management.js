/**
 * Webhook Management Service
 * Event notifications and delivery tracking
 */

class WebhookManagement {
  constructor() {
    this.webhooks = new Map();
    this.deliveryHistory = new Map();
    this.eventTypes = [
      'video.uploaded', 'video.processed', 'video.deleted',
      'user.created', 'user.updated', 'user.deleted',
      'payment.completed', 'payment.failed',
      'content.moderated', 'backup.completed'
    ];
    this.retryPolicy = {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000 // 1 second
    };
  }

  async registerWebhook({ url, events, secret, description = '', active = true }) {
    const webhookId = `webhook_${Date.now()}`;
    
    console.log(`🔗 Registering webhook: ${url} for events: ${events.join(', ')}`);
    
    // Validate URL to prevent SSRF
    if (!url || typeof url !== 'string' || !this.isValidWebhookUrl(url)) {
      throw new Error('Invalid webhook URL');
    }
    
    // Validate events
    const invalidEvents = events.filter(event => !this.eventTypes.includes(event));
    if (invalidEvents.length > 0) {
      throw new Error(`Invalid events: ${invalidEvents.join(', ')}`);
    }
    
    // Validate secret
    if (secret && (typeof secret !== 'string' || secret.length < 16)) {
      throw new Error('Webhook secret must be at least 16 characters');
    }

    const webhook = {
      id: webhookId,
      url,
      events,
      secret,
      description: description.replace(/[<>"'&]/g, ''), // Sanitize description
      active,
      createdAt: new Date().toISOString(),
      lastDelivery: null,
      deliveryCount: 0,
      failureCount: 0,
      status: 'healthy'
    };

    this.webhooks.set(webhookId, webhook);
    
    // Test webhook endpoint
    await this.testWebhook(webhookId);
    
    return webhook;
  }

  isValidWebhookUrl(url) {
    try {
      const parsed = new URL(url);
      // Only allow HTTPS for security
      if (parsed.protocol !== 'https:') {
        return false;
      }
      // Prevent internal network access
      const hostname = parsed.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') || hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async testWebhook(webhookId) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error(`Webhook ${webhookId} not found`);
    
    console.log(`🧪 Testing webhook: ${webhook.url}`);
    
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook delivery' }
    };

    try {
      await this.deliverWebhook(webhook, testPayload);
      webhook.status = 'healthy';
      return { success: true, message: 'Webhook test successful' };
    } catch (error) {
      webhook.status = 'unhealthy';
      return { success: false, message: error.message };
    }
  }

  async deliverEvent(eventType, eventData) {
    console.log(`📡 Delivering event: ${eventType}`);
    
    const relevantWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.active && webhook.events.includes(eventType));
    
    const deliveries = [];
    
    for (const webhook of relevantWebhooks) {
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: eventData,
        webhook_id: webhook.id
      };
      
      try {
        const delivery = await this.deliverWebhook(webhook, payload);
        deliveries.push(delivery);
      } catch (error) {
        console.error(`Failed to deliver to ${webhook.url}:`, error.message);
        deliveries.push({
          webhookId: webhook.id,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return {
      event: eventType,
      deliveredTo: deliveries.length,
      successful: deliveries.filter(d => d.success).length,
      failed: deliveries.filter(d => !d.success).length,
      deliveries
    };
  }

  async deliverWebhook(webhook, payload, attempt = 1) {
    const deliveryId = `delivery_${Date.now()}_${attempt}`;
    
    const delivery = {
      id: deliveryId,
      webhookId: webhook.id,
      url: webhook.url,
      payload,
      attempt,
      timestamp: new Date().toISOString(),
      success: false,
      responseStatus: null,
      responseTime: null,
      error: null
    };

    const startTime = Date.now();
    
    try {
      // Mock HTTP delivery - replace with actual HTTP client
      const response = await this.mockHttpDelivery(webhook.url, payload, webhook.secret);
      
      delivery.success = response.status >= 200 && response.status < 300;
      delivery.responseStatus = response.status;
      delivery.responseTime = Date.now() - startTime;
      
      if (delivery.success) {
        webhook.deliveryCount++;
        webhook.lastDelivery = delivery.timestamp;
        webhook.status = 'healthy';
      } else {
        webhook.failureCount++;
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      delivery.error = error.message;
      webhook.failureCount++;
      
      // Retry logic
      if (attempt < this.retryPolicy.maxRetries) {
        const delay = this.retryPolicy.initialDelay * Math.pow(this.retryPolicy.backoffMultiplier, attempt - 1);
        console.log(`⏳ Retrying webhook delivery in ${delay}ms (attempt ${attempt + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.deliverWebhook(webhook, payload, attempt + 1);
      }
      
      webhook.status = 'unhealthy';
      throw error;
    }
    
    // Store delivery history
    if (!this.deliveryHistory.has(webhook.id)) {
      this.deliveryHistory.set(webhook.id, []);
    }
    
    const history = this.deliveryHistory.get(webhook.id);
    history.push(delivery);
    
    // Keep only last 100 deliveries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    return delivery;
  }

  async mockHttpDelivery(url, payload, secret) {
    // Mock HTTP request - replace with actual HTTP client (axios, fetch, etc.)
    const delay = Math.random() * 1000 + 100; // 100-1100ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate success/failure
    const success = Math.random() > 0.05; // 95% success rate
    
    return {
      status: success ? 200 : (Math.random() > 0.5 ? 500 : 404),
      statusText: success ? 'OK' : 'Internal Server Error'
    };
  }

  async getWebhookStats(webhookId) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error(`Webhook ${webhookId} not found`);
    
    const history = this.deliveryHistory.get(webhookId) || [];
    const recentDeliveries = history.slice(-50); // Last 50 deliveries
    
    const stats = {
      webhookId,
      url: webhook.url,
      status: webhook.status,
      totalDeliveries: webhook.deliveryCount,
      totalFailures: webhook.failureCount,
      successRate: webhook.deliveryCount > 0 ? 
        ((webhook.deliveryCount - webhook.failureCount) / webhook.deliveryCount * 100).toFixed(2) + '%' : 
        'N/A',
      lastDelivery: webhook.lastDelivery,
      avgResponseTime: this.calculateAverageResponseTime(recentDeliveries),
      recentDeliveries: recentDeliveries.slice(-10) // Last 10 deliveries
    };
    
    return stats;
  }

  calculateAverageResponseTime(deliveries) {
    const validDeliveries = deliveries.filter(d => d.responseTime !== null);
    if (validDeliveries.length === 0) return 0;
    
    const totalTime = validDeliveries.reduce((sum, d) => sum + d.responseTime, 0);
    return Math.round(totalTime / validDeliveries.length);
  }

  async updateWebhook(webhookId, updates) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error(`Webhook ${webhookId} not found`);
    
    Object.assign(webhook, updates, { updatedAt: new Date().toISOString() });
    
    console.log(`🔄 Updated webhook: ${webhookId}`);
    return webhook;
  }

  async deleteWebhook(webhookId) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error(`Webhook ${webhookId} not found`);
    
    this.webhooks.delete(webhookId);
    this.deliveryHistory.delete(webhookId);
    
    console.log(`🗑️ Deleted webhook: ${webhookId}`);
    return { success: true, message: 'Webhook deleted successfully' };
  }

  async register({ url, events, secret = null }) {
    console.log(`🔗 Registering webhook for events: ${events.join(', ')}`);
    return await this.registerWebhook({ url, events, secret });
  }

  getSupportedEvents() {
    return this.eventTypes;
  }
}

module.exports = new WebhookManagement();