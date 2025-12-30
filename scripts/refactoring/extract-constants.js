#!/usr/bin/env node
/**
 * Extract Magic Numbers to Constants
 * Finds and replaces magic numbers with named constants
 *//

const fs = require('fs');
const path = require('path');

class ConstantExtractor {
  constructor() {
    this.magicNumbers = new Map();
    this.replacements = new Map();
    this.setupCommonConstants();
  }

  setupCommonConstants() {
    // Common magic numbers and their constant names
    this.replacements.set('2000', 'UI_CONSTANTS.TIMEOUT_SHORT');
    this.replacements.set('3000', 'UI_CONSTANTS.TIMEOUT_MEDIUM');
    this.replacements.set('5000', 'UI_CONSTANTS.TIMEOUT_LONG');
    this.replacements.set('10000', 'UI_CONSTANTS.TIMEOUT_VERY_LONG');
    this.replacements.set('30000', 'UI_CONSTANTS.TIMEOUT_EXTENDED');
    this.replacements.set('60000', 'UI_CONSTANTS.TIMEOUT_MAX');
    this.replacements.set('255', 'UI_CONSTANTS.COLOR_MAX');
    this.replacements.set('400', 'UI_CONSTANTS.HTTP_BAD_REQUEST');
    this.replacements.set('404', 'UI_CONSTANTS.HTTP_NOT_FOUND');
    this.replacements.set('500', 'UI_CONSTANTS.HTTP_SERVER_ERROR');
    this.replacements.set('200', 'UI_CONSTANTS.HTTP_OK');
    this.replacements.set('300', 'UI_CONSTANTS.ANIMATION_NORMAL');
    this.replacements.set('500', 'UI_CONSTANTS.ANIMATION_SLOW');
    this.replacements.set('1000', 'UI_CONSTANTS.ANIMATION_VERY_SLOW');
    this.replacements.set('3000', 'UI_CONSTANTS.DEFAULT_PORT');
    this.replacements.set('8080', 'UI_CONSTANTS.COLLAB_PORT');
    this.replacements.set('2020', 'UI_CONSTANTS.YEAR_2020');
    this.replacements.set('2021', 'UI_CONSTANTS.YEAR_2021');
    this.replacements.set('2025', 'UI_CONSTANTS.YEAR_2025');
    this.replacements.set('1048576', 'UI_CONSTANTS.FILE_SIZE_1MB');
    this.replacements.set('120', 'UI_CONSTANTS.MAX_LINE_LENGTH');
  }

  async extractFromDirectory(dir) {

    const files = this.getJSFiles(dir);
    const totalReplacements = 0;
    
    for (const file of files) {
      const replacements = await this.processFile(file);
      if (replacements > 0) {
        totalReplacements += replacements;
        }`);
      }
    }

  }

  getJSFiles(dir) {
    const files = [];
    
    const scan = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !this.shouldSkip(entry.name)) {
          scan(fullPath);
        } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dir);
    return files;
  }

  shouldSkip(name) {
    return ['nodeModules', '.git', 'dist', 'build', 'coverage'].includes(name);
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const replacements = 0;

      // Add import if constants are used
      const needsImport = false;

      // Replace magic numbers
      for (const [number, constant] of this.replacements) {
        const regex = new RegExp(`\\b${number} catch (error) {
    console.error(error);
    throw error;
  }\\b(?!\\s*[a-zA-Z_])`, 'g');
        const matches = content.match(regex);
        
        if (matches) {
          // Skip if in comments or strings
          const cleanMatches = matches.filter(match => {
            const index = content.indexOf(match);
            const before = content.substring(Math.max(0, index - 20), index);
            return !before.includes('//') && !before.includes('/*') && 
                   !before.includes('"') && !before.includes("'");
          });
          
          if (cleanMatches.length > 0) {
            content = content.replace(regex, constant);
            replacements += cleanMatches.length;
            needsImport = true;
          }
        }
      }

      // Add import statement if needed
      if (needsImport && !content.includes('UI_CONSTANTS')) {
        const importStatement = "import { UI_CONSTANTS } from '../constants/ui-constants.js';\n";
        // Find the right place to insert import
        if (content.includes('import')) {
          const lastImport = content.lastIndexOf('import');
          const nextNewline = content.indexOf('\n', lastImport);
          content = content.slice(0, nextNewline + 1) + importStatement + content.slice(nextNewline + 1);
        } else {
          content = importStatement + content;
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        return replacements;
      }
      
      return 0;
    } catch (error) {

      return 0;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const extractor = new ConstantExtractor();
  const rootDir = path.resolve(__dirname, '..');
  extractor.extractFromDirectory(rootDir).catch(console.error);
}

module.exports = ConstantExtractor;