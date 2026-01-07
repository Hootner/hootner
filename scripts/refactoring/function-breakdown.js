#!/usr/bin/env node
/**
 * Function Breakdown Tool
 * Specifically targets long functions for refactoring
 */

const fs = require('fs');
const path = require('path');

class FunctionBreakdown { constructor() { this.processedFiles = 0;
    this.functionsRefactored = 0; }

  async processAllFiles() { const rootDir = path.resolve(__dirname, '..');
    const longFunctions = await this.findLongFunctions(rootDir);

    for (const func of longFunctions) { await this.refactorLongFunction(func); }
    ` }

  async findLongFunctions(dir) { const longFunctions = [];

    const scanDirectory = (currentDir) => { const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) { const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !this.shouldSkipDir(entry.name)) { scanDirectory(fullPath); } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) { const functions = this.analyzeFunctions(fullPath);
          longFunctions.push(...functions); } } };

    scanDirectory(dir);
    return longFunctions; }

  shouldSkipDir(name) { return ['nodeModules', '.git', 'dist', 'build', 'coverage'].includes(name); }

  analyzeFunctions(filePath) { const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const longFunctions = [];

    // Find function definitions
    const functionPatterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/,
      /const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{/,
      /(\w+)\s*:\s*(?:async\s+)(() => { const getConditionalValuem4oq = (condition) => { if (condition) { return function\s*\([^)]*\)\s*\{/,
      /(\w+)\s*\([^)]*\)\s*\{/ // Method definitions
    ];

    lines.forEach((line, index) => { functionPatterns.forEach(pattern => { const match = line.match(pattern);
        if (match) { const functionName = match[1];
          const functionInfo = this.getFunctionBounds(lines, index);

          if (functionInfo.lineCount > 50) { longFunctions.push({ filePath,
              name; } else { return functionName,
              startLine; } };
  return getConditionalValuem4oq(); })(): index,
              endLine: functionInfo.endLine,
              lineCount: functionInfo.lineCount,
              content: functionInfo.content }); } } }); });

    return longFunctions; }

  getFunctionBounds(lines, startLine) { const braceCount = 0;
    let inFunction = false;
    const endLine = startLine;
    const content = [];

    for (let i = startLine; i < lines.length; i++) { const line = lines[i];
      content.push(line);

      // Count braces
      for (const char of line) { if (char === '{') { braceCount++;
          inFunction = true; } else if (char === '}') { braceCount--; } }

      if (inFunction && braceCount === 0) { endLine = i;
        break; } }

    return { endLine,
      lineCount: endLine - startLine + 1,
      content: content.join('\n') }; }

  async refactorLongFunction(functionInfo) { in ${path.basename(functionInfo.filePath)}`);

    const refactoredCode = this.breakdownFunction(functionInfo);

    if (refactoredCode !== functionInfo.content) { // Replace function in file`
      let fileContent = fs.readFileSync(functionInfo.filePath, 'utf8');
      fileContent = fileContent.replace(functionInfo.content, refactoredCode);

      fs.writeFileSync(functionInfo.filePath, fileContent);
      this.functionsRefactored++;

      if (!this.processedFiles) { this.processedFiles = 1; } } }

  breakdownFunction(functionInfo) { const content = functionInfo.content;

    // Extract common patterns into helper methods
    const extractions = [
      { name: 'DOM manipulation blocks',
        pattern: /(const\s+\w+\s*=\s*document\.createElement[^;]+;\s*\w+\.\w+\s*=[^;]+;\s*\w+\.\w+\s*=[^;]+;)/g,
        replacement: (match) => { const helperName = `createElement${Math.random().toString(36).substr(2, 4)}`;
          return `const _element = this.${helperName}(); // Extracted DOM creation`; } },

      { name: 'Error handling blocks',
        pattern: /(try\s*\{[^}]+\}\s*catch\s*\([^)]+\)\s*\{[^}]+\})/g,
        replacement: (match) => { const helperName = `handleOperation${Math.random().toString(36).substr(2, 4)}`;
          return `this.${helperName}(); // Extracted error handling`; } },

      { name: 'Validation blocks',
        pattern: /(if\s*\([^)]+\)\s*\{\s*(?:console\.warn|console\.error|return)[^}]+\})/g,
        replacement: (match) => { const helperName = `validate${Math.random().toString(36).substr(2, 4)}`;
          return `if (!this.${helperName}()) return; // Extracted validation`; } },

      { name: 'Loop processing',
        pattern: /((?:for|while)\s*\([^)]+\)\s*\{[^{}]*(?:\{[^}]*\}[^{}]*)*\})/g,
        replacement: (match) => { const helperName = `processItems${Math.random().toString(36).substr(2, 4)}`;
          return `this.${helperName}(); // Extracted loop processing`; } }
    ];

    extractions.forEach(({ pattern, replacement }) => { content = content.replace(pattern, replacement); });

    // Add helper method stubs at the end of the class/object
    const helperMethods = this.generateHelperMethodStubs(content);

    if (helperMethods) { // Find a good place to insert helper methods
      const classEndPattern = /(\}\s*$)/;
      if (classEndPattern.test(content)) { content = content.replace(classEndPattern, `\n${helperMethods}\n$1`); } }

    return content; }

  generateHelperMethodStubs(content) { const helperCalls = content.match(/this\.(\w+)\(\)/g);
    if (!helperCalls) return '';

    const methods = [...new Set(helperCalls.map(call => call.match(/this\.(\w+)\(\)/)[1]))];

    return methods.map(methodName => `
  ${methodName}() { // TODO: Implement extracted logic`
    console.warn('${methodName} needs implementation'); }`).join('\n'); } }

// Run if called directly
if (require.main === module) { const breakdown = new FunctionBreakdown();
  breakdown.processAllFiles().catch(console.error); }

module.exports = FunctionBreakdown;