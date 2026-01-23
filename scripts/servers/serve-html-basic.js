#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3005;
const UI_ROOT = path.join(__dirname, 'hexarchy/4-interface/ui');
const PAGES_ROOT = path.join(UI_ROOT, 'pages');

const routes = {
  '/': 'dashboard.html',
  '/dashboard': 'dashboard.html',
  '/video-player': 'video-player.html',
  '/cinema-player': 'video-player.html',
  '/login': 'login.html',
  '/profile': 'profile.html',
  '/settings': 'settings.html',
  '/marketplace': 'marketplace.html',
  '/code-editor': 'code-editor.html',
  '/auto-editor': 'auto-editor.html',
  '/ultra-editor': 'ultra-editor.html',
  '/design-showcase': 'design-showcase.html',
  '/ai-video': 'ai-video.html',
  '/live-stream': 'live-stream.html',
  '/analytics': 'analytics.html',
  '/collaboration': 'collaboration.html',
  '/agent-management': 'agent-management.html',
  '/devops-monitoring': 'devops-monitoring.html',
  '/feed-react': 'feed-react.html',
  '/feed': 'feed-react.html',
  '/contact': 'contact.html',
  '/messages': 'messages.html'
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

function safeResolve(root, requestPath) {
  const resolved = path.normalize(path.join(root, requestPath));
  if (!resolved.startsWith(root)) {
    return null; // path traversal attempt
  }
  return resolved;
}

function serveFile(filePath, res) {
  const safeFilePath = path.resolve(filePath);
  fs.stat(safeFilePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(safeFilePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(safeFilePath);
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname || '/';

  // Route mapped pages
  const routeFile = routes[pathname];
  if (routeFile) {
    const pagePath = safeResolve(PAGES_ROOT, routeFile);
    if (pagePath) {
      return serveFile(pagePath, res);
    }
  }

  // Serve static assets under UI root
  const staticPath = safeResolve(UI_ROOT, pathname);
  if (staticPath) {
    return serveFile(staticPath, res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`🦉 HOOTNER Basic Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🎬 Cinema Player: http://localhost:${PORT}/video-player`);
  console.log(`� Social Feed: http://localhost:${PORT}/feed-react`);
  console.log(`💻 Code Editor: http://localhost:${PORT}/code-editor`);
  console.log(`🛒 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`🤝 Collaboration: http://localhost:${PORT}/collaboration`);
  console.log(`🤖 AI Agents: http://localhost:${PORT}/agent-management`);
  console.log(`⚡ DevOps: http://localhost:${PORT}/devops-monitoring`);
  console.log(`📈 Analytics: http://localhost:${PORT}/analytics`);
  console.log(`🎥 AI Video: http://localhost:${PORT}/ai-video`);
  console.log(`📡 Live Stream: http://localhost:${PORT}/live-stream`);
  console.log(`✂️ Auto Editor: http://localhost:${PORT}/auto-editor`);
  console.log(`🎨 Design: http://localhost:${PORT}/design-showcase`);
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`);
  console.log(`👤 Profile: http://localhost:${PORT}/profile`);
  console.log(`💬 Messages: http://localhost:${PORT}/messages`);
  console.log(`📞 Contact: http://localhost:${PORT}/contact`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
});
