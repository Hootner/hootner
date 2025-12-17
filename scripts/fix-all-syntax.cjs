const fs = require('fs');
const path = require('path');

let fixCount = 0;

function fixFile(filePath) {
  if (filePath.includes('.min.js') || filePath.includes('node_modules')) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    // Fix import/export statements
    content = content.replace(/import\s+(.+?)\s+from\s+['"](.+?)['"];['"];/g, "import $1 from '$2';");
    content = content.replace(/import\s+(.+?)\s+from\s+['"](.+?)['"];/g, "import $1 from '$2';");
    
    // Fix malformed JSDoc
    content = content.replace(/\/\*\*\s*\*\/\s*\n\s*\*\s*([^\n]+)\s*\n\s*\*\//g, '/**\n * $1\n */');
    content = content.replace(/\/\*\*\/\s*\n/g, '/**\n */\n');
    
    // Fix event handlers with malformed try-catch
    content = content.replace(/\(event\)\s*=>\s*\{\s*try\s*\{\s*\(\(e\)\(event\);[^}]*\}\s*catch[^}]*\}\s*\}\)\s*=>\s*\{/g, '(e) => {');
    content = content.replace(/\(\)\s*=>\s*\{\s*try\s*\{\s*\(\(\)\(event\);[^}]*\}\s*catch[^}]*\}\s*\}\)\s*=>\s*\{/g, '() => {');
    
    // Fix empty string assignments
    content = content.replace(/\.value\s*=\s*';/g, ".value = '';");
    content = content.replace(/=\s*';/g, "= '';");
    
    // Fix trailing backticks
    content = content.replace(/;`$/gm, ';');
    content = content.replace(/\{`$/gm, '{');
    content = content.replace(/`'$/gm, '');
    
    // Fix unterminated strings in objects
    content = content.replace(/:\s*'([^']*)\n\s*\}/g, ": '$1'\n    }");
    
    // Fix position:fixed)
    content = content.replace(/position:fixed\)/g, 'position:fixed');
    
    // Fix malformed onclick handlers
    content = content.replace(/onclick="try \{ [^}]+ \} catch[^"]+\}\"([^"]+)'\"/g, 'onclick="$1"');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      fixCount++;
      console.log(`Fixed: ${filePath}`);
    }
  } catch (e) {
    console.error(`Error fixing ${filePath}:`, e.message);
  }
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
