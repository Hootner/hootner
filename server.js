// Constants imported
import { ONE_MINUTE_MS } from '../../constants/timeouts.js';

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import { HTTP_STATUS, TIMEOUTS, CACHE, LIMITS } from './constants/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { schemas, validate } from './middleware/validation.js';
import { config } from './config/app-config.js';
import logger from './lib/logger.js';
import { rateLimiters } from './middleware/rate-limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = config.server.port;

// Validate required environment variables/
const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) { logger.error('Critical environment variables missing', { count: missingVars.length, });
  process.exit(1); }

// Validate secret strength/
if (process.env.JWT_SECRET.length < 32 || process.env.SESSION_SECRET.length < 32) { logger.error('Secrets must be at least 32 characters');
  process.exit(1); }

// Security middleware/
app.use(
  helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], }, },
    hsts: { maxAge: TIMEOUTS.ONE_YEAR_SECONDS,
      includeSubDomains: true,
      preload: true, },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, })
);

app.use('/api/', rateLimiters.api);

app.use(
  cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, })
);
app.use(express.json({ limit: config.server.jsonLimit }));
app.use(express.urlencoded({ extended: false, limit: config.server.jsonLimit }));

// Compression with brotli/gzip (76% bandwidth reduction)/
import compression from 'compression';
app.use(
  compression({ level: config.server.compressionLevel,
    threshold: config.server.compressionThreshold, })
);

// Session-based CSRF protection/
import session from 'express-session';
app.use(
  session({ secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: config.server.sessionMaxAge, }, })
);

const { doubleCsrfProtection } = doubleCsrf({ getSecret: () => process.env.SESSION_SECRET,
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: { httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', }, });
app.use(doubleCsrfProtection);
app.use(express.static('public'));

// Create uploads directory/
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) { try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (error) { logger.error('Failed to create uploads directory', { error: error.message });
    process.exit(1); } }

// ETag for caching/
app.set('etag', 'strong');

// Secure file validation/
const validateFile = (file) => { const allowedTypes = /\.(mp4|webm|ogg|avi|mov)$/i;
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'];

  if (!allowedTypes.test(file.originalname) || !allowedMimes.includes(file.mimetype)) { throw new Error('Invalid file type'); }

  // Prevent null byte injection/
  if (file.originalname.includes('\0')) { throw new Error('Invalid filename'); }

  // Sanitize filename - allow only safe characters/
  const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized.substring(0, config.server.maxFilenameLength); };

// Multer configuration with security/
const storage = multer.diskStorage({ destination: (req, file, cb) => { cb(null, uploadsDir); },
  filename: (req, file, cb) => { try { const sanitizedName = validateFile(file);
      cb(null, Date.now() + '-' + sanitizedName); } catch (error) { cb(error); } }, });

const upload = multer({ storage,
  limits: { fileSize: config.server.maxFileSize,
    files: config.server.maxFiles, },
  fileFilter: (req, file, cb) => { try { validateFile(file);
      cb(null, true); } catch (error) { cb(error, false); } }, });

// Static file caching with ETags/
app.use(
  '/uploads',
  express.static(uploadsDir, { maxAge: config.server.uploadsMaxAge,
    etag: true,
    lastModified: true,
    immutable: true,
    setHeaders: (res) => res.set('Cache-Control', `public, max-age=${CACHE.ONE_DAY}, immutable`), })
);
app.use(
  express.static('public', { maxAge: config.server.staticMaxAge,
    etag: true,
    setHeaders: (res) => res.set('Cache-Control', `public, max-age=${CACHE.ONE_HOUR}`), })
);

// API Routes/
import { authenticateJWT, authorize } from './middleware/auth.js';

app.post(
  '/api/upload',
  rateLimiters.upload,
  authenticateJWT,
  authorize('user', 'admin'),
  doubleCsrfProtection,
  upload.single('video'),
  async (req, res) => { let filePath;
    try { if (!req.file) { return res.status(400).json({ error: 'No file uploaded' }); }

      filePath = path.join(uploadsDir, req.file.filename);
      if (!fs.existsSync(filePath)) { logger.error('File upload verification failed', { ip: req.ip });
        return res.status(500).json({ error: 'Upload verification failed' }); }

      res.json({ message: 'Video uploaded successfully',
        path: `/uploads/${req.file.filename}`,
        filename: req.file.filename, }); } catch (error) { logger.error('Upload failed', { error: error.message, ip: req.ip });
      if (filePath) { try { if (fs.existsSync(filePath)) { await fs.promises.unlink(filePath); } } catch (cleanupError) { logger.error('Failed to cleanup file', { error: cleanupError.message }); } }
      res.status(500).json({ error: 'Upload failed' }); } }
);

app.get('/api/videos', async (req, res) => { try { const files = await fs.promises.readdir(uploadsDir);
    const videos = files
      .filter((file) => file.match(/\.(mp4|webm|ogg|avi|mov)$/i))
      .map((file) => ({ id: index + 1,
        title: file.replace(/\.[^/.]+$/, ''),
        duration: 'Unknown',
        src: `/uploads/${file}`,
        poster: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjNDQ0Ii8+Cjx0ZXh0IHg9IjEyOCIgeT0iMTkyIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+VXBsb2FkZWQ8L3RleHQ+Cjwvc3ZnPg===',
        quality: { low: `/uploads/${file}`,
          medium: `/uploads/${file}`,
          high: `/uploads/${file}`,
          '8k': `/uploads/${file}`, }, }));

    res.json(videos); } catch (error) { logger.error('Failed to read videos', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve videos' }); } });

app.get('/api/download', authenticateJWT, validate({ url: schemas.string(1, 200) }), async (req, res) => { const { url } = req.query;

  if (typeof url !== 'string' || /%2e|%2f/i.test(url)) { logger.warn('Invalid URL encoding detected', { url, ip: req.ip });
    return res.status(400).json({ error: 'Invalid URL' }); }

  const decodedUrl = decodeURIComponent(url);
  const filename = path.basename(decodedUrl).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!filename || filename.includes('..') || filename.startsWith('.') || filename.length > LIMITS.MAX_STRING_LENGTH) { logger.warn('Invalid download attempt', { url, ip: req.ip });
    return res.status(400).json({ error: 'Invalid filename' }); }

  const normalizedUploadsDir = path.resolve(uploadsDir);
  const normalizedFilePath = path.resolve(normalizedUploadsDir, filename);

  if (!normalizedFilePath.startsWith(normalizedUploadsDir + path.sep)) { logger.warn('Path traversal attempt blocked', { filename, ip: req.ip });
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied' }); }

  try { const stats = await fs.promises.stat(normalizedFilePath);
    if (!stats.isFile()) { return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied' }); } } catch (err) { if (err) { logger.warn('File access error', { error: err.message, filename, ip: req.ip }); }
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'File not found' }); }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  streamResponse(normalizedFilePath, res); });

// Serve HOOTNER app/
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'electron-code-editor/index.html')); });

// Health check endpoint/
app.get('/health', (req, res) => { res.status(HTTP_STATUS.OK).json({ status: 'healthy', timestamp: new Date().toISOString() }); });

import { setupGracefulShutdown } from './lib/graceful-shutdown.js';
import MemoryOptimizer from './lib/memory-optimizer.js';
import { streamResponse } from './lib/stream-utils.js';

const memoryOpt = new MemoryOptimizer({ threshold: 100 * 1024 * 1024, maxCacheSize: 50 });
memoryOpt.start();

const server = app
  .listen(PORT, '::', () => { logger.info('HOOTNER Server started', { port: PORT, ipv4: `http://localhost:${PORT}`, ipv6: `http://[::1]:${PORT}` }); })
  .on('error', (err) => { if (err) { logger.error('Failed to start HOOTNER server', { error: err });
      process.exit(1); } });

setupGracefulShutdown(server, 'HOOTNER', { cleanup: [() => memoryOpt.stop()], });