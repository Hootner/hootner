import express from 'express';
import { spawn } from 'child_process';
const app = express();

app.use(express.json());

app.post('/api/llm/generate', async (req, res) => {
  const { prompt, length = 15 } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  const python = spawn('python', ['-c', `
import sys
import os
sys.path.insert(0, os.path.abspath('services'))
from llm_service import BigramLLM
model = BigramLLM()
model.load('llm-model.json')
print(model.generate('${prompt.toLowerCase()}', ${length}))
`], { cwd: process.cwd() });

  let output = '';
  let error = '';

  python.stdout.on('data', (data) => { output += data.toString(); });
  python.stderr.on('data', (data) => { error += data.toString(); });

  python.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: error || 'Generation failed' });
    }
    res.json({ prompt, generated: output.trim() });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'llm-api' });
});

const PORT = process.env.LLM_PORT || 3100;
app.listen(PORT, () => {
  console.log(`LLM API Server running on port ${PORT}`);
});
