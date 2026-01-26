const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../hexarchy/4-interface/ui/pages');
const cssPath = '/tailwind-output.css';

// Get all HTML files
const htmlFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to update\n`);

htmlFiles.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses Tailwind CDN
  if (content.includes('cdn.tailwindcss.com')) {
    // Replace CDN script with local CSS link
    content = content.replace(
      /<script\s+src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/g,
      `<link rel="stylesheet" href="${cssPath}">`
    );
    
    // Remove CSP entries for Tailwind CDN
    content = content.replace(
      /https:\/\/cdn\.tailwindcss\.com\s*/g,
      ''
    );
    
    // Remove preconnect for Tailwind CDN
    content = content.replace(
      /<link\s+rel="preconnect"\s+href="https:\/\/cdn\.tailwindcss\.com"[^>]*>\s*/g,
      ''
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`⏭️  Skipped: ${file} (no Tailwind CDN)`);
  }
});

console.log('\n✨ All files updated successfully!');
console.log(`\n📝 Next steps:`);
console.log(`   1. Run: npm run build:css:prod (to rebuild CSS)`);
console.log(`   2. Run: npm run build:css:watch (for development)`);
