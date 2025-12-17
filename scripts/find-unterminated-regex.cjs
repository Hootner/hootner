const fs = require('fs');
const path = require('path');

const issues = [];

function scanFile(filePath) {
  if (filePath.includes('.min.js') || filePath.includes('node_modules')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
      
      const regexPattern = /\/(?![*/])([^/\n\\]|\\.)*$/;
      if (regexPattern.test(line) && !line.includes('//')) {
        issues.push({ file: filePath, line: idx + 1, content: line.trim() });
      }
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
      } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
        scanFile(fullPath);
      }
    });
  } catch (e) {}
}

walk(process.argv[2] || '.');

console.log(`Found ${issues.length} potential unterminated regex issues:\n`);
issues.slice(0, 20).forEach(i => console.log(`${i.file}:${i.line}\n  ${i.content}\n`));
if (issues.length > 20) console.log(`... and ${issues.length - 20} more`);
