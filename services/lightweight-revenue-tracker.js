/**
 * Lightweight Revenue Tracker - Minimal RAM Usage
 * Uses existing .env secrets, no heavy dependencies
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LightweightRevenueTracker {
  constructor() {
    this.usageFile = path.join(__dirname, '../data/usage/revenue-usage.json');
    this.customerFile = path.join(__dirname, '../data/usage/customer-billing.json');
  }

  /**
   * Get revenue summary - minimal memory footprint
   */
  async getRevenueSummary() {
    try {
      const data = await fs.readFile(this.usageFile, 'utf8');
      const usage = JSON.parse(data);
      
      const summary = {
        totalCalls: usage.length,
        totalRevenue: usage.reduce((sum, item) => sum + (item.billedAmount || 0), 0),
        customers: [...new Set(usage.map(u => u.customerId))].length,
        algorithms: {}
      };

      // Count by algorithm
      usage.forEach(u => {
        if (!summary.algorithms[u.algorithm]) {
          summary.algorithms[u.algorithm] = { calls: 0, revenue: 0 };
        }
        summary.algorithms[u.algorithm].calls++;
        summary.algorithms[u.algorithm].revenue += u.billedAmount || 0;
      });

      return summary;
    } catch (error) {
      return { error: error.message, totalRevenue: 0 };
    }
  }

  /**
   * Track new usage - append only, minimal memory
   */
  async trackUsage(userId, algorithm, result, billedAmount) {
    const record = {
      userId,
      algorithm,
      result,
      billedAmount,
      timestamp: Date.now(),
      status: 'billed'
    };

    try {
      const existing = await fs.readFile(this.usageFile, 'utf8');
      const data = JSON.parse(existing);
      data.push(record);
      await fs.writeFile(this.usageFile, JSON.stringify(data, null, 2));
      return record;
    } catch (error) {
      // Create new file if doesn't exist
      await fs.writeFile(this.usageFile, JSON.stringify([record], null, 2));
      return record;
    }
  }

  /**
   * Check if Stripe is configured with real keys
   */
  isStripeConfigured() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    return stripeKey && 
           stripeKey !== 'sk_test_your_key_here' && 
           stripeKey !== 'sk_test_51placeholder' &&
           stripeKey.startsWith('sk_');
  }

  /**
   * Get configuration status
   */
  getConfigStatus() {
    return {
      stripeConfigured: this.isStripeConfigured(),
      jwtSecret: !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-jwt-secret',
      apiKeys: !!process.env.AI_API_KEYS && process.env.AI_API_KEYS !== 'your-secret-key-1,your-secret-key-2',
      encryptionKey: !!process.env.ENCRYPTION_KEY,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

export default LightweightRevenueTracker;