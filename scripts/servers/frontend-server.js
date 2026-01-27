import express from 'express';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const uiPagesDir = path.join(projectRoot, 'hexarchy/4-interface/ui/pages');
const uiFrontendPagesDir = path.join(projectRoot, 'hexarchy/4-interface/ui/frontend/html-pages');
const legacyPagesDir = path.join(projectRoot, 'apps/frontend/html-pages');

const app = express();
const PORT = process.env.PORT || 3000;
const stripeApiKey = process.env.STRIPE_API_KEY || '';
const stripe = stripeApiKey ? new Stripe(stripeApiKey) : null;
const usageDir = path.join(__dirname, 'data', 'usage');
const usageFile = path.join(usageDir, 'algorithm-usage.json');
const subscriptionDir = path.join(__dirname, 'data', 'subscriptions');
const subscriptionMapFile = path.join(subscriptionDir, 'subscription-map.json');
if (!fs.existsSync(usageDir)) {
  fs.mkdirSync(usageDir, { recursive: true });
}
if (!fs.existsSync(usageFile)) {
  fs.writeFileSync(usageFile, JSON.stringify({}), 'utf-8');
}
if (!fs.existsSync(subscriptionDir)) {
  fs.mkdirSync(subscriptionDir, { recursive: true });
}
if (!fs.existsSync(subscriptionMapFile)) {
  fs.writeFileSync(subscriptionMapFile, JSON.stringify({}), 'utf-8');
}

function readUsage() {
  try {
    const raw = fs.readFileSync(usageFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeUsage(store) {
  try {
    fs.writeFileSync(usageFile, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    /* noop */
  }
}

function readSubscriptionMap() {
  try {
    const raw = fs.readFileSync(subscriptionMapFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function nowKeys() {
  const d = new Date();
  const day = d.toISOString().slice(0, 10);
  const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return { day, month };
}

function getTierLimits(tier) {
  if (tier === 'pro') return { day: Infinity, month: 1000 };
  if (tier === 'enterprise') return { day: Infinity, month: Infinity };
  return { day: 10, month: Infinity };
}

async function recordStripeUsage(subscriptionItemId) {
  if (!stripe || !subscriptionItemId) return;
  try {
    await stripe.usageRecords.create({
      subscription_item: subscriptionItemId,
      quantity: 1,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment'
    });
  } catch {
    /* noop */
  }
}

// Security middleware with enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS: allow configured origins (comma-separated). Defaults to same-origin.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input validation middleware
const validateInput = (req, res, next) => {
  const { body } = req;

  // Sanitize input to prevent XSS
  if (body && typeof body === 'object') {
    const sanitizedBody = {};
    for (const key in body) {
      if (typeof body[key] === 'string') {
        let sanitizedValue = body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        sanitizedValue = sanitizedValue.replace(/javascript:/gi, '');
        sanitizedValue = sanitizedValue.replace(/on\w+=/gi, '');
        sanitizedBody[key] = sanitizedValue;
      } else {
        sanitizedBody[key] = body[key];
      }
    }
    req.body = sanitizedBody;
  }
  next();
};

app.use(validateInput);

// Static files
app.use(express.static('public'));
app.use('/assets', express.static(path.join(projectRoot, 'hexarchy/4-interface/ui/assets')));
app.use('/ui-pages', express.static(uiPagesDir));
app.use('/ui-frontend-pages', express.static(uiFrontendPagesDir));
app.use('/legacy-pages', express.static(legacyPagesDir));

// Service integration endpoints
const services = {
  ai: { status: 'running', port: 5001 },
  payment: { status: 'running', port: 5002 },
  video: { status: 'running', port: 5003 },
  analytics: { status: 'running', port: 5004 }
};

// Main application route
app.get('/', (req, res) => {
  const GRAPHQL_URL = process.env.GRAPHQL_URL || '/graphql';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HOOTNER - Enterprise Video Platform</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .status { display: flex; gap: 20px; margin: 20px 0; }
        .service { padding: 10px; border-radius: 4px; background: #e8f5e8; }
        .service.error { background: #ffe8e8; }
        h1 { color: #333; }
        .links a { display: inline-block; margin: 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🦉 HOOTNER</h1>
        <p>The Owl Never Sleeps - Enterprise Video Streaming Platform</p>

        <h3>Service Status</h3>
        <div class="status">
          <div class="service">AI Services: ✓</div>
          <div class="service">Payment: ✓</div>
          <div class="service">Video Processing: ✓</div>
          <div class="service">Analytics: ✓</div>
        </div>

        <div class="links">
          <a href="/dashboard">Dashboard</a>
          <a href="/video-player">Video Player</a>
          <a href="${GRAPHQL_URL}" target="_blank">GraphQL API</a>
          <a href="/api/health">Health Check</a>
          <a href="/cinema-player">Cinema Player</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Business logic endpoints
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: services,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  };
  res.json(health);
});

// User management
app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Business logic: Create user
    const user = {
      id: Date.now().toString(),
      email,
      name,
      subscription: 'free',
      createdAt: new Date().toISOString()
    };

    console.log('Creating user:', email);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Video management
app.post('/api/videos', async (req, res) => {
  try {
    const { title, userId } = req.body;

    // Business logic: Process video upload
    const video = {
      id: Date.now().toString(),
      title,
      status: 'processing',
      userId,
      createdAt: new Date().toISOString()
    };

    console.log('Processing video:', title);
    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Payment processing
app.post('/api/payments', async (req, res) => {
  try {
    const { userId, amount, currency } = req.body;

    // Business logic: Process payment
    const payment = {
      id: 'pay_' + Date.now() + '',
      userId,
      amount,
      currency,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    console.log(`Payment processed: $${amount} ` + currency + '');
    res.json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  const analytics = {
    totalUsers: 1250,
    totalVideos: 3400,
    revenue: 125000.50,
    activeStreams: 45,
    timestamp: new Date().toISOString()
  };
  res.json(analytics);
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/dashboard.html'));
});

// Video player route
app.get('/video-player', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/video-player.html'));
});

// Cinema player route with fallback
app.get('/cinema-player', (req, res) => {
  const preferred = path.join(uiFrontendPagesDir, 'cinema-player.html');
  const fallback = path.join(legacyPagesDir, 'cinema-player.html');
  if (fs.existsSync(preferred)) return res.sendFile(preferred);
  if (fs.existsSync(fallback)) return res.sendFile(fallback);
  return res.status(404).send('cinema-player.html not found');
});

// Config page (legacy support)
app.get('/config', (req, res) => {
  const legacy = path.join(legacyPagesDir, 'config.html');
  if (fs.existsSync(legacy)) return res.sendFile(legacy);
  return res.status(404).send('config.html not found');
});

// Algorithm Marketplace endpoints
const AVAILABLE_ALGORITHMS = ['sum', 'reverse', 'uppercase', 'length'];

app.get('/api/algorithms', (req, res) => {
  res.json({ available_algorithms: AVAILABLE_ALGORITHMS });
});

app.get('/api/algorithms/usage', (req, res) => {
  const userId = String(req.query.user_id || '');
  if (!userId) return res.status(400).json({ success: false, error: 'Missing user_id' });
  const store = readUsage();
  const usage = store[userId] || {};
  res.json({ success: true, usage });
});

app.post('/api/algorithms/:id/execute', (req, res) => {
  try {
    const algoId = req.params.id;
    const { input, user_id, tier, subscription_item_id } = req.body || {};

    if (!AVAILABLE_ALGORITHMS.includes(algoId)) {
      return res.status(400).json({ success: false, error: 'Unknown algorithm' });
    }

    if (!user_id || !tier) {
      return res.status(400).json({ success: false, error: 'Missing user or tier' });
    }

    const limits = getTierLimits(tier);
    const store = readUsage();
    const keys = nowKeys();
    const userUsage = store[user_id] || { day: keys.day, dayCount: 0, month: keys.month, monthCount: 0 };
    if (userUsage.day !== keys.day) userUsage.day = keys.day, userUsage.dayCount = 0;
    if (userUsage.month !== keys.month) userUsage.month = keys.month, userUsage.monthCount = 0;
    if (userUsage.dayCount + 1 > limits.day) {
      return res.status(429).json({ success: false, error: 'Daily execution limit reached' });
    }
    if (userUsage.monthCount + 1 > limits.month) {
      return res.status(429).json({ success: false, error: 'Monthly execution limit reached' });
    }

    let result;
    switch (algoId) {
      case 'sum': {
        if (!Array.isArray(input)) {
          return res.status(400).json({ success: false, error: 'Input must be an array for sum' });
        }
        const nums = input.map((v) => Number(v));
        if (nums.some((n) => Number.isNaN(n))) {
          return res.status(400).json({ success: false, error: 'Array must contain only numbers' });
        }
        result = nums.reduce((a, b) => a + b, 0);
        break;
      }
      case 'reverse': {
        if (typeof input !== 'string') {
          return res.status(400).json({ success: false, error: 'Input must be a string for reverse' });
        }
        result = input.split('').reverse().join('');
        break;
      }
      case 'uppercase': {
        if (typeof input !== 'string') {
          return res.status(400).json({ success: false, error: 'Input must be a string for uppercase' });
        }
        result = input.toUpperCase();
        break;
      }
      case 'length': {
        if (typeof input === 'string' || Array.isArray(input)) {
          result = input.length;
        } else if (input && typeof input === 'object') {
          result = Object.keys(input).length;
        } else {
          result = 0;
        }
        break;
      }
      default:
        return res.status(400).json({ success: false, error: 'Algorithm not implemented' });
    }

    userUsage.dayCount += 1;
    userUsage.monthCount += 1;
    store[user_id] = userUsage;
    writeUsage(store);

    const map = readSubscriptionMap();
    const subItem = subscription_item_id || map[user_id];
    recordStripeUsage(subItem);

    return res.json({ success: true, result, usage: userUsage });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Execution error' });
  }
});

// Dynamic page route: serve by name from known folders
app.get('/page/:name', (req, res) => {
  const nameRaw = String(req.params.name || '');
  const name = nameRaw.toLowerCase();
  if (!/^[a-z0-9-]+$/.test(name)) {
    return res.status(400).send('Invalid page name');
  }
  const file = `${name}.html`;
  const candidates = [
    path.join(uiPagesDir, file),
    path.join(uiFrontendPagesDir, file),
    path.join(legacyPagesDir, file),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return res.sendFile(candidate);
  }
  return res.status(404).send(`${file} not found`);
});

// Error handling middleware
app.use((error, req, res) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log('🚀 Frontend server running on http://localhost:' + PORT + '');
  console.log('📊 Health check: http://localhost:' + PORT + '/api/health');
  console.log('📈 Analytics: http://localhost:' + PORT + '/api/analytics');
});
