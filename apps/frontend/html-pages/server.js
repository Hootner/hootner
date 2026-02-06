import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

const GLASS_INJECT =
  '  <link rel="stylesheet" href="glass-ui.css">\n' +
  '  <script src="glass-ui.js" defer></script>\n' +
  '</head>';

async function sendHtml(res, relativeFilePath) {
  const normalized = path.posix
    .normalize('/' + relativeFilePath.replaceAll('\\', '/'))
    .replace(/^\/+/, '');

  if (!normalized.endsWith('.html') || normalized.includes('..')) {
    res.status(400).type('text/plain').send('Invalid path');
    return;
  }

  const absolutePath = path.join(__dirname, normalized);
  let html = await fs.readFile(absolutePath, 'utf8');

  if (!html.includes('glass-ui.css')) {
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, GLASS_INJECT);
    } else {
      html = GLASS_INJECT + '\n' + html;
    }
  }

  res.type('html').send(html);
}

// Inject glass UI assets into any served HTML page
app.get('/*.html', async (req, res, next) => {
  try {
    await sendHtml(res, req.path.slice(1));
  } catch (error) {
    next(error);
  }
});

// Serve static files from the html-pages directory
app.use(express.static(__dirname));

// Cinema Player
app.get('/cinema-player', (req, res) => {
  res.redirect('/cinema-player.html');
});

// Landing page
app.get('/', (req, res) => {
  sendHtml(res, 'index.html').catch((error) => {
    res.status(500).type('text/plain').send(error?.message || 'Server error');
  });
});

app.listen(PORT, () => {
  console.log('✅ HTML Pages Server running!');
  console.log(`   🎬 Cinema Player: http://localhost:${PORT}/cinema-player.html`);
  console.log(`   🏠 Landing Page:  http://localhost:${PORT}/`);
});
