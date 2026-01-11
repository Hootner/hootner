/**
 * SUBSCRIPTION MANAGEMENT API
 * Handles Pro/Enterprise tier subscriptions
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import paymentService from '../payment-service-simple.js';

const router = express.Router();

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create subscription
router.post('/subscribe', authenticateUser, async (req, res) => {
  const { user_id, email, tier } = req.body;
  
  // Verify user owns the subscription
  if (req.user.id !== user_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!['pro', 'enterprise'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier. Use "pro" or "enterprise"' });
  }

  try {
    const subscription = await paymentService.createSubscription(user_id, tier, email);
    
    res.json({
      success: true,
      subscription_id: subscription.subscription.id,
      tier,
      monthly_cost: tier === 'pro' ? 10 : 100,
      benefits: tier === 'pro' 
        ? ['1000 executions/month', 'Priority support', 'No daily limits']
        : ['Unlimited executions', 'Premium support', 'Custom algorithms', 'SLA guarantee'],
      next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
router.get('/status/:user_id', authenticateUser, async (req, res) => {
  const { user_id } = req.params;
  
  // Verify user can access this subscription
  if (req.user.id !== user_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Mock subscription status - in production, query from database
  res.json({
    user_id,
    tier: 'free', // Default to free
    executions_used_today: 3,
    executions_remaining_today: 7,
    monthly_executions_used: 0,
    monthly_executions_limit: tier === 'pro' ? 1000 : 'unlimited',
    subscription_active: false,
    upgrade_url: '/api/subscriptions/subscribe'
  });
});

// Upgrade subscription
router.post('/upgrade', authenticateUser, async (req, res) => {
  const { user_id, current_tier, new_tier } = req.body;
  
  // Verify user owns the subscription
  if (req.user.id !== user_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const pricing = {
    'free_to_pro': 10,
    'free_to_enterprise': 100,
    'pro_to_enterprise': 90 // Prorated difference
  };
  
  const upgrade_key = `${current_tier}_to_${new_tier}`;
  const cost = pricing[upgrade_key];
  
  if (!cost) {
    return res.status(400).json({ error: 'Invalid upgrade path' });
  }
  
  res.json({
    success: true,
    upgrade_cost: cost,
    new_tier,
    effective_date: new Date().toISOString(),
    benefits_added: new_tier === 'enterprise' 
      ? ['Unlimited executions', 'Custom algorithms', 'SLA']
      : ['1000 executions/month', 'Priority support']
  });
});

// Cancel subscription
router.post('/cancel', authenticateUser, async (req, res) => {
  const { user_id, reason } = req.body;
  
  // Verify user owns the subscription
  if (req.user.id !== user_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json({
    success: true,
    message: 'Subscription cancelled',
    effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    access_until: 'End of current billing period',
    feedback_requested: true
  });
});

// Pricing information
router.get('/pricing', (req, res) => {
  res.json({
    tiers: {
      free: {
        price: 0,
        executions_per_day: 10,
        executions_per_month: 300,
        support: 'Community',
        features: ['Basic algorithms', 'Standard response time']
      },
      pro: {
        price: 10,
        currency: 'USD',
        billing: 'monthly',
        executions_per_month: 1000,
        support: 'Priority email',
        features: ['All algorithms', 'Fast response time', 'Usage analytics', 'API documentation']
      },
      enterprise: {
        price: 100,
        currency: 'USD', 
        billing: 'monthly',
        executions_per_month: 'unlimited',
        support: '24/7 phone + email',
        features: ['All algorithms', 'Fastest response time', 'Custom algorithms', 'SLA guarantee', 'Dedicated support', 'Usage analytics', 'White-label options']
      }
    },
    popular: 'pro',
    enterprise_contact: 'enterprise@hootner.com'
  });
});

export default router;