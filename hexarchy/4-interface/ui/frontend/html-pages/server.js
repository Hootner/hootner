import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Serve static files from the html-pages directory
app.use(express.static(__dirname));

// Cinema Player
app.get('/cinema-player', (req, res) => {
    res.sendFile(path.join(__dirname, 'cinema-player.html'));
});

// Landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ HTML Pages Server running!`);
    console.log(`   🎬 Cinema Player: http://localhost:${PORT}/cinema-player.html`);
    console.log(`   🏠 Landing Page:  http://localhost:${PORT}/`);
});
