#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3005;

const server = http.createServer((req, res) => {
  const pagesRoot = path.join(__dirname, 'hexarchy/4-interface/ui/pages');
  
  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(pagesRoot, 'dashboard.html');
  } else {
    const cleanPath = req.url.split('?')[0];
    filePath = path.join(pagesRoot, cleanPath.endsWith('.html') ? cleanPath : cleanPath + '.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🦉 HOOTNER Landing Page: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🎬 Video Player: http://localhost:${PORT}/video-player`);
  console.log(`🎥 AI Video: http://localhost:${PORT}/ai-video`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log('\nPress Ctrl+C to stop\n');
});

// Keep server alive
process.on('SIGINT', () => {
  console.log('\n🛑 Server stopped');
  server.close();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});

// Prevent process from exiting
setInterval(() => {}, 1000);
