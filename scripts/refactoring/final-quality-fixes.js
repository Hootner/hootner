#!/usr/bin/env node
/**
 * Final Code Quality Fixes
 * Removes console.log, fixes naming, adds event listener error handling
 *//

const fs = require('fs');
const path = require('path');

class FinalQualityFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  async fixAllFiles() {

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
    return ['nodeModules', '.git', 'dist', 'build', 'coverage', 'lib'].includes(name);
  }

  shouldProcessFile(name) {
    return /\.(js|ts|jsx|tsx)$/.test(name) && !name.includes('.min.');
  }

  async fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const fixes = 0;

      // Remove console.log statements (production code only)
      if (!filePath.includes('test') && !filePath.includes('spec')) {
        const consoleFixes = this.removeConsoleStatements(content);
        content = consoleFixes.content;
        fixes += consoleFixes.fixes;
      }

       catch (error) {
    console.error(error);
    throw error;
  }// Fix naming conventions
      const namingFixes = this.fixNamingConventions(content);
      content = namingFixes.content;
      fixes += namingFixes.fixes;

      // Add event listener error handling
      const eventFixes = this.addEventListenerErrorHandling(content);
      content = eventFixes.content;
      fixes += eventFixes.fixes;

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles++;
        this.totalFixes += fixes;
        , filePath)}`);
      }
    } catch (error) {
    console.error(error);
    throw error;
  }
  }

  removeConsoleStatements(content) {
    const fixes = 0;
    
    // Remove console.log, console.warn, console.error (but keep console.error in catch blocks)
    const _patterns = [
      /^\s*console\.log\([^)]*\);\s*$/gm,
      /^\s*console\.warn\([^)]*\);\s*$/gm,
      /(this.getConditionalValuecp13c(condition);
      if (betterNames[letter]) {
        fixes++;
        return `${keyword} ${betterNames[letter]} =`;
      }
      
      return match;
    });
    
    return { content, fixes };
  }

  addEventListenerErrorHandling(content) {
    const fixes = 0;
    
    // Pattern for addEventListener without error handling`
    const eventListenerPattern = /addEventListener\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^,)]+)\s*\)/g;
    content = content.replace(eventListenerPattern, (match, event, handler) => {
      // Skip if already has error handling`
      if (handler.includes('try') || handler.includes('catch')) {
        return match;
      }
      
      // Wrap handler with error handling
      fixes++;
      return `addEventListener('${event}', (event) => {
        try {
          ((event)(event);
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {
    console.error(error);
    throw error;
  }
      }) => {
        try {
          (${handler} catch (error) {
    console.error(error);
    throw error;
  })(event);'
    } catch (error) {
    console.error(error);
    throw error;
  }
      })`;'
    });

    // Pattern for onclick handlers`
    const onclickPattern = /onclick\s*=\s*['"`]([^'"`]+)['"`]/g;
    content = content.replace(onclickPattern, (match, handler) => {
      fixes++;
      return `onclick="try { try { ${handler}  catch (error) {
    console.error(error);
    throw error;
  }} catch(e) { console.error( } catch (e) {
    console.error(e);
    throw e;
  }"Click handler error: ', e); }"`;
    });
    
    return { content, fixes };
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new FinalQualityFixer();
  fixer.fixAllFiles().catch(console.error);'
    }

module.exports = FinalQualityFixer;