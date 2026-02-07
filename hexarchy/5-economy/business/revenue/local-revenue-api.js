#!/usr/bin/env node

/**
 * Local Revenue API - Start Earning Without AWS Setup
 * Deploy locally first, migrate to AWS later
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = 3020;

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.sessionId = crypto.randomUUID();
  next();
};

// Input sanitization
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

// Usage tracking (local file)
const trackUsage = (userId, algorithm, result) => {
  // Sanitize userId
  userId = String(userId).replace(/[<>"'&]/g, '');
  algorithm = String(algorithm).replace(/[<>"'&]/g, '');
  
  const usage = {
    id: crypto.randomUUID(),
    userId,
    algorithm,
    result,
    timestamp: Date.now(),
    revenueImpact: `+$${result * 100}/month`
  };
  
  const logFile = 'revenue-usage.json';
  let logs = [];
  
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  }
  
  logs.push(usage);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  
  return usage;
};

// Revenue algorithms
const algorithms = {
  price_optimize: (params) => params.price * 1.15,
  conversion_boost: (params) => params.rate * 1.25,
  revenue_forecast: (params) => params.current * 1.3,
  dynamic_pricing: (params) => params.base_price * (1 + params.demand * 0.3),
  churn_prediction: (params) => 1 / (1 + Math.exp(-(params.engagement - 0.5)))
};

// Algorithm API endpoint
app.post('/algorithm/:algorithm', authenticateRequest, sanitizeInput, (req, res) => {
  const { algorithm } = req.params;
  const { user_id = 'anonymous', params = {} } = req.body;
  
  // Sanitize algorithm parameter
  const sanitizedAlgorithm = String(algorithm).replace(/[<>"'&]/g, '');
  
  if (!algorithms[sanitizedAlgorithm]) {
    return res.status(404).json({ error: 'Algorithm not found' });
  }
  
  const result = algorithms[sanitizedAlgorithm](params);
  const usage = trackUsage(user_id, sanitizedAlgorithm, result);
  
  res.json({
    success: true,
    algorithm: sanitizedAlgorithm,
    result,
    revenue_impact: usage.revenueImpact,
    upgrade_url: 'http://localhost:3020/upgrade',
    message: 'Free tier - upgrade for unlimited access',
    sessionId: req.sessionId
  });
});

// Usage dashboard
app.get('/dashboard', (req, res) => {
  let usage = [];
  if (fs.existsSync('revenue-usage.json')) {
    usage = JSON.parse(fs.readFileSync('revenue-usage.json', 'utf8'));
  }
  
  const stats = {
    total_calls: usage.length,
    unique_users: new Set(usage.map(u => u.userId)).size,
    algorithms_used: new Set(usage.map(u => u.algorithm)).size,
    potential_revenue: usage.length * 0.10, // $0.10 per call
    recent_usage: usage.slice(-10)
  };
  
  res.json(stats);
});

// Upgrade page
app.get('/upgrade', (req, res) => {
  res.send(`
    <h1>HOOTNER Algorithm API - Upgrade</h1>
    <h2>Current Usage: ${fs.existsSync('revenue-usage.json') ? JSON.parse(fs.readFileSync('revenue-usage.json')).length : 0} calls</h2>
    
    <h3>Pricing Plans:</h3>
    <ul>
      <li><strong>Starter:</strong> $29/month - 10,000 calls</li>
      <li><strong>Pro:</strong> $99/month - 100,000 calls</li>
      <li><strong>Enterprise:</strong> $499/month - Unlimited calls</li>
    </ul>
    
    <h3>Payment Options:</h3>
    <ul>
      <li>PayPal: paypal.me/hootner</li>
      <li>Bitcoin: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</li>
      <li>Bank Transfer: Contact for details</li>
    </ul>
    
    <p><a href="/dashboard">View Usage Dashboard</a></p>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', algorithms: Object.keys(algorithms) });
});

app.listen(PORT, () => {
  console.log(`🚀 HOOTNER Revenue API running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`💰 Upgrade: http://localhost:${PORT}/upgrade`);
  console.log(`\n💡 Test API:`);
  console.log(`curl -X POST http://localhost:${PORT}/algorithm/price_optimize -H "Content-Type: application/json" -d '{"params": {"price": 100}}'`);
});

export default app;