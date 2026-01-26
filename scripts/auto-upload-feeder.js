const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const fetch = require('node-fetch');
const FormData = require('form-data');
const crypto = require('crypto');

class AutoUploadFeeder {
  constructor(watchDir, apiUrl = 'http://localhost:4000') {
    this.watchDir = watchDir;
    this.apiUrl = apiUrl;
    this.queue = [];
    this.uploading = false;
    this.allowedExts = ['.mp4', '.webm', '.ogg', '.mov'];
  }

  async start() {
    console.log(`🔍 Watching: ${this.watchDir}`);
    
    const watcher = chokidar.watch(this.watchDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
    });

    watcher.on('add', async (filePath) => {
      if (this.allowedExts.includes(path.extname(filePath).toLowerCase())) {
        console.log(`📁 New file detected: ${filePath}`);
        await this.addToQueue(filePath);
      }
    });

    setInterval(() => this.processQueue(), 5000);
  }

  async addToQueue(filePath) {
    const stats = await fs.stat(filePath);
    this.queue.push({
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      addedAt: Date.now()
    });
    console.log(`📋 Queue size: ${this.queue.length}`);
  }

  async processQueue() {
    if (this.uploading || this.queue.length === 0) return;
    
    this.uploading = true;
    const file = this.queue.shift();
    
    try {
      await this.uploadFile(file);
      console.log(`✅ Uploaded: ${file.name}`);
      await fs.unlink(file.path); // Remove after upload
    } catch (err) {
      console.error(`❌ Failed: ${file.name}`, err.message);
      if (err.message.includes('ECONNREFUSED') || err.message.includes('offline')) {
        this.queue.unshift(file); // Re-queue on network error
      }
    } finally {
      this.uploading = false;
    }
  }

  async uploadFile(file) {
    const buffer = await fs.readFile(file.path);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Get presigned URL
    const presignedRes = await fetch(`${this.apiUrl}/api/upload/presigned`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: this.getContentType(file.name),
        size: file.size,
        hash
      })
    });
    
    if (!presignedRes.ok) throw new Error(`Presigned failed: ${presignedRes.status}`);
    const { url, key } = await presignedRes.json();
    
    // Upload to S3
    const uploadRes = await fetch(url, {
      method: 'PUT',
      body: buffer,
      headers: { 'Content-Type': this.getContentType(file.name) }
    });
    
    if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);
    
    // Verify
    await fetch(`${this.apiUrl}/api/upload/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, hash, title: file.name, encrypted: true })
    });
  }

  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.ogg': 'video/ogg', '.mov': 'video/quicktime' };
    return types[ext] || 'video/mp4';
  }
}

// Usage
const feeder = new AutoUploadFeeder(process.env.WATCH_DIR || './uploads');
feeder.start();

module.exports = AutoUploadFeeder;
