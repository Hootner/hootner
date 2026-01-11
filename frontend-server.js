const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HOOTNER - Enterprise Video Platform</title>
    </head>
    <body>
      <h1>🦉 HOOTNER</h1>
      <p>The Owl Never Sleeps - Enterprise Video Streaming Platform</p>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Frontend app running on http://localhost:${PORT}`);
});