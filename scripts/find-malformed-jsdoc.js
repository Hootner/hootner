const fs = require('fs');
const path = require('path');

const issues = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let inJSDoc = false;
  let jsdocStart = 0;
  
  lines.forEach((line, idx) => {
    if (line.includes('/**')) {
      inJSDoc = true;
      jsdocStart = idx + 1;
      
      // Check for malformed start
      if (!/^\s*\/\*\*/.test(line)) {
        issues.push({ file: filePath, line: idx + 1, issue: 'Malformed JSDoc start', content: line.trim() });
      }
    }
    
    if (inJSDoc) {
      // Check for missing asterisk
      if (!line.includes('*/') && !line.trim().startsWith('*') && line.trim() !== ' && !line.includes('/**')) {
        issues.push({ file: filePath, line: idx + 1, issue: 'Missing asterisk', content: line.trim() });
      }
      
      // Check for invalid tags
      if (/@\w+/.test(line) && !/@(param|returns?|type|typedef|callback|template|throws?|see|example|deprecated|since|version|author|license|description|summary|namespace|memberof|member|function|method|class|constructor|extends|implements|interface|enum|property|prop|readonly|private|protected|public|static|async|generator|yields?|fires|listens|this|override|ignore|todo|fixme|note|warning|module|exports|default|constant|const|var|let|file|fileoverview|overview|global|inner|instance|external|host|mixin|name|kind|access|alias|augments|borrows|lends|mixes|requires?|tutorial|variation|virtual|abstract|hideconstructor|classdesc|event|emits)/.test(line)) {
        const tag = line.match(/@(\w+)/)[1];
        issues.push({ file: filePath, line: idx + 1, issue: `Unknown JSDoc tag: @${tag}`, content: line.trim() });
      }
    }
    
    if (line.includes('*/')) {
      inJSDoc = false;
    }
  });
}

function walk(dir) {
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
}

walk(process.argv[2] || '.');

console.log(`Found ${issues.length} JSDoc issues:\n`);
issues.forEach(i => console.log(`${i.file}:${i.line} - ${i.issue}\n  ${i.content}\n`));
