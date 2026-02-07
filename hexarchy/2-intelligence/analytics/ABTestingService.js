// AB Testing Service
import { logger } from '../../0-core/logging/logger.js';

export class ABTestingService {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
    this.activeTests = new Map();
  }

  // Create AB test
  async createTest(testConfig) {
    const {
      name,
      description,
      variants, // [{ id, name, weight }]
      startDate,
      endDate,
      targetMetric // 'ctr', 'engagement', 'conversion', etc.
    } = testConfig;

    const test = {
      id: `test-${Date.now()}`,
      name,
      description,
      variants,
      startDate,
      endDate,
      targetMetric,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.activeTests.set(test.id, test);
    logger.info('AB test created', { testId: test.id, name });

    return test;
  }

  // Assign user to variant
  assignVariant(userId, testId) {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    // Deterministic assignment based on userId hash
    const hash = this.hashString(userId + testId);
    const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
    const normalized = hash % totalWeight;

    let cumulative = 0;
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (normalized < cumulative) {
        return variant;
      }
    }

    return test.variants[0];
  }

  // Hash string to number
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Track conversion
  async trackConversion(testId, userId, variantId, value = 1) {
    try {
      await this.analyticsRepository.create({
        testId,
        userId,
        variantId,
        eventType: 'conversion',
        value,
        timestamp: new Date().toISOString()
      });

      logger.info('Conversion tracked', { testId, userId, variantId });
    } catch (error) {
      logger.error('Failed to track conversion:', error);
    }
  }

  // Get test results
  async getTestResults(testId) {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    const analytics = await this.analyticsRepository.findByTestId(testId);

    const results = {
      testId,
      name: test.name,
      variants: []
    };

    for (const variant of test.variants) {
      const variantData = analytics.filter(a => a.variantId === variant.id);
      const conversions = variantData.filter(a => a.eventType === 'conversion');

      const uniqueUsers = new Set(variantData.map(a => a.userId)).size;
      const conversionRate = uniqueUsers > 0 ? (conversions.length / uniqueUsers) * 100 : 0;

      results.variants.push({
        id: variant.id,
        name: variant.name,
        users: uniqueUsers,
        conversions: conversions.length,
        conversionRate,
        avgValue: conversions.reduce((sum, c) => sum + (c.value || 0), 0) / conversions.length || 0
      });
    }

    // Calculate winner
    const sorted = [...results.variants].sort((a, b) => b.conversionRate - a.conversionRate);
    results.winner = sorted[0];
    results.improvement = sorted.length > 1
      ? ((sorted[0].conversionRate - sorted[1].conversionRate) / sorted[1].conversionRate * 100).toFixed(2)
      : 0;

    return results;
  }

  // End test
  async endTest(testId) {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    test.status = 'completed';
    test.endedAt = new Date().toISOString();

    const results = await this.getTestResults(testId);

    logger.info('AB test ended', { testId, winner: results.winner?.name });
    return results;
  }

  // Get active tests
  getActiveTests() {
    return Array.from(this.activeTests.values()).filter(t => t.status === 'active');
  }
}

export default ABTestingService;
