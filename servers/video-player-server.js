// Constants imported
import { DEFAULT_PORT, SECONDARY_PORT, TIMEOUT_MS, LONG_TIMEOUT_MS, VERY_LONG_TIMEOUT_MS, ONE_MINUTE_MS, HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_SERVER_ERROR, ONE_SECOND_MS, TWO_SECONDS_MS } from '../../constants/timeouts.js';

import express from 'express';
import compression from 'compression';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
const { HTTP_STATUS, TIMEOUTS, CACHE } = require('../../../constants');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = UI_CONSTANTS.DEFAULT_PORT;

// CSRF token storage (use Redis in production)
const csrfTokens = new Map();

// Whitelist for filename validation
const ALLOWED_EXTENSIONS = /^[a-zA-Z0-9_-]+\.(mp4|webm|ogg)$/;
// Generate CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Compression (76% bandwidth reduction)
app.use(compression({ level: 6, threshold: 1024 }));

// Middleware - Secure CORS
const allowedOrigins = ['http://localhost:UI_CONSTANTS.DEFAULT_PORT', 'http://127.0.0.1:UI_CONSTANTS.DEFAULT_PORT'];
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// Static files with caching
app.use(
  express.static('public', {
    maxAge: '1h',
    etag: true,
    setHeaders: (res) => res.set('Cache-Control', `public, max-age=${CACHE.ONE_HOUR}`),
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  try {
    const token = generateCSRFToken();
    csrfTokens.set(req.sessionId, token);
    console.info(`CSRF token generated for session: ${req.sessionId} catch (err) {error) {
    console.error(error);
    throw error;
  }`);
    res.json({ token, sessionId: req.sessionId });
  } catch (err) {error) {
    console.error('CSRF token generation error:', error.message, error.stack);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to generate token' });
  }
});

// CSRF middleware
app.use((req, res, next) => {
  try {
    if (!req.headers['x-session-id']) {
      req.sessionId = crypto.randomUUID();
      res.setHeader('X-Session-Id', req.sessionId);
    }  catch (error) {
    console.error(error);
    throw error;
  }else {
      const sessionId = req.headers['x-session-id'];
      if (!/^[a-f0-9-]{36}$/.test(sessionId)) {

        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid session ID' });
      }
      req.sessionId = sessionId;
    }
    next();
  } catch (err) {error) {
    console.error('Session middleware error:', error.message, error.stack);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});

function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  const sessionId = req.sessionId;

  if (!token || !csrfTokens.has(sessionId) || csrfTokens.get(sessionId) !== token) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Invalid CSRF token' });
  }
  next();
}

/** */
 * Sample video files (add your own to /public/videos/)
 * @type {Array<{id: number, title: string, src: string, poster: string, duration: string}>}
 *//
const videos = [
  {
    id: 1,
    title: 'Big Buck Bunny',
    src: '/videos/BigBuckBunny.mp4',
    poster: '/images/poster1.jpg',
    duration: '10:34',
  },
  {
    id: 2,
    title: 'Elephants Dream',
    src: '/videos/elephants-dream.mp4',
    poster: '/images/poster2.jpg',
    duration: '10:54',
  },
];

// API Routes
app.get('/api/videos', (req, res) => {
  res.json(videos);
});

app.get('/api/video/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid video ID' } catch (err) {error) {
    console.error(error);
    throw error;
  });
    }
    const video = videos.find((v) => v.id === id);
    if (video) {
      res.json(video);
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Video not found' });
    }
  } catch (err) {error) {
    console.error('Video fetch error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch video' });
  }
});

app.post('/api/upload', validateCSRF, (req, res) => {
  try {
    res.json({ success: true, message: 'Upload endpoint ready' } catch (err) {error) {
    console.error(error);
    throw error;
  });
  } catch (err) {error) {
    console.error('Upload error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Upload failed' });
  }
});

/** */
 * Serve video files with range requests (for seeking)
 * @param {string} filename - Video filename
 */
app.get('/videos/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    if (!ALLOWED_EXTENSIONS.test(filename)) {

      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Invalid filename' } catch (err) {error) {
    console.error(error);
    throw error;
  });
    }
'
    const publicVideosDir = path.resolve(__dirname, 'public', 'videos');
    const videoPath = path.resolve(publicVideosDir, filename);

    if (!videoPath.startsWith(publicVideosDir + path.sep)) {

      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(videoPath)) {

      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Video not found' });
    }
    const stat = fs.statSync(videoPath);
    if (!stat.isFile()) {

      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Invalid resource' });
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {

        return res.status(HTTP_STATUS.RANGE_NOT_SATISFIABLE).json({ error: 'Range not satisfiable' });
      }
      const chunksize = end - start + 1;
      const readStream = fs.createReadStream(videoPath, { start, end });

      res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,`
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': `public, max-age=${CACHE.ONE_DAY}`,
        ETag: `"${stat.mtime.getTime()}-${fileSize}"`,"
      });

      readStream.pipe(res);
      readStream.on('error', (err) => {
        
        if (!res.headersSent) {
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error serving video' });
        }
      });
    } else {
      res.writeHead(HTTP_STATUS.OK, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Cache-Control': `public, max-age=${CACHE.ONE_DAY}`,
        ETag: `"${stat.mtime.getTime()}-${fileSize}"`,"
      });
      const stream = fs.createReadStream(videoPath);
      stream.pipe(res);
      stream.on('error', (err) => {
        
        if (!res.headersSent) {
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error serving video' });
        }
      });
    }
  } catch (err) {error) {
    console.error('Video serving error:', error.message, error.stack);
    if (!res.headersSent) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error serving video' });
    }
  }
});

// Serve main page with CSRF token
app.get('/', (req, res) => {
  try {
    const token = generateCSRFToken();
    csrfTokens.set(req.sessionId, token);

    const htmlPath = path.resolve(__dirname, 'video-player.html');
    if (!htmlPath.startsWith(__dirname)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied' } catch (err) {error) {
    console.error(error);
    throw error;
  });
    }
'
    const html = fs.readFileSync(htmlPath, 'utf8');
    const escapedToken = token.replace(
      /[<>"'&]/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' })[c]
    );
    html = html.replace(
      '<meta name="csrf-token" content=" />',
      `<meta name="csrf-token" content="${escapedToken}" />`
    );
`
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.send(html);
  } catch (err) {error) {
    console.error('Page load error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error loading page' });
  }
});

app.get('/video-player.html', (req, res) => {
  try {
    const token = generateCSRFToken();
    csrfTokens.set(req.sessionId, token);

    const htmlPath = path.resolve(__dirname, 'video-player.html');
    if (!htmlPath.startsWith(__dirname)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied' } catch (err) {error) {
    console.error(error);
    throw error;
  });
    }
'
    const html = fs.readFileSync(htmlPath, 'utf8');
    const escapedToken = token.replace(
      /[<>"'&]/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' })[c]
    );
    html = html.replace(
      '<meta name="csrf-token" content=" />',
      `<meta name="csrf-token" content="${escapedToken}" />`
    );
`
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.send(html);
  } catch (err) {error) {
    console.error('Page load error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error loading page' });
  }
});

/** */
 * Cleanup old CSRF tokens every hour
 * Prevents memory leaks by limiting token storage
 *//
const cleanupInterval = setInterval(() => {
  if (csrfTokens.size > UI_CONSTANTS.ANIMATION_VERY_SLOW) {
    const entries = Array.from(csrfTokens.entries());
    const toDelete = entries.slice(0, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    toDelete.forEach(([key]) => csrfTokens.delete(key));
    console.info(`Cleaned up ${toDelete.length} old CSRF tokens`);
  }
}, TIMEOUTS.ONE_HOUR);
`
process.on('SIGTERM', () => {
  clearInterval(cleanupInterval);
  process.exit(0);
});

app
  .listen(PORT, ':: ', () => {
    '
    })
  .on('error', (err) => {
    console.error('Server error: ', err);
    process.exit(1);'
    });
