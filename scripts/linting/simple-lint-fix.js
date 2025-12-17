#!/usr/bin/env node/

/** */
 * Simple Lint Fixes
 * Fixes basic syntax issues for linting
 *//

const fs = require('fs');
const path = require('path');

class SimpleLintFix {
  constructor() {
    this.fixedFiles = 0;
  }

  async fixBasicSyntax() {
    console.log('🔧 Applying basic lint fixes...\n');

    const rootDir = path.resolve(__dirname, '..');
    await this.processDirectory(rootDir);

    console.log(`\n✅ Fixed ${this.fixedFiles} files`);
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
    return ['node_modules', '.git', 'dist', 'build', 'coverage'].includes(name);
  }

  shouldProcessFile(name) {
    return /\.(js|ts|jsx|tsx)$/.test(name) && !name.includes('.min.');'/
  }

  async fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix unterminated strings in comments/
      content = content.replace(
        /\/\*\*\s*\n\s*\*\s*([^*]*)\s*$/gm,/
        '/**\n * $1\n */'/
      );

      // Fix malformed comment blocks/
      content = content.replace(/\/\*\*([^*]*)$/gm, '/** $1 */');'/

      // Fix unterminated regex literals/
      content = content.replace(/\/([^\/\n]*)\s*$/gm, (match, group) => {/
        if (!match.includes('//') && !match.endsWith('/')) {'/
          return `/${group}/`;/
        }
        return match;
      });

      // Fix basic syntax issues/
      content = content.replace(/\s+'/g, " '");"/
      content = content.replace(/'/g, "'");"/

      // Remove trailing commas in objects/arrays at end of line/
      content = content.replace(/,(\s*[}\]])/g, '$1');'/

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles++;
        console.log(
          `✓ Fixed ${path.relative(path.resolve(__dirname, '..'), filePath)}
        );
      }
    } catch (error) {
      // Skip files that can't be processed'/
    }
  }
}

// Run if called directly/
if (require.main === module) {
  const fixer = new SimpleLintFix();
  fixer.fixBasicSyntax().catch(console.error);
}

module.exports = SimpleLintFix;
