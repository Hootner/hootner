#!/usr/bin/env node

/**
 * Mass Security Fix Script
 * Fixes CSRF, XSS, and other security issues across the entire codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security middleware template
const CSRF_MIDDLEWARE = `
// CSRF protection middleware
const csrfCheck = (req, res, next) => {
  const token = req.headers['x-csrf-token'] || req.body._token;
  if (!token || token !== req.session?.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};
`;

// XSS protection template
const XSS_SANITIZER = `
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
`;

// Find all JS files with routes
function findRouteFiles() {
  const routeFiles = [];
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDir(fullPath);
      } else if (file.endsWith('.js') && (
        fullPath.includes('routes') || 
        fullPath.includes('api') ||
        fullPath.includes('controllers')
      )) {
        routeFiles.push(fullPath);
      }
    }
  }
  
  scanDir(__dirname);
  return routeFiles;
}

// Fix CSRF in route files
function fixCSRF(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add CSRF middleware if not present
  if (!content.includes('csrfCheck') && content.includes('router.post')) {
    content = content.replace(
      /import.*from.*express.*;\n/,
      `$&${CSRF_MIDDLEWARE}`
    );
    
    // Add CSRF to POST routes
    content = content.replace(
      /router\.post\('([^']+)',\s*async\s*\(req,\s*res\)\s*=>/g,
      "router.post('$1', csrfCheck, async (req, res) =>"
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed CSRF in ${filePath}`);
  }
}

// Fix XSS in all files
function fixXSS(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add XSS sanitization
  if (content.includes('req.body') && !content.includes('sanitizeInput')) {
    content = XSS_SANITIZER + content;
    
    // Sanitize body inputs
    content = content.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*req\.body;/g,
      (match, vars) => {
        const sanitizedVars = vars.split(',').map(v => 
          `${v.trim()}: sanitizeInput(${v.trim()})`
        ).join(', ');
        return `const { ${sanitizedVars} } = req.body;`;
      }
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed XSS in ${filePath}`);
  }
}

// Main execution
console.log('🔒 Starting mass security fix...');

const routeFiles = findRouteFiles();
console.log(`Found ${routeFiles.length} route files to fix`);

for (const file of routeFiles) {
  try {
    fixCSRF(file);
    fixXSS(file);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

console.log('✅ Security fixes complete!');
console.log('Next steps:');
console.log('1. Test your application');
console.log('2. Run: npm run security:audit');
console.log('3. Deploy with: npm run aws:deploy');