const fs = require('fs');
const path = require('path');

const issues = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let inJSDoc = false;
    
    lines.forEach((line, idx) => {
      if (line.includes('/**')) {
        inJSDoc = true;
        if (!/^\s*\/\*\*/.test(line)) {
          issues.push({ file: filePath, line: idx + 1, issue: 'Malformed JSDoc start', content: line.trim() });
        }
      }
      
      if (inJSDoc && !line.includes('*/') && !line.trim().startsWith('*') && line.trim() !== '' && !line.includes('/**')) {
        issues.push({ file: filePath, line: idx + 1, issue: 'Missing asterisk', content: line.trim() });
      }
      
      if (line.includes('*/')) inJSDoc = false;
    });
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
      } else if ((file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.min.js')) {
        scanFile(fullPath);
      }
    });
  } catch (e) {}
}

walk(process.argv[2] || '.');

console.log(`Found ${issues.length} JSDoc issues:\n`);
issues.forEach(i => console.log(`${i.file}:${i.line} - ${i.issue}\n  ${i.content}\n`));
