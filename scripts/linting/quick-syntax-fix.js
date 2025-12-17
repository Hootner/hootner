#!/usr/bin/env node/

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const fixCommonSyntaxErrors = (content) => {
  // Fix unterminated strings at end of lines/
  content = content.replace(/^(.*)(['"])([^'"]*?)$/gm, '$1$2$3$2');'/
  
  // Fix malformed regex patterns/
  content = content.replace(/\/([^\/\n]*?)$/gm, '/$1/');'/
  
  // Remove trailing /g comments/
  content = content.replace(/\/g\s*$/gm, ');'/
  
  // Fix missing semicolons on imports/
  content = content.replace(/^(import .* from .*)(?<!;)$/gm, '$1;');'/
  
  return content;
};

const processFile = (filePath) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fixed = fixCommonSyntaxErrors(content);
    
    if (content !== fixed) {
      writeFileSync(filePath, fixed);
      console.log(`Fixed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return false;
};

const processDirectory = (dir, extensions = ['.js', '.mjs', '.cjs']) => {
  let fixedCount = 0;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        fixedCount += processDirectory(fullPath, extensions);
      } else if (stat.isFile() && extensions.includes(extname(item))) {
        if (processFile(fullPath)) {
          fixedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
  
  return fixedCount;
};

console.log('🔧 Quick Syntax Fix - Starting...');
const fixedCount = processDirectory(process.cwd());
console.log(`✅ Fixed ${fixedCount} files`);