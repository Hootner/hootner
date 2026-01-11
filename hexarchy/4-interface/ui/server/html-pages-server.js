import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/utils', express.static(path.join(__dirname, '../utils')));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/video-player.html'));
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  
  // Validate page parameter to prevent path traversal
  if (!/^[a-zA-Z0-9-_]+$/.test(page)) {
    return res.status(400).send('Invalid page name');
  }
  
  const filePath = path.resolve(__dirname, '../pages', `${page}.html`);
  const pagesDir = path.resolve(__dirname, '../pages');
  
  // Ensure the resolved path is within the pages directory
  if (!filePath.startsWith(pagesDir)) {
    return res.status(403).send('Access denied');
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Page not found');
  }
  
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});