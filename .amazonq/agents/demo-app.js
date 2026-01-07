// Complete Demo App - Combining Multiple Templates
// Mini Social Video Platform using 10+ templates

import express from 'express';

// Import templates
import GraphDB from './phase1-advanced/graph-database.js';
import TimeSeriesDB from './phase2-advanced/timeseries-db.js';
import VectorDB from './phase2-advanced/vector-db.js';
import RateLimiter from './phase2-advanced/rate-limiter.js';
import MessageQueue from './phase2-advanced/message-queue.js';
import { CDN } from './phase2-advanced/cdn.js';
import Blockchain from './phase2-advanced/cryptocurrency.js';

class SocialVideoPlatform {
  constructor() {
    this.app = express();
    this.port = 3000;
    
    // Initialize systems
    this.social = new GraphDB();
    this.analytics = new TimeSeriesDB();
    this.search = new VectorDB(64);
    this.limiter = new RateLimiter('token-bucket', 100, 10);
    this.queue = new MessageQueue();
    this.blockchain = new Blockchain();
    
    // Mock CDN
    this.cdn = {
      fetch: (url) => ({ url, cached: true })
    };
    
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    
    // Rate limiting middleware
    this.app.use((req, res, next) => {
      if (this.limiter.allow()) {
        next();
      } else {
        res.status(429).json({ error: 'Rate limit exceeded' });
      }
    });

    // User routes
    this.app.post('/users/:id', (req, res) => {
      this.social.addNode(req.params.id, { name: req.body.name });
      res.json({ success: true });
    });

    this.app.post('/follow/:userId', (req, res) => {
      this.social.addEdge(req.body.from, req.params.userId, 'FOLLOWS');
      res.json({ success: true });
    });

    this.app.get('/followers/:userId', (req, res) => {
      const followers = this.social.getNeighbors(req.params.userId, 'FOLLOWS');
      res.json({ followers });
    });

    // Video routes
    this.app.post('/videos', (req, res) => {
      const { id, title, embedding } = req.body;
      
      // Index for search
      this.search.add(id, embedding, { title });
      
      // Queue for processing
      this.queue.publish('video-processing', { id, title });
      
      res.json({ success: true, id });
    });

    this.app.get('/videos/:id', (req, res) => {
      // Serve from CDN
      const video = this.cdn.fetch(`/videos/${req.params.id}`);
      
      // Track view
      this.analytics.write('video_views', 1, { videoId: req.params.id });
      
      res.json({ video });
    });

    this.app.get('/search', (req, res) => {
      const { q, embedding } = req.query;
      const results = this.search.search(JSON.parse(embedding), 10);
      res.json({ results });
    });

    // Analytics routes
    this.app.get('/analytics/views', (req, res) => {
      const views = this.analytics.aggregate(
        'video_views',
        {},
        Date.now() - 86400000,
        Date.now(),
        'sum'
      );
      res.json({ views });
    });

    // Payment routes (blockchain)
    this.app.post('/pay', (req, res) => {
      const { from, to, amount } = req.body;
      this.blockchain.addTransaction({ from, to, amount });
      this.blockchain.minePendingTransactions('platform');
      res.json({ success: true });
    });

    this.app.get('/balance/:address', (req, res) => {
      const balance = this.blockchain.getBalance(req.params.address);
      res.json({ balance });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        users: this.social.nodes.size,
        videos: this.search.size(),
        blockchain: this.blockchain.chain.length
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`\n🦉 Social Video Platform running on port ${this.port}`);
      console.log('\nFeatures:');
      console.log('  ✓ Social graph (follow/followers)');
      console.log('  ✓ Video search (vector similarity)');
      console.log('  ✓ Analytics (time-series)');
      console.log('  ✓ Payments (blockchain)');
      console.log('  ✓ CDN (video delivery)');
      console.log('  ✓ Rate limiting');
      console.log('  ✓ Message queue');
      console.log('\nAPI Endpoints:');
      console.log('  POST /users/:id');
      console.log('  POST /follow/:userId');
      console.log('  GET  /followers/:userId');
      console.log('  POST /videos');
      console.log('  GET  /videos/:id');
      console.log('  GET  /search?q=...&embedding=[...]');
      console.log('  GET  /analytics/views');
      console.log('  POST /pay');
      console.log('  GET  /balance/:address');
      console.log('  GET  /health');
    });
  }
}

// Demo usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const platform = new SocialVideoPlatform();
  platform.start();
  
  // Simulate some activity
  setTimeout(async () => {
    console.log('\n--- Simulating Activity ---\n');
    
    // Create users
    await fetch('http://localhost:3000/users/alice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice' })
    });
    
    await fetch('http://localhost:3000/users/bob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob' })
    });
    
    // Follow
    await fetch('http://localhost:3000/follow/bob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'alice' })
    });
    
    // Upload video
    await fetch('http://localhost:3000/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'video1',
        title: 'My First Video',
        embedding: Array(64).fill(0).map(() => Math.random())
      })
    });
    
    console.log('✓ Activity simulated');
    console.log('\nCheck http://localhost:3000/health');
  }, 2000);
}

export default SocialVideoPlatform;
