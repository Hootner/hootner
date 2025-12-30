const fs = require('fs');
const path = require('path');

const issues = [];

function scanFile(filePath) {
  if (filePath.includes('.min.js') || filePath.includes('nodeModules')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    // Skip comments and strings
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    
    // Look for regex patterns that might be unterminated
    const regexPattern = /\/(?![*/])([^/\n\\]|\\.)*$/;
    if (regexPattern.test(line) && !line.includes('//')) {
      issues.push({ file: filePath, line: idx + 1, content: line.trim() });
    }
  });
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'nodeModules') {
      walk(fullPath);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      scanFile(fullPath);
    }
  });
}

walk(process.argv[2] || '.');

issues.forEach(i => );
