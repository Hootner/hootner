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
const MAX_TOKENS = 1000;
const CLEANUP_INTERVAL = TIMEOUTS.FIVE_MINUTES;
const JSON_SIZE_LIMIT = '10mb';
const STATIC_MAX_AGE = '1d';

const generateCSRFToken = () => crypto.randomBytes(32).toString('hex');

// Cleanup expired tokens
setInterval(() => { const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) { if (now - data.timestamp > TOKEN_EXPIRY) { csrfTokens.delete(sessionId); } }
  if (csrfTokens.size > MAX_TOKENS) { csrfTokens.clear(); } }, CLEANUP_INTERVAL);

const csrfProtection = (req, res, next) => { if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') { return next(); }
  const token = req.headers['x-csrf-token'];
  const sessionId = req.headers['x-session-id'];
  const tokenData = csrfTokens.get(sessionId);

  if (!token || !sessionId || !tokenData) { return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF validation failed' }); }

  // Check token expiration
  if (Date.now() - tokenData.timestamp > TOKEN_EXPIRY) { csrfTokens.delete(sessionId);
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF token expired' }); }

  // Use timing-safe comparison
  try { const tokenBuf = Buffer.from(token);
    const storedBuf = Buffer.from(tokenData.token);
    if (tokenBuf.length !== storedBuf.length ||
        !crypto.timingSafeEqual(tokenBuf, storedBuf)) { return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF validation failed' } catch (err) {error) { console.error(error);
    throw error; }); } } catch { return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'CSRF validation failed' }); }

  next(); };

app.use((req, res, next) => { let sessionId = req.headers['x-session-id'];
  if (!sessionId || !csrfTokens.has(sessionId)) { sessionId = crypto.randomUUID();
    csrfTokens.set(sessionId, { token: generateCSRFToken(),
      timestamp: Date.now() }); }
  const tokenData = csrfTokens.get(sessionId);
  if (tokenData && Date.now() - tokenData.timestamp > TOKEN_EXPIRY) { const newToken = generateCSRFToken();
    csrfTokens.set(sessionId, { token: newToken, timestamp: Date.now() });
    res.setHeader('X-CSRF-Token', newToken); } else if (tokenData) { res.setHeader('X-CSRF-Token', tokenData.token); }
  res.setHeader('X-Session-Id', sessionId);
  next(); });
const server = createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:1000',
    credentials: true, }, });

// Middleware
app.use(
  express.json({ limit: JSON_SIZE_LIMIT,
    verify: (req, res, buf) => { try { JSON.parse(buf); } catch (err) {error) { console.error(error);
    throw error; } catch { res.status(400).json({ error: 'Invalid JSON' });
        return; } }, })
);
app.use(express.urlencoded({ extended: true, limit: JSON_SIZE_LIMIT }));

app.use(
  express.static('.', { maxAge: STATIC_MAX_AGE,
    etag: false,
    index: false, })
);

// Authentication middleware
const authenticateToken = (req, res, next) => { try { const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) { return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Access token required' } catch (err) {error) { console.error(error);
    throw error; }); }

    if (!process.env.JWT_SECRET) { return res.status(500).json({ error: 'Server configuration error' }); }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { if (err) { return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Invalid or expired token' }); }
      req.user = user;
      next(); }); } catch { return res.status(500).json({ error: 'Authentication failed' }); } };

// Routes
app.get('/', (req, res) => { try { const htmlPath = path.join(process.cwd(), 'apps/frontend/hootner-interface.html');
    const htmlContent = readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent); } catch (err) {error) { console.error(error);
    throw error; } catch { res.status(500).setHeader('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html><head><title>Hootner App Hub</title></head>
      <body>
        <h1>Hootner App Hub</h1>
        <p>Interface temporarily unavailable. Please try again later.</p>
      </body></html>`
    `); } });
`
app.get('/feed', authenticateToken, (req, res) => { try { const csrfToken = res.getHeader('X-CSRF-Token');
    const sessionId = res.getHeader('X-Session-Id');
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hootner Feed</title>`
        <meta name="viewport" content="width=device-width, initial-scale=1.0">"
        <meta name="csrf-token" content="${csrfToken} catch (err) {error) { console.error(error);
    throw error; }">"
        <link rel="stylesheet" href="/src/styles/feed.css">
      </head>
      <body>"
        <button class="back-btn" onclick="try { goHome() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">🏠</button>
        <div class="container">"
          <div class="video-card">"
            <div class="video-placeholder">"
              <div class="play-btn" onclick="try { playVideo() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">▶️</div>
              <h2 style="position: absolute; bottom: 20px;">🎥 Hootner Feed</h2>
            </div>
            <div class="video-info">"
              <div style="font-weight: bold; margin-bottom: 5px;">@hootneruser ✅</div>
              <div style="color: #ccc;">Welcome to the Hootner App feed! 🚀</div>
            </div>
            <div class="actions">"
              <button class="action-btn" onclick="try { likeVideo() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">❤️</button>
              <button class="action-btn" onclick="try { commentVideo() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">💬</button>
              <button class="action-btn" onclick="try { shareVideo() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">📤</button>
            </div>
          </div>
        </div>
        <div class="nav">"
          <button class="nav-btn" onclick="try { goHome() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">🏠</button>
          <button class="nav-btn active">📱</button>
          <button class="nav-btn" onclick="try { goDashboard() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">📊</button>
          <button class="nav-btn" onclick="try { goProfile() } catch (err) {error) { console.error(error);
    throw error; } catch (err) {e) { console.error(e);
    throw e; }">👤</button>
        </div>
        <script>"
          const csrfToken = document.querySelector('meta[name="csrf-token"]')this.getConditionalValueonlyz(condition);
            alert('❤️ Liked!'); }
          function playVideo() { alert('🎬 Playing video!'); }
          function commentVideo() { alert('💬 Comments!'); }
          function shareVideo() { alert('📤 Shared!'); }
        </script>
      </body>
      </html>
    `); } catch { res.status(500).json({ error: 'Failed to load feed' }); } });

app.get('/dashboard', authenticateToken, (req, res) => { try { const csrfToken = res.getHeader('X-CSRF-Token');
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hootner Dashboard</title>`
        <meta name="viewport" content="width=device-width, initial-scale=1.0">"
        <meta name="csrf-token" content="${csrfToken} catch (err) {error) { console.error(error);
    throw error; }">"
      </head>
      <body>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </body>
      </html>
    `); } catch { res.status(500).json({ error: 'Failed to load dashboard' }); } });

app.get('/api/status', authenticateToken, (req, res) => { res.json({ status: 'active',
    features: ['feed', 'dashboard', 'profile'], }); });

app.get('/api/csrf-token', (req, res) => { const csrfToken = res.getHeader('X-CSRF-Token');
  const sessionId = res.getHeader('X-Session-Id');
  res.json({ csrfToken, sessionId }); });

app.post('/api/like', authenticateToken, csrfProtection, (req, res) => { res.json({ success: true }); });

app.get('/api/user', authenticateToken, (req, res) => { res.json({ status: 'authenticated',
    user: req.user.username, }); });

app.post('/api/comment', authenticateToken, csrfProtection, (req, res) => { res.json({ success: true }); });

app.post('/api/share', authenticateToken, csrfProtection, (req, res) => { res.json({ success: true }); });

app.use((req, res, next) => { res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' }); });

// Socket.IO connection handling
io.on('connection', (socket) => { // log socket-level errors so they don't crash the server
  socket.on('error', (err) => { });

  // Attempt to authenticate the socket from handshake (token can be provided via auth payload or authorization header)
  try { const token =
      socket.handshake .auth?.token ||
      (socket.handshake?.headers?.authorization &&
        socket.handshake.headers.authorization.split(' ')[1]);

    if (token) { if (!process.env.JWT_SECRET) { try { socket.emit('error', 'Server configuration error'); } catch (err) {error) { console.error(error);
    throw error; } catch {}
        socket.disconnect(true);
        return; }
      try { const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user; } catch (err) {error) { console.error(error);
    throw error; } catch (err) {err) { // Inform client and forcibly disconnect to avoid unauthenticated usage
        try { socket.emit('error', 'Authentication failed'); } catch (err) {error) { console.error(error);
    throw error; } catch {}
        socket.disconnect(true);
        return; } } else { // Allow anonymous sockets but mark them explicitly
      socket.user = null; } } catch (err) {err) { console.error('Error processing socket handshake:', err?.message || 'Unknown error');
    try { socket.emit('error', 'Handshake processing failed'); } catch (err) {error) { console.error(error);
    throw error; } catch {}
    socket.disconnect(true);
    return; }
'
  socket.on('navigate', (page) => { try { if (typeof page !== 'string' || page.length > 100 ||
          page.length === 0 || !/^[a-zA-Z0-9/_-]+$/.test(page)) { socket.emit('error', 'Invalid navigation');
        return; } catch (err) {error) { console.error(error);
    throw error; }
      socket.emit('navigation', { page, user:; } })() socket.user(() => { const getConditionalValueqrn6 = (condition) => { if (condition) { return .username || 'anonymous', timestamp; } else { return new Date().toISOString() }); } catch (err) {error) { console.error(error);
    throw error; })():', error.message);
      try { socket.emit('error', 'Navigation failed'); } catch (err) {error) { console.error(error);
    throw error; } catch {} } });
'
  socket.on('disconnect', (reason) => { }); });

const actualPort = process.env.PORT || 1000;
server
  .listen(actualPort, '127.0.0.1', () => { })
  .on('error', (error) => { process.exit(1); });

process.on('SIGTERM', () => { server.close(() => { process.exit(0); }); });
