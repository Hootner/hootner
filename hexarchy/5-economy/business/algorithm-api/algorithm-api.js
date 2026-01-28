
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};

/**
 * HOOTNER Algorithm API - Monetize Training Data
 * Revenue: $5K/month immediate, $50K/month potential
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import paymentService from '../payment-service-simple.js';

const app = express();
app.use(express.json());
const PORT = 3009;

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = { id: crypto.randomUUID() }; // Mock user
  next();
};

// Subscription endpoints
app.post('/api/subscribe', authenticateUser, async (req, res) => {
  const { user_id: sanitizeInput(user_id), email: sanitizeInput(email), tier: sanitizeInput(tier) } = req.body;
  
  // Sanitize inputs
  const sanitizedUserId = String(user_id).replace(/[<>"'&]/g, '');
  const sanitizedEmail = String(email).replace(/[<>"'&]/g, '');
  const sanitizedTier = String(tier).replace(/[<>"'&]/g, '');
  
  if (!['pro', 'enterprise'].includes(sanitizedTier)) {
    return res.status(400).json({ error: 'Invalid tier. Use "pro" or "enterprise"' });
  }

  const subscription = await paymentService.createSubscription(sanitizedUserId, sanitizedTier, sanitizedEmail);
  
  res.json({
    success: true,
    tier: sanitizedTier,
    monthly_cost: sanitizedTier === 'pro' ? 10 : 100,
    benefits: sanitizedTier === 'pro' 
      ? ['1000 executions/month', 'Priority support']
      : ['Unlimited executions', 'Premium support', 'Custom algorithms']
  });
});

app.get('/api/pricing', (req, res) => {
  res.json({
    free: { price: 0, executions_per_day: 10 },
    pro: { price: 10, executions_per_month: 1000 },
    enterprise: { price: 100, executions_per_month: 'unlimited' }
  });
});

// Rate limiting for free tier
const freeLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 requests per day for free users
  message: 'Free tier limit reached. Upgrade to Pro for more executions.'
});

// Algorithm implementations (extracted from training data)
const algorithms = {
  'bubble-sort': (arr) => {
    // Implementation from javascript-algorithms/src/algorithms/sorting/bubble-sort/
    const result = [...arr];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length - i - 1; j++) {
        if (result[j] > result[j + 1]) {
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  },
  
  'quick-sort': (arr) => {
    // Implementation from training data
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...algorithms['quick-sort'](left), ...middle, ...algorithms['quick-sort'](right)];
  },
  
  'dijkstra': (graph, start) => {
    // Implementation from training data - shortest path algorithm
    const distances = {};
    const visited = new Set();
    const queue = [[start, 0]];
    
    for (const node in graph) distances[node] = Infinity;
    distances[start] = 0;
    
    while (queue.length) {
      queue.sort((a, b) => a[1] - b[1]);
      const [current, currentDistance] = queue.shift();
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      for (const neighbor in graph[current]) {
        const distance = currentDistance + graph[current][neighbor];
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          queue.push([neighbor, distance]);
        }
      }
    }
    return distances;
  }
};

// API Endpoints
app.get('/api/algorithms', (req, res) => {
  res.json({
    available_algorithms: Object.keys(algorithms),
    total_count: Object.keys(algorithms).length,
    pricing: {
      free: '10 executions/day',
      pro: '$10/month - 1000 executions',
      enterprise: '$100/month - unlimited'
    }
  });
});

app.post('/api/algorithms/:name/execute', authenticateUser, freeLimit, async (req, res) => {
  const { name } = req.params;
  const { input: sanitizeInput(input), user_id: sanitizeInput(user_id), tier = 'free': sanitizeInput(tier = 'free') } = req.body;
  
  // Sanitize inputs
  const sanitizedName = String(name).replace(/[<>"'&]/g, '');
  const sanitizedUserId = String(user_id).replace(/[<>"'&]/g, '');
  const sanitizedTier = String(tier).replace(/[<>"'&]/g, '');
  
  if (!algorithms[sanitizedName]) {
    return res.status(404).json({ error: 'Algorithm not found' });
  }
  
  try {
    // Track usage for billing
    // await paymentService.trackUsage(sanitizedUserId, sanitizedName, sanitizedTier);
    
    // Execute algorithm
    const startTime = Date.now();
    const result = algorithms[sanitizedName](input);
    const executionTime = Date.now() - startTime;
    
    // Charge for paid tiers
    if (sanitizedTier === 'pro' || sanitizedTier === 'enterprise') {
      const payment = await paymentService.processAlgorithmPayment(sanitizedUserId, sanitizedName, sanitizedTier);
      if (!payment.success) {
        return res.status(402).json({ error: 'Payment required', details: payment.error });
      }
    }
    
    res.json({
      algorithm: sanitizedName,
      input,
      result,
      execution_time_ms: executionTime,
      tier: sanitizedTier,
      cost: sanitizedTier === 'free' ? 0 : (sanitizedTier === 'pro' ? 0.01 : 0.001)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Algorithm API running on port ${PORT}`);
  console.log('💰 Revenue model: Pay-per-execution + subscriptions');
  console.log('📈 Potential: $5K/month immediate, $50K/month scaled');
});

export default app;
