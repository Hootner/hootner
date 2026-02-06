#!/usr/bin/env node

import { config } from 'dotenv';
import express from 'express';
import { generateUploadURL, validateUpload } from '../services/s3-upload-service.js';

config();

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.static('apps/frontend/html-pages'));

// Upload endpoint
app.post('/api/upload/presign', async (req, res) => {
  try {
    const { filename, contentType, fileSize } = req.body;
    
    validateUpload(filename, fileSize, contentType);
    const result = await generateUploadURL('test-user', filename, contentType);
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal upload server: http://localhost:${PORT}/upload-video.html`);
});