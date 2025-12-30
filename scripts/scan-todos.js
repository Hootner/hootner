#!/usr/bin/env node

/**
 * HOOTNER TODO Scanner
 * Scans codebase for TODO, FIXME, and other action items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAGS = [
  'TODO', 'FIXME', 'BUG', 'HACK', 'XXX', 'NOTE', 
  'OPTIMIZE', 'REFACTOR', 'SECURITY', 'PERFORMANCE',
  'DEPRECATED', 'REVIEW', 'CLEANUP', 'TEST', 'DOCS'
];

const EXCLUDE_DIRS = [
  'node_modules', 'dist', 'build', 'out', '.next', 
  'coverage', '.git', 'vendor'
];

const INCLUDE_EXTS = [
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', 
  '.scss', '.json', '.md', '.yml', '.yaml'
];

function scanFile(filePath) {
  const todos = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      TAGS.forEach(tag => {
        const regex = new RegExp(`(//|#|<!--|;|/\\*|^|^\\s*(-|\\d+.))\\s*(${tag})\\s*:?\\s*(.*)`, 'i');
        const match = line.match(regex);
        if (match) {
          todos.push({
            file: filePath,
            line: index + 1,
            tag: match[3].toUpperCase(),
            text: match[4] || '',
            fullLine: line.trim()
          });
        }
      });
    });
  } catch (err) {
    // Skip files that can't be read
  }
  return todos;
}

function scanDirectory(dir, todos = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        scanDirectory(fullPath, todos);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (INCLUDE_EXTS.includes(ext)) {
        const fileTodos = scanFile(fullPath);
        todos.push(...fileTodos);
      }
    }
  }
  
  return todos;
}

function generateReport(todos) {
  const byTag = {};
  const byFile = {};
  
  todos.forEach(todo => {
    if (!byTag[todo.tag]) byTag[todo.tag] = [];
    if (!byFile[todo.file]) byFile[todo.file] = [];
    byTag[todo.tag].push(todo);
    byFile[todo.file].push(todo);
  });
  
  let report = `# HOOTNER TODO Report\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total Items: ${todos.length}\n\n`;
  
  report += `## Summary by Tag\n\n`;
  Object.keys(byTag).sort().forEach(tag => {
    report += `- **${tag}**: ${byTag[tag].length}\n`;
  });
  
  report += `\n## Details by Tag\n\n`;
  Object.keys(byTag).sort().forEach(tag => {
    report += `### ${tag} (${byTag[tag].length})\n\n`;
    byTag[tag].forEach(todo => {
      const relPath = path.relative(process.cwd(), todo.file);
      report += `- \`${relPath}:${todo.line}\` - ${todo.text}\n`;
    });
    report += `\n`;
  });
  
  report += `## Details by File\n\n`;
  Object.keys(byFile).sort().forEach(file => {
    const relPath = path.relative(process.cwd(), file);
    report += `### ${relPath} (${byFile[file].length})\n\n`;
    byFile[file].forEach(todo => {
      report += `- Line ${todo.line} [${todo.tag}]: ${todo.text}\n`;
    });
    report += `\n`;
  });
  
  return report;
}

// Main execution
console.log('🦉 HOOTNER TODO Scanner\n');
console.log('Scanning workspace...\n');

const rootDir = process.cwd();
const todos = scanDirectory(rootDir);

console.log(`Found ${todos.length} items\n`);

const report = generateReport(todos);
const reportPath = path.join(rootDir, 'TODO_REPORT.md');
fs.writeFileSync(reportPath, report);

console.log(`✅ Report saved to: ${reportPath}\n`);

// Print summary
const byTag = {};
todos.forEach(todo => {
  byTag[todo.tag] = (byTag[todo.tag] || 0) + 1;
});

console.log('Summary:');
Object.keys(byTag).sort().forEach(tag => {
  console.log(`  ${tag}: ${byTag[tag]}`);
});
