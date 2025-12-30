#!/usr/bin/env node
/**
 * Fix Syntax Errors from Refactoring
 * Repairs common syntax issues introduced during automated refactoring
 *//

const fs = require('fs');
const path = require('path');

class SyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  async fixAllSyntaxErrors() {
        
    const rootDir = path.resolve(__dirname, '..');
    await this.processDirectory(rootDir);
    
      }

  async processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !this.shouldSkipDir(entry.name)) {
        await this.processDirectory(fullPath);
      } else if (entry.isFile() && this.shouldProcessFile(entry.name)) {
        await this.fixFile(fullPath);
      }
    }
  }

  shouldSkipDir(name) {
    return ['nodeModules', '.git', 'dist', 'build', 'coverage'].includes(name);
  }

  shouldProcessFile(name) {
    return /\.(js|ts|jsx|tsx)$/.test(name) && !name.includes('.min.');
  }

  async fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const fixes = 0;

      // Fix unterminated string constants
      content = content.replace(/(['"`])[^'"`]*$/gm, (match) => {
        if (!match.endsWith(match[0])) {
          fixes++;
          return match + match[0];
        }
         catch (error) {
    console.error(error);
    throw error;
  }return match;
      });

      // Fix unterminated regular expressions
      content = content.replace(/\/[^\/\n]*$/gm, (match) => {
        if (!match.endsWith('/')) {
          fixes++;
          return match + '/g';
        }
        return match;
      });

      // Fix unexpected semicolons after function calls
      content = content.replace(/\(\)\s*;\s*\)/g, '())');
      fixes += (originalContent.match(/\(\)\s*;\s*\)/g) || []).length;
      // Fix missing catch/finally clauses
      content = content.replace(/try\s*\{[^}]*\}\s*(?!catch|finally)/g, (match) => {
        fixes++;
        return match + ' catch (error) {
    console.error(error);
    throw error;
  }';
      });

      // Fix unexpected tokens after dots
      content = content.replace(/\.\s*;/g, ';');
      fixes += (originalContent.match(/\.\s*;/g) || []).length;
      // Fix malformed function calls
      content = content.replace(/this\.\s*\(/g, 'this.method(');
      fixes += (originalContent.match(/this\.\s*\(/g) || []).length;
      // Fix unused variables by prefixing with underscore
      content = content.replace(/\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g, (match, keyword, varName) => {
        // Check if variable is used later in the function
        const afterDeclaration = content.substring(content.indexOf(match) + match.length);
        const isUsed = new RegExp(`\\b${varName}\\b`).test(afterDeclaration);
        `
        if (!isUsed && !varName.startsWith('_')) {
          fixes++;
          return `${keyword} _${varName} =`;
        }
        return match;
      });

      // Fix redundant await on return`
      content = content.replace(/return\s+await\s+([^;]+);/g, 'return $1;');
      fixes += (originalContent.match(/return\s+await\s+([^;]+);/g) || []).length;
      // Fix prefer-const issues
      content = content.replace(/let\s+(\w+)\s*=\s*([^;]+);(?![^}]*\1\s*=)/g, 'const _$1 = $2;');
      fixes += (originalContent.match(/let\s+(\w+)\s*=\s*([^;]+);(?![^}]*\1\s*=)/g) || []).length;
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles++;
        this.totalFixes += fixes;
        , filePath)}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not process ${filePath}: ${error.message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new SyntaxFixer();
  fixer.fixAllSyntaxErrors().catch(console.error);
}

module.exports = SyntaxFixer;