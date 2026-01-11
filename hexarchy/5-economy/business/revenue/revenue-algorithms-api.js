/**
 * REVENUE ALGORITHMS API SERVER
 * Central orchestration for all revenue optimization algorithms
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import RevenueOptimization from './revenue-optimization.js';
import PricingAlgorithms from './pricing-algorithms.js';
import ConversionOptimization from './conversion-optimization.js';
import RevenueAnalytics from './revenue-analytics.js';

const app = express();
const PORT = process.env.REVENUE_API_PORT || 3009;

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  req.sessionId = crypto.randomUUID();
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>"'&]/g, '');
      }
    });
  }
  next();
};

// Revenue optimization endpoints
app.post('/api/revenue/optimize-price', authenticateRequest, sanitizeInput, async (req, res) => {
  try {
    const { userId, service, context } = req.body;
    const optimalPrice = PricingAlgorithms.calculateAIPricing(service, userId, context);
    
    res.json({
      success: true,
      optimalPrice,
      service,
      userId,
      algorithm: 'ai_dynamic_pricing',
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/conversion-funnel', authenticateRequest, sanitizeInput, async (req, res) => {
  try {
    const { funnelId, steps, userData } = req.body;
    const optimization = ConversionOptimization.optimizeFunnel(funnelId, steps, userData);
    
    res.json({
      success: true,
      optimization,
      funnelId,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/churn-prediction', authenticateRequest, sanitizeInput, async (req, res) => {
  try {
    const { userId } = req.body;
    const churnPrediction = RevenueOptimization.predictChurn(userId);
    
    res.json({
      success: true,
      churnPrediction,
      userId,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/clv-optimization', authenticateRequest, sanitizeInput, async (req, res) => {
  try {
    const { userId } = req.body;
    const clvOptimization = RevenueOptimization.optimizeCustomerLifetimeValue(userId);
    
    res.json({
      success: true,
      clvOptimization,
      userId,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/surge-pricing', authenticateRequest, sanitizeInput, async (req, res) => {
  try {
    const { service, currentDemand, capacity } = req.body;
    const surgePrice = PricingAlgorithms.calculateSurgePricing(service, currentDemand, capacity);
    
    res.json({
      success: true,
      surgePrice,
      service,
      demandLevel: currentDemand / capacity,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/bundle-optimization', authenticateRequest, sanitizeInput, async (req, res) => {
  try {
    const { services, userId } = req.body;
    const bundleOptimization = PricingAlgorithms.optimizeBundlePricing(services, userId);
    
    res.json({
      success: true,
      bundleOptimization,
      services,
      userId,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/conversion-trigger', async (req, res) => {
  try {
    const { userId, currentPage, sessionData } = req.body;
    const trigger = ConversionOptimization.triggerConversionOptimization(userId, currentPage, sessionData);
    
    res.json({
      success: true,
      trigger,
      userId,
      currentPage
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/personalized-path', async (req, res) => {
  try {
    const { userId, userProfile } = req.body;
    const personalizedPath = ConversionOptimization.createPersonalizedConversionPath(userId, userProfile);
    
    res.json({
      success: true,
      personalizedPath,
      userId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoints
app.get('/api/revenue/dashboard', async (req, res) => {
  try {
    const dashboardData = RevenueAnalytics.getDashboardData();
    
    res.json({
      success: true,
      dashboard: dashboardData,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/revenue/forecast/:timeframe', async (req, res) => {
  try {
    const { timeframe } = req.params;
    const forecast = RevenueAnalytics.generateRevenueForecast(timeframe);
    
    res.json({
      success: true,
      forecast,
      timeframe
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/revenue/recommendations', async (req, res) => {
  try {
    const recommendations = RevenueAnalytics.generateOptimizationRecommendations();
    
    res.json({
      success: true,
      recommendations,
      generated: Date.now()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/track', async (req, res) => {
  try {
    const { streamId, amount, source, metadata } = req.body;
    const insights = RevenueAnalytics.trackRevenueStream(streamId, amount, source, metadata);
    
    res.json({
      success: true,
      insights,
      tracked: { streamId, amount, source }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/revenue/report/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const report = RevenueAnalytics.generateRevenueReport(period);
    
    res.json({
      success: true,
      report,
      period
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// A/B testing endpoints
app.post('/api/revenue/ab-test/pricing', async (req, res) => {
  try {
    const { service, userId, variants } = req.body;
    const abTest = PricingAlgorithms.runPricingABTest(service, userId, variants);
    
    res.json({
      success: true,
      abTest,
      service,
      userId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue/ab-test/conversion', async (req, res) => {
  try {
    const { testId, variants, trafficAllocation } = req.body;
    const optimization = ConversionOptimization.optimizeABTests(testId, variants, trafficAllocation);
    
    res.json({
      success: true,
      optimization,
      testId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Revenue maximization endpoint
app.post('/api/revenue/maximize', async (req, res) => {
  try {
    const { service, userSegment, constraints } = req.body;
    const maximization = PricingAlgorithms.maximizeRevenue(service, userSegment, constraints);
    
    res.json({
      success: true,
      maximization,
      service,
      userSegment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/revenue/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    algorithms: {
      revenueOptimization: 'active',
      pricingAlgorithms: 'active',
      conversionOptimization: 'active',
      revenueAnalytics: 'active'
    },
    timestamp: Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Revenue Algorithms API Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/revenue/dashboard`);
  console.log(`💰 Revenue tracking: http://localhost:${PORT}/api/revenue/track`);
  console.log(`🎯 Optimization: http://localhost:${PORT}/api/revenue/recommendations`);
});

export default app;