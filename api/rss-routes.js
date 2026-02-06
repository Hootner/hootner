const express = require('express');
const router = express.Router();
const { generateRSSFeed } = require('./rss-feed');

// Sample posts data (replace with your database query)
const getPosts = () => [
  {
    id: 1,
    user: { name: 'VideoCreator', handle: '@videocreator' },
    content: 'Just dropped my latest video edit using HOOTNER\'s AI tools! The results are insane 🔥',
    timestamp: Date.now() - 7200000,
    media: { type: 'image', url: 'https://hootner.com/media/1.jpg' },
    aiGenerated: true
  },
  {
    id: 2,
    user: { name: 'MusicProducer', handle: '@musicprod' },
    content: 'New beat dropped! 🎧 Made entirely with AI-assisted composition.',
    timestamp: Date.now() - 14400000,
    holographic: true,
    mindGenerated: true
  }
];

// RSS Feed endpoint
router.get('/feed.xml', (req, res) => {
  const posts = getPosts();
  const rss = generateRSSFeed(posts);
  
  res.set('Content-Type', 'application/rss+xml');
  res.send(rss);
});

module.exports = router;
