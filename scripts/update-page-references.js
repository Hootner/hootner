#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const updates = [
  {
    file: 'scripts/servers/serve-html.js',
    replacements: [
      { from: "'/pages/video-player.html'", to: "'/pages/video/video-player.html'" },
      { from: "'/pages/marketplace.html'", to: "'/pages/commerce/marketplace.html'" },
      { from: "'/pages/code-editor.html'", to: "'/pages/dev/code-editor.html'" },
      { from: "'/pages/auto-editor.html'", to: "'/pages/dev/auto-editor.html'" },
      { from: "'/pages/feed-react.html'", to: "'/pages/video/feed-react.html'" },
      { from: "'/pages/ultra-editor.html'", to: "'/pages/dev/ultra-editor.html'" },
      { from: "'/pages/messages.html'", to: "'/pages/social/messages.html'" },
      { from: "'/pages/contact.html'", to: "'/pages/social/contact.html'" },
      { from: "'/pages/collaboration.html'", to: "'/pages/social/collaboration.html'" },
      { from: "'/pages/agent-management.html'", to: "'/pages/admin/agent-management.html'" },
      { from: "'/pages/devops-monitoring.html'", to: "'/pages/admin/devops-monitoring.html'" },
      { from: "'/pages/login.html'", to: "'/pages/auth/login.html'" },
      { from: "'/pages/profile.html'", to: "'/pages/auth/profile.html'" },
      { from: "'/pages/settings.html'", to: "'/pages/auth/settings.html'" }
    ]
  }
];

console.log('🔄 Updating file references...\n');

updates.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skip: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from, 'g'), to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
  }
});

console.log('\n✅ Reference updates complete');
console.log('⚠️  Manual review needed for:');
console.log('   - HTML internal links');
console.log('   - Documentation references');
console.log('   - Test files');
