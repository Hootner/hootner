#!/usr/bin/env node

/**
 * CSS Analyzer - Figure out the CSS situation before fixing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlDir = path.join(process.cwd(), 'apps/frontend/html-pages');
const results = {
  files: [],
  totalStyles: 0,
  totalLines: 0,
  duplicates: new Map(),
  issues: []
};

function extractStyles(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const styleBlocks = [];
  const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    styleBlocks.push(match[1]);
  }
  
  return styleBlocks;
}

function analyzeFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const styles = extractStyles(filePath);
  const totalLines = styles.join('\n').split('\n').length;
  
  const analysis = {
    file: fileName,
    styleBlocks: styles.length,
    totalLines,
    hasInlineStyles: content.includes('style='),
    hasTailwind: content.includes('tailwind'),
    commonClasses: []
  };
  
  // Check for common patterns
  if (content.includes('.container')) analysis.commonClasses.push('container');
  if (content.includes('.btn')) analysis.commonClasses.push('btn');
  if (content.includes('.card')) analysis.commonClasses.push('card');
  if (content.includes('flex')) analysis.commonClasses.push('flex');
  if (content.includes('grid')) analysis.commonClasses.push('grid');
  
  return analysis;
}

// Scan all HTML files
const htmlFiles = fs.readdirSync(htmlDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(htmlDir, f));

console.log('🔍 Analyzing CSS across', htmlFiles.length, 'HTML files...\n');

htmlFiles.forEach(file => {
  const analysis = analyzeFile(file);
  results.files.push(analysis);
  results.totalStyles += analysis.styleBlocks;
  results.totalLines += analysis.totalLines;
});

// Generate report
console.log('📊 CSS Analysis Report\n');
console.log('=' .repeat(60));
console.log(`Total HTML files: ${htmlFiles.length}`);
console.log(`Total <style> blocks: ${results.totalStyles}`);
console.log(`Total CSS lines: ${results.totalLines}`);
console.log(`Average lines per file: ${Math.round(results.totalLines / htmlFiles.length)}`);
console.log('=' .repeat(60));

console.log('\n📁 Per-File Breakdown:\n');
results.files
  .sort((a, b) => b.totalLines - a.totalLines)
  .forEach(f => {
    console.log(`${f.file.padEnd(30)} ${f.totalLines.toString().padStart(5)} lines, ${f.styleBlocks} blocks`);
    if (f.commonClasses.length) {
      console.log(`  └─ Uses: ${f.commonClasses.join(', ')}`);
    }
  });

console.log('\n🎯 Recommendations:\n');

if (results.totalLines > 5000) {
  console.log('⚠️  HIGH: Extract CSS to separate files (>5000 lines total)');
}

const hasConsistentPatterns = results.files.every(f => 
  f.commonClasses.includes('flex') || f.commonClasses.includes('grid')
);

if (!hasConsistentPatterns) {
  console.log('⚠️  MEDIUM: Inconsistent layout patterns across files');
}

const avgLines = results.totalLines / htmlFiles.length;
if (avgLines > 500) {
  console.log('⚠️  MEDIUM: Large CSS per file (avg >500 lines)');
}

console.log('\n💡 Suggested Approach:\n');
console.log('1. Create unified design system (colors, spacing, typography)');
console.log('2. Extract common components (buttons, cards, forms)');
console.log('3. Create shared CSS file for all pages');
console.log('4. Keep page-specific styles inline');
console.log('5. Consider CSS framework (Tailwind) or custom utility classes');

console.log('\n📝 Next Steps:\n');
console.log('Choose one:');
console.log('  A) Extract to separate CSS files');
console.log('  B) Add Tailwind CSS');
console.log('  C) Create custom design system');
console.log('  D) Unify existing inline styles');

// Save detailed report
const report = {
  summary: {
    totalFiles: htmlFiles.length,
    totalStyleBlocks: results.totalStyles,
    totalLines: results.totalLines,
    averageLinesPerFile: Math.round(results.totalLines / htmlFiles.length)
  },
  files: results.files,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(
  path.join(process.cwd(), 'CSS_ANALYSIS_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✅ Detailed report saved to: CSS_ANALYSIS_REPORT.json\n');
