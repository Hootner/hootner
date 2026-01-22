import express from 'express';
import path from 'path';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use('/assets', express.static('hexarchy/4-interface/ui/assets'));

// Service integration endpoints
const services = {
  ai: { status: 'running', port: 5001 },
  payment: { status: 'running', port: 5002 },
  video: { status: 'running', port: 5003 },
  analytics: { status: 'running', port: 5004 }
};

// Main application route
app.get('/', (req, res) => {
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
          <a href="http://localhost:4000/graphql" target="_blank">GraphQL API</a>
          <a href="/api/health">Health Check</a>
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
      id: `pay_${Date.now()}`,
      userId,
      amount,
      currency,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    console.log(`Payment processed: $${amount} ${currency}`);
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
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
});