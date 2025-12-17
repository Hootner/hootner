const fs = require('fs');
const path = require('path');

let fixCount = 0;

function fixFile(filePath) {
  if (filePath.includes('.min.js') || filePath.includes('node_modules')) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    // Fix /g/ patterns (bad regex flags)
    content = content.replace(/["']\s*\/g\/\s*$/gm, '');
    content = content.replace(/\);\s*\/g\/\s*$/gm, ');');
    content = content.replace(/>\s*\/g\/\s*$/gm, '>');
    content = content.replace(/\}\s*\/g\/\s*$/gm, '}');
    content = content.replace(/\]\s*\/g\/\s*$/gm, ']');
    content = content.replace(/\/g\/\s*$/gm, '');
    
    // Fix /**/ to /** */
    content = content.replace(/\/\*\*\/\s*$/gm, '/** */');
    
    // Fix import/export with trailing /g/;
    content = content.replace(/;'\/g\/;\s*$/gm, ';');
    content = content.replace(/;'\s*$/gm, ';');
    
    // Fix malformed JSDoc
    content = content.replace(/\/\*\*\s*\n\s*\*\s*([^\n]+)\s*\n\s*\*\/\//gm, '/**\n * $1\n */');
    
    // Fix trailing backticks and quotes
    content = content.replace(/\{`\s*$/gm, '{');
    content = content.replace(/`'\s*$/gm, '');
    content = content.replace(/'\s*$/gm, '');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      fixCount++;
      console.log(`Fixed: ${filePath}`);
    }
  } catch (e) {}
}

function walk(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walk(fullPath);
      } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
        fixFile(fullPath);
      }
    });
  } catch (e) {}
}

walk(process.argv[2] || '.');
console.log(`\nFixed ${fixCount} files`);
