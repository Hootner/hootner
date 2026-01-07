const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => { let filePath = '.' + req.url;
  if (filePath === './') {filePath = './ultra-editor.html';}
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = { '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json' };

  const contentType = mimeTypes[extname] || 'application/octet-stream';
  fs.readFile(filePath, (error, content) => { if (error) { res.writeHead(UI_CONSTANTS.HTTP_NOT_FOUND);
      res.end('File not found'); } else { res.writeHead(UI_CONSTANTS.HTTP_OK, { 'Content-Type': contentType });
      res.end(content, 'utf-8'); } }); });

server.listen(UI_CONSTANTS.DEFAULT_PORT, () => { });