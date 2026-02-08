#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../hexarchy/4-interface/ui/pages');

const pageMapping = {
  video: [
    'video-player.html', 'cinema-player.html', 'mobile-player.html',
    'upload-video.html', 'auto-upload-feeder.html', 'feed.html',
    'feed-react.html', 'my-videos.html', 'ai-video.html',
    'live-stream.html', 'live-activity.html'
  ],
  commerce: [
    'marketplace.html', 'pricing.html', 'upload-metrics.html'
  ],
  admin: [
    'erp-dashboard.html', 'analytics.html', 'devops-monitoring.html',
    'agent-management.html', 'security.html', 'security-demo.html',
    'security-command-center.html', 'admin-session-manager.html'
  ],
  social: [
    'messages.html', 'collaboration.html', 'contact.html'
  ],
  auth: [
    'login.html', 'profile.html', 'settings.html',
    'usb-passkey-demo.html'
  ],
  dev: [
    'code-editor.html', 'auto-editor.html', 'ultra-editor.html'
  ]
};

// Create directories
Object.keys(pageMapping).forEach(dir => {
  const dirPath = path.join(pagesDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dir}/`);
  }
});

// Move files
let moved = 0;
Object.entries(pageMapping).forEach(([dir, files]) => {
  files.forEach(file => {
    const src = path.join(pagesDir, file);
    const dest = path.join(pagesDir, dir, file);
    
    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
      console.log(`📁 Moved: ${file} → ${dir}/`);
      moved++;
    }
  });
});

// Keep root files
const rootFiles = [
  'index.html', 'dashboard.html', 'config.html', 'error.html',
  'manifest.json', 'sw.js', 'tailwind-input.css', 'tailwind-output.css',
  'styles.css', 'shared-styles.css', 'glass-ui.css', 'dashboard-styles.css',
  'config.js', 'glass-ui.js', 'graphql-config.js', 'profile.js',
  'settings.js', 'security-core.js', 'asset-loader.js', 'server.js',
  'feed-react-config.js'
];

console.log(`\n✅ Organized ${moved} pages into feature directories`);
console.log(`📌 Root files preserved: ${rootFiles.length}`);
