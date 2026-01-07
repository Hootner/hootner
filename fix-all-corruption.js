const fs = require('fs');
const path = require('path');

const CORRUPTION_PATTERNS = [
  { pattern: /\*\/\//g, fix: '*/', desc: 'Malformed JSDoc ending' },
  { pattern: /catch \(error\) \{ console\.error\(error\);\s*throw error; \}/g, fix: '', desc: 'Orphaned catch block' },
  { pattern: /UI_CONSTANTS\.(ANIMATION_VERY_SLOW|ANIMATION_SLOW|TIMEOUT_VERY_LONG)/g, fix: '1000', desc: 'Undefined UI constants' },
  { pattern: /HTTP_STATUS\.(SERVICE_UNAVAILABLE|TOO_MANY_REQUESTS|BAD_REQUEST|INTERNAL_SERVER_ERROR)/g, fix: (match) => {
    const map = { SERVICE_UNAVAILABLE: '503', TOO_MANY_REQUESTS: '429', BAD_REQUEST: '400', INTERNAL_SERVER_ERROR: '500' };
    return map[match.split('.')[1]] || '500';
  }, desc: 'HTTP_STATUS constants' },
  { pattern: /\(\(\) => \{ if \(\) \{ return/g, fix: '', desc: 'Malformed conditional' },
  { pattern: /const getConditionalValue[a-z0-9]+ = \(condition\) => \{[^}]+\};[^}]*return getConditionalValue[a-z0-9]+\(\);/g, fix: '', desc: 'Generated conditional functions' },
  { pattern: /let result = /g, fix: 'let result = ', desc: 'Wrong variable declaration' },
  { pattern: /for \(const ([a-z]+) = /g, fix: 'for (let $1 = ', desc: 'Const in for loop' },
  { pattern: /\.replace\(\/\[^a-zA-Z0-9_\]\/g, '\)/g, fix: ".replace(/[^a-zA-Z0-9_]/g, '')", desc: 'Incomplete regex' },
  { pattern: /\$\{req\.method\} catch \(error\)[^`]+`/g, fix: '${req.method}_${req.route?.path || req.path}`', desc: 'Corrupted template literal' },
  { pattern: /'http:\/\/localhost:DEFAULT_PORT'/g, fix: "'http://localhost:3000'", desc: 'Constant in string' },
  { pattern: /'http:\/\/localhost:TIMEOUT_MS'/g, fix: "'http://localhost:5000'", desc: 'Constant in string' },
  { pattern: /\["'self'"], /g, fix: '["\'self\'"], ', desc: 'Missing comma in array' },
  { pattern: /,\s*"\s*\]/g, fix: ']', desc: 'Stray quote in array' },
  { pattern: /return next\(\);'/g, fix: 'return next();, desc: 'Stray quote after statement' },
  { pattern: /\} catch \(error\) \{[^}]*\}'\s*\}/g, fix: '} catch (error) { return false; } }', desc: 'Malformed catch with quote' },
];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    let changes = [];

    for (const { pattern, fix, desc } of CORRUPTION_PATTERNS) {
      if (pattern.test(content)) {
        content = content.replace(pattern, fix);
        fixed = true;
        changes.push(desc);
      }
    }

    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      changes.forEach(c => console.log(`   - ${c}`));
      return { fixed: true, changes };
    }

    return { fixed: false };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { fixed: false, error: error.message };
  }
}

function scanDirectory(dir, results = { total: 0, fixed: 0, errors: 0 }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      scanDirectory(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.total++;
      const result = scanFile(fullPath);
      if (result.fixed) results.fixed++;
      if (result.error) results.errors++;
    }
  }

  return results;
}

console.log('🔍 Scanning for corrupted files...\n');
const results = scanDirectory(process.cwd());
console.log(`\n📊 Results:`);
console.log(`   Total files scanned: ${results.total}`);
console.log(`   Files fixed: ${results.fixed}`);
console.log(`   Errors: ${results.errors}`);
