/**
 * Secured AI Algorithm Routes
 * Requires authentication and billing for access
 */

const express = require('express');
const AIAlgorithmAuth = require('../hexarchy/0-core/auth/ai-algorithm-auth');
const EnhancedRevenueTracker = require('../services/enhanced-revenue-tracker');

const router = express.Router();
const revenueTracker = new EnhancedRevenueTracker();

// Apply authentication to all AI algorithm routes
router.use(AIAlgorithmAuth.authenticateUser);
router.use(AIAlgorithmAuth.requirePaidSubscription);
router.use(AIAlgorithmAuth.rateLimitAlgorithms(5, 60000)); // 5 calls per minute

/**
 * Price Optimization Algorithm - $2.99 per call
 */
router.post('/price-optimize', async (req, res) => {
  try {
    const { price, competitors, demand } = req.body;
    
    // Run algorithm
    const result = calculateOptimalPrice(price, competitors, demand);
    
    // Bill customer
    await revenueTracker.trackPaidUsage(
      req.user.id,
      'price_optimize',
      { price, competitors, demand },
      req.user.stripeCustomerId
    );

    res.json({
      success: true,
      result,
      revenueImpact: `+$${(result * 100).toFixed(0)}/month`,
      billedAmount: 2.99
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dynamic Pricing Algorithm - $1.99 per call
 */
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { currentPrice, marketConditions } = req.body;
    
    const result = calculateDynamicPrice(currentPrice, marketConditions);
    
    await revenueTracker.trackPaidUsage(
      req.user.id,
      'dynamic_pricing',
      { currentPrice, marketConditions },
      req.user.stripeCustomerId
    );

    res.json({
      success: true,
      result,
      revenueImpact: `+$${(result * 100).toFixed(0)}/month`,
      billedAmount: 1.99
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Revenue Forecasting - $4.99 per call
 */
router.post('/revenue-forecast', async (req, res) => {
  try {
    const { currentRevenue, growthRate, months, marketSize, competition } = req.body;
    
    const result = generateRevenueForecast(currentRevenue, growthRate, months, marketSize, competition);
    
    await revenueTracker.trackPaidUsage(
      req.user.id,
      'revenue_forecast',
      { currentRevenue, growthRate, months, marketSize, competition },
      req.user.stripeCustomerId
    );

    res.json({
      success: true,
      result,
      revenueImpact: `+$${((result[result.length - 1].revenue - currentRevenue) / months).toFixed(0)}/month`,
      billedAmount: 4.99
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Conversion Optimization - $3.99 per call
 */
router.post('/conversion-optimize', async (req, res) => {
  try {
    const { currentRate, traffic, pageSpeed, mobileFriendly } = req.body;
    
    const result = optimizeConversion(currentRate, traffic, pageSpeed, mobileFriendly);
    
    await revenueTracker.trackPaidUsage(
      req.user.id,
      'conversion_optimize',
      { currentRate, traffic, pageSpeed, mobileFriendly },
      req.user.stripeCustomerId
    );

    res.json({
      success: true,
      result,
      revenueImpact: `+$${((result - currentRate) * traffic * 30).toFixed(0)}/month`,
      billedAmount: 3.99
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Algorithm implementations
function calculateOptimalPrice(basePrice, competitors, demand) {
  const avgCompetitor = competitors.reduce((a, b) => a + b, 0) / competitors.length;
  const demandMultiplier = 1 + (demand - 0.5) * 0.3;
  return Math.round((avgCompetitor * 1.05 * demandMultiplier) * 100) / 100;
}

function calculateDynamicPrice(currentPrice, conditions) {
  const { demand, inventory, timeOfDay } = conditions;
  let multiplier = 1;
  
  if (demand > 0.8) multiplier += 0.2;
  if (inventory < 0.2) multiplier += 0.15;
  if (timeOfDay === 'peak') multiplier += 0.1;
  
  return Math.round(currentPrice * multiplier * 100) / 100;
}

function generateRevenueForecast(current, growth, months, market, competition) {
  const forecast = [];
  let revenue = current;
  
  for (let i = 1; i <= months; i++) {
    const monthlyGrowth = growth / 12;
    const competitionImpact = 1 - (competition * 0.1);
    const marketSaturation = Math.min(1, revenue / market);
    
    revenue *= (1 + monthlyGrowth * competitionImpact * (1 - marketSaturation));
    
    forecast.push({
      month: i,
      revenue: Math.round(revenue),
      growth: ((revenue / current - 1) * 100).toFixed(2)
    });
  }
  
  return forecast;
}

function optimizeConversion(currentRate, traffic, pageSpeed, mobile) {
  let optimizedRate = currentRate;
  
  // Page speed impact
  if (pageSpeed > 3) optimizedRate *= 0.9;
  else if (pageSpeed < 2) optimizedRate *= 1.1;
  
  // Mobile optimization
  if (mobile) optimizedRate *= 1.05;
  
  // Traffic quality (higher traffic usually means better targeting)
  if (traffic > 10000) optimizedRate *= 1.02;
  
  return Math.round(optimizedRate * 10000) / 10000;
}

module.exports = router;