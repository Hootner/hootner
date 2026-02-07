// Google Analytics API
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { logger } from '../../0-core/logging/logger.js';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
});

export class GoogleAnalyticsAPI {
  static PROPERTY_ID = process.env.GA_PROPERTY_ID;

  // Track page view
  static async trackPageView(path, userId) {
    try {
      logger.info('Page view tracked', { path, userId });
      // Implementation depends on GA4 Measurement Protocol
    } catch (error) {
      logger.error('Page view tracking failed:', error);
    }
  }

  // Track event
  static async trackEvent(eventName, params) {
    try {
      logger.info('Event tracked', { eventName, params });
      // Implementation depends on GA4 Measurement Protocol
    } catch (error) {
      logger.error('Event tracking failed:', error);
    }
  }

  // Get report
  static async getReport(startDate, endDate, metrics, dimensions) {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${this.PROPERTY_ID}`,
        dateRanges: [{
          startDate,
          endDate
        }],
        metrics: metrics.map(m => ({ name: m })),
        dimensions: dimensions.map(d => ({ name: d }))
      });

      return response;
    } catch (error) {
      logger.error('Analytics report failed:', error);
      throw error;
    }
  }

  // Get real-time data
  static async getRealTimeData() {
    try {
      const [response] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${this.PROPERTY_ID}`,
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ]
      });

      return response;
    } catch (error) {
      logger.error('Real-time data fetch failed:', error);
      throw error;
    }
  }
}

export default GoogleAnalyticsAPI;
