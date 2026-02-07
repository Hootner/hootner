import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('hexarchy/4-interface/ui/pages'));

app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`✅ HOOTNER running at http://localhost:${port}`);
});
