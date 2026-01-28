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
  
  // Validate token format
  if (!/^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*$/.test(token)) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate decoded token structure
    if (!decoded.id || typeof decoded.id !== 'string') {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    
    req.user = {
      id: String(decoded.id).replace(/[<>"'&]/g, '').substring(0, 100),
      email: decoded.email ? String(decoded.email).replace(/[<>"'&]/g, '').substring(0, 255) : null
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create subscription
router.post('/subscribe', authenticateUser, async (req, res) => {
  const { user_id, email, tier } = req.body;
  
  // Validate and sanitize inputs
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Invalid user_id' });
  }
  
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  const sanitizedUserId = String(user_id).replace(/[<>"'&]/g, '').substring(0, 100);
  const sanitizedEmail = String(email).replace(/[<>"'&]/g, '').substring(0, 255);
  const sanitizedTier = String(tier).replace(/[<>"'&]/g, '').toLowerCase();
  
  // Verify user owns the subscription
  if (req.user.id !== sanitizedUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!['pro', 'enterprise'].includes(sanitizedTier)) {
    return res.status(400).json({ error: 'Invalid tier. Use "pro" or "enterprise"' });
  }

  try {
    const subscription = await paymentService.createSubscription(sanitizedUserId, sanitizedTier, sanitizedEmail);
    
    res.json({
      success: true,
      subscription_id: subscription.subscription.id,
      tier: sanitizedTier,
      monthly_cost: sanitizedTier === 'pro' ? 10 : 100,
      benefits: sanitizedTier === 'pro' 
        ? ['1000 executions/month', 'Priority support', 'No daily limits']
        : ['Unlimited executions', 'Premium support', 'Custom algorithms', 'SLA guarantee'],
      next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Subscription creation failed' });
  }
});

// Get subscription status
router.get('/status/:user_id', authenticateUser, async (req, res) => {
  const { user_id } = req.params;
  
  // Validate and sanitize user_id
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Invalid user_id' });
  }
  
  const sanitizedUserId = String(user_id).replace(/[<>"'&]/g, '').substring(0, 100);
  
  // Verify user can access this subscription
  if (req.user.id !== sanitizedUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Mock subscription status - in production, query from database
  res.json({
    user_id: sanitizedUserId,
    tier: 'free', // Default to free
    executions_used_today: 3,
    executions_remaining_today: 7,
    monthly_executions_used: 0,
    monthly_executions_limit: 'pro' === 'pro' ? 1000 : 'unlimited',
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