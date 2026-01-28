const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from the pages directory
app.use(express.static(path.join(__dirname, 'hexarchy/4-interface/ui/pages')));

// Serve the HOOTNER landing page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/hootner-landing.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'HOOTNER Landing Page' });
});

app.listen(PORT, () => {
    console.log(`🦉 HOOTNER Landing Page Server running at http://localhost:${PORT}`);
    console.log('✅ Serving original content - no copyright issues!');
});