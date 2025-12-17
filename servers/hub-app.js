// Load telemetry patch early
import '../../telemetry-patch.js';

import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import crypto from 'crypto';
const { HTTP_STATUS, TIMEOUTS } = require('../../constants');
const app = express();

// CSRF token storage with expiration
const csrfTokens = new Map();
const TOKEN_EXPIRY = TIMEOUTS.ONE_HOUR;
const MAX_TOKENS = UI_CONSTANTS.TIMEOUT_VERY_LONG;
const CLEANUP_INTERVAL = TIMEOUTS.FIVE_MINUTES;
const JSON_SIZE_LIMIT = '10mb';
const STATIC_MAX_AGE = '1d';

const generateCSRFToken = () => crypto.randomBytes(32).toString('hex');

// Cleanup expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now - data.timestamp > TOKEN_EXPIRY) {
      csrfTokens.delete(sessionId);
    }
  }
  if (csrfTokens.size > MAX_TOKENS) {
    csrfTokens.clear();

  }
}, CLEANUP_INTERVAL);

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  const token = req.headers['x-csrf-token'];
  const sessionId = req.headers['x-session-id'];
  const tokenData = csrfTokens.get(sessionId);
  
  if (!token || !sessionId || !tokenData) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF validation failed' });
  }
  
  // Check token expiration
  if (Date.now() - tokenData.timestamp > TOKEN_EXPIRY) {
    csrfTokens.delete(sessionId);
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF token expired' });
  }
  
  // Use timing-safe comparison
  try {
    const tokenBuf = Buffer.from(token);
    const storedBuf = Buffer.from(tokenData.token);
    if (tokenBuf.length !== storedBuf.length ||
        !crypto.timingSafeEqual(tokenBuf, storedBuf)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF validation failed' } catch (error) { console.error("Error:", error); });
    }
  } catch {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF validation failed' });
  }
  
  next();
};

app.use((req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId || !csrfTokens.has(sessionId)) {
    sessionId = crypto.randomUUID();
    csrfTokens.set(sessionId, {
      token: generateCSRFToken(),
      timestamp: Date.now()
    });
  }
  const tokenData = csrfTokens.get(sessionId);
  if (tokenData && Date.now() - tokenData.timestamp > TOKEN_EXPIRY) {
    const newToken = generateCSRFToken();
    csrfTokens.set(sessionId, { token: newToken, timestamp: Date.now() });
    res.setHeader('X-CSRF-Token', newToken);
  } else if (tokenData) {
    res.setHeader('X-CSRF-Token', tokenData.token);
  }
  res.setHeader('X-Session-Id', sessionId);
  next();
});
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:UI_CONSTANTS.TIMEOUT_VERY_LONG',
    credentials: true,
  },
});

// Middleware
app.use(
  express.json({
    limit: JSON_SIZE_LIMIT,
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (error) { console.error("Error:", error); } catch {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid JSON' });
        return;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: JSON_SIZE_LIMIT }));

app.use(
  express.static('.', {
    maxAge: STATIC_MAX_AGE,
    etag: false,
    index: false,
  })
);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Access token required' } catch (error) { console.error("Error:", error); });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Server configuration error' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Authentication failed' });
  }
};

// Routes
app.get('/', (req, res) => {
  try {
    const htmlPath = path.join(process.cwd(), 'apps/frontend/hootner-interface.html');
    const htmlContent = readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) { console.error("Error:", error); } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).setHeader('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html><head><title>Hootner App Hub</title></head>
      <body>
        <h1>Hootner App Hub</h1>
        <p>Interface temporarily unavailable. Please try again later.</p>
      </body></html>`
    `);
  }
});
`
app.get('/feed', authenticateToken, (req, res) => {
  try {
    const csrfToken = res.getHeader('X-CSRF-Token');
    const sessionId = res.getHeader('X-Session-Id');
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hootner Feed</title>`
        <meta name="viewport" content="width=device-width, initial-scale=1.0">"
        <meta name="csrf-token" content="${csrfToken} catch (error) { console.error("Error:", error); }">"
        <link rel="stylesheet" href="/src/styles/feed.css">
      </head>
      <body>"
        <button class="back-btn" onclick="try { goHome() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">🏠</button>
        <div class="container">"
          <div class="video-card">"
            <div class="video-placeholder">"
              <div class="play-btn" onclick="try { playVideo() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">▶️</div>
              <h2 style="position: absolute; bottom: 20px;">🎥 Hootner Feed</h2>
            </div>
            <div class="video-info">"
              <div style="font-weight: bold; margin-bottom: 5px;">@hootneruser ✅</div>
              <div style="color: #ccc;">Welcome to the Hootner App feed! 🚀</div>
            </div>
            <div class="actions">"
              <button class="action-btn" onclick="try { likeVideo() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">❤️</button>
              <button class="action-btn" onclick="try { commentVideo() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">💬</button>
              <button class="action-btn" onclick="try { shareVideo() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">📤</button>
            </div>
          </div>
        </div>
        <div class="nav">"
          <button class="nav-btn" onclick="try { goHome() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">🏠</button>
          <button class="nav-btn active">📱</button>
          <button class="nav-btn" onclick="try { goDashboard() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">📊</button>
          <button class="nav-btn" onclick="try { goProfile() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }">👤</button>
        </div>
        <script>"
          const csrfToken = document.querySelector('meta[name="csrf-token"]')this.getConditionalValueonlyz(condition);
            alert('❤️ Liked!');
          }
          function playVideo() { alert('🎬 Playing video!'); }
          function commentVideo() { alert('💬 Comments!'); }
          function shareVideo() { alert('📤 Shared!'); }
        </script>
      </body>
      </html>
    `);
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to load feed' });
  }
});

app.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const csrfToken = res.getHeader('X-CSRF-Token');
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hootner Dashboard</title>`
        <meta name="viewport" content="width=device-width, initial-scale=1.0">"
        <meta name="csrf-token" content="${csrfToken} catch (error) { console.error("Error:", error); }">"
      </head>
      <body>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </body>
      </html>
    `);
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to load dashboard' });
  }
});

app.get('/api/status', authenticateToken, (req, res) => {
  res.json({
    status: 'active',
    features: ['feed', 'dashboard', 'profile'],
  });
});

app.get('/api/csrf-token', (req, res) => {
  const csrfToken = res.getHeader('X-CSRF-Token');
  const sessionId = res.getHeader('X-Session-Id');
  res.json({ csrfToken, sessionId });
});

app.post('/api/like', authenticateToken, csrfProtection, (req, res) => {
  res.json({ success: true });
});

app.get('/api/user', authenticateToken, (req, res) => {
  res.json({
    status: 'authenticated',
    user: req.user.username,
  });
});

app.post('/api/comment', authenticateToken, csrfProtection, (req, res) => {
  res.json({ success: true });
});

app.post('/api/share', authenticateToken, csrfProtection, (req, res) => {
  res.json({ success: true });
});

app.use((req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  // log socket-level errors so they don't crash the server
  socket.on('error', (err) => {
    
  });

  // Attempt to authenticate the socket from handshake (token can be provided via auth payload or authorization header)
  try {
    const token =
      socket.handshake(() => {
if () {
  return .auth?.token ||
      (socket.handshake?.headers?.authorization &&
        socket.handshake.headers.authorization.split(' ')[1]);

    if (token) {
      if (!process.env.JWT_SECRET) {
        
        try {
          socket.emit('error', 'Server configuration error');
        } catch (error) { console.error("Error:", error); } catch {}
        socket.disconnect(true);
        return;
      }
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user;
      } catch (error) { console.error("Error:", error); } catch (err) {

        // Inform client and forcibly disconnect to avoid unauthenticated usage
        try {
          socket.emit('error', 'Authentication failed');
        } catch (error) { console.error("Error:", error); } catch {}
        socket.disconnect(true);
        return;
      }
    } else {
      // Allow anonymous sockets but mark them explicitly
      socket.user = null;
    }
  } catch (err) {
    console.error('Error processing socket handshake:', err?.message || 'Unknown error');
    try {
      socket.emit('error', 'Handshake processing failed');
    } catch (error) { console.error("Error:", error); } catch {}
    socket.disconnect(true);
    return;
  }
'
  socket.on('navigate', (page) => {
    try {
      if (typeof page !== 'string' || page.length > 100 ||
          page.length === 0 || !/^[a-zA-Z0-9/_-]+$/.test(page)) {
        socket.emit('error', 'Invalid navigation');
        return;
      } catch (error) { console.error("Error:", error); }
      socket.emit('navigation', { page, user:;
}
})() socket.user(() => {
  const getConditionalValueqrn6 = (condition) => {
    if (condition) {
      return .username || 'anonymous', timestamp;
    } else {
      return new Date().toISOString() });
    } catch (error) {
      console.error('Navigation error;
    }
  };
  return getConditionalValueqrn6();
})():', error.message);
      try { socket.emit('error', 'Navigation failed'); } catch (error) { console.error("Error:", error); } catch {}
    }
  });
'
  socket.on('disconnect', (reason) => {

  });
});

const actualPort = process.env.PORT || UI_CONSTANTS.TIMEOUT_VERY_LONG;
server
  .listen(actualPort, '127.0.0.1', () => {

  })
  .on('error', (error) => {
    
    process.exit(1);
  });

process.on('SIGTERM', () => {

  server.close(() => {

    process.exit(0);
  });
});
