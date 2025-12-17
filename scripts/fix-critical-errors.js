#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const fixes = [
  // Fix empty catch blocks
  {
    file: 'apps/frontend/html-pages/electron-code-editor/feature-expansions.js',
    line: 197,
    find: /catch\s*\([^)]*\)\s*\{\s*\}/,
    replace: 'catch (error) { console.error("Error:", error); }'
  },
  {
    file: 'apps/frontend/html-pages/electron-code-editor/platform-integration.js',
    line: 22,
    find: /catch\s*\([^)]*\)\s*\{\s*\}/,
    replace: 'catch (error) { console.error("Error:", error); }'
  },
  {
    file: 'middleware/dependency-check.js',
    line: 38,
    find: /catch\s*\([^)]*\)\s*\{\s*\}/,
    replace: 'catch (error) { console.error("Dependency check error:", error); }'
  },
  {
    file: 'scripts/refactoring/final-quality-fixes.js',
    line: 74,
    find: /catch\s*\([^)]*\)\s*\{\s*\}/,
    replace: 'catch (error) { console.error("Quality fix error:", error); }'
  },
  // Fix XSS vulnerability
  {
    file: 'scripts/utilities/security-utils.js',
    line: 160,
    find: /innerHTML\s*[+=]/,
    replace: 'textContent ='
  },
  // Fix hardcoded credentials
  {
    file: 'apps/frontend/html-pages/electron-code-editor/integration-commands.js',
    line: 16,
    find: /(password|secret|token|privateKey|accessKey|clientSecret|authToken)\s*[=:]\s*['"][^'"]+['"]/i,
    replace: '$1 = process.env.HOOTNER_$1?.toUpperCase() || ""'
  }
];

function fixFile(filePath, find, replace) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const updated = content.replace(find, replace);
    
    if (updated !== content) {
      fs.writeFileSync(fullPath, updated);
      return true;
    }
  } catch (e) {
    console.error(`Failed to fix ${filePath}:`, e.message);
  }
  return false;
}

let fixed = 0;
fixes.forEach(({ file, find, replace }) => {
  if (fixFile(file, find, replace)) {
    console.log(`✓ Fixed ${file}`);
    fixed++;
  }
});

console.log(`\n🔧 Fixed ${fixed}/${fixes.length} critical errors`);