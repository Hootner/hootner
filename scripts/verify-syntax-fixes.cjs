const fs = require('fs');
const path = require('path');

let issues = { regex: 0, jsdoc: 0, imports: 0, strings: 0 };

function checkFile(filePath) {
  if (filePath.includes('.min.js') || filePath.includes('node_modules')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for /g/ patterns (the actual bug)
    if (/\/g\/\s*$/m.test(content)) {
      issues.regex++;
      console.log(`❌ Regex issue in: ${filePath}`);
    }
    
    // Check for malformed imports
    if (/import.*from.*['"];['"];/.test(content)) {
      issues.imports++;
      console.log(`❌ Import issue in: ${filePath}`);
    }
    
    // Check for malformed empty strings
    if (/=\s*';(?!\s*\/\/)/.test(content) && !/=\s*'';/.test(content)) {
      issues.strings++;
      console.log(`❌ String issue in: ${filePath}`);
    }
    
    // Check for malformed JSDoc (/**/)
    if (/\/\*\*\/\s*\n\s*\*/.test(content)) {
      issues.jsdoc++;
      console.log(`❌ JSDoc issue in: ${filePath}`);
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
        checkFile(fullPath);
      }
    });
  } catch (e) {}
}

console.log('🔍 Verifying syntax fixes...\n');
walk(process.argv[2] || '.');

console.log('\n📊 Results:');
console.log(`   Regex issues (/g/): ${issues.regex}`);
console.log(`   JSDoc issues: ${issues.jsdoc}`);
console.log(`   Import issues: ${issues.imports}`);
console.log(`   String issues: ${issues.strings}`);

const total = issues.regex + issues.jsdoc + issues.imports + issues.strings;
if (total === 0) {
  console.log('\n✅ All syntax issues fixed!');
} else {
  console.log(`\n⚠️  ${total} issues remaining`);
}
