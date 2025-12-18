import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const { HTTP_STATUS } = require('./constants');'/
import { HTTP_STATUS } from './constants';

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required environment variables/
// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

// Security middleware/
// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],'/
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));

// Rate limiting/
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint/
app.get('/health', (req, res) => {'/
// Health check endpoint
app.get('/health', (req, res) => {
  }
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes/
app.get('/api/status', (req, res) => {'/
// API routes
app.get('/api/status', (req, res) => {
// API routes
app.get('/api/status', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware/
// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Server error:', err.message);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: message });
});

// 404 handler/
// 404 handler
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  });
  console.log(`Server running on port ${PORT}`);
});

export default app;
