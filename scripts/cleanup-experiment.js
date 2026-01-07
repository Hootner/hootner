#!/usr/bin/env node

/**
 * CSS Cleanup Experiment
 * Aggressively clean test-page.html until perfect
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFile = path.join(process.cwd(), 'apps/frontend/html-pages/test-page.html');
const backupFile = testFile.replace('.html', '-backup.html');

console.log('🧪 CSS Cleanup Experiment\n');

// Backup original
fs.copyFileSync(testFile, backupFile);
console.log('✅ Backed up to test-page-backup.html\n');

let content = fs.readFileSync(testFile, 'utf8');
let iteration = 1;

function attempt(description, cleanupFn) {
  console.log(`\n🔄 Attempt ${iteration}: ${description}`);
  try {
    const result = cleanupFn(content);
    
    // Validate result
    if (!result.includes('<!DOCTYPE html>')) throw new Error('Lost DOCTYPE');
    if (!result.includes('</html>')) throw new Error('Lost closing html tag');
    if (result.length < 500) throw new Error('File too small, probably broke');
    
    content = result;
    fs.writeFileSync(testFile, content);
    console.log(`✅ Success - ${content.length} chars`);
    iteration++;
    return true;
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
    // Restore from backup
    content = fs.readFileSync(backupFile, 'utf8');
    return false;
  }
}

// Attempt 1: Remove all <style> blocks
attempt('Remove all <style> blocks', (html) => {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
});

// Attempt 2: Remove inline style attributes
attempt('Remove inline style="" attributes', (html) => {
  return html.replace(/\s+style="[^"]*"/gi, '');
});

// Attempt 3: Replace common patterns with design system classes
attempt('Replace margin-top: 0 with utility classes', (html) => {
  // This is where we'd add class replacements
  return html; // No changes yet, just testing
});

// Attempt 4: Clean up redundant classes
attempt('Remove duplicate classes', (html) => {
  return html.replace(/class="([^"]*)\s+\1"/g, 'class="$1"');
});

// Attempt 5: Optimize whitespace
attempt('Optimize whitespace', (html) => {
  return html
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 newlines
    .replace(/  +/g, ' '); // Multiple spaces to single
});

// Final report
console.log('\n' + '='.repeat(60));
console.log('📊 Cleanup Results');
console.log('='.repeat(60));

const original = fs.readFileSync(backupFile, 'utf8');
const cleaned = fs.readFileSync(testFile, 'utf8');

const originalSize = original.length;
const cleanedSize = cleaned.length;
const reduction = ((originalSize - cleanedSize) / originalSize * 100).toFixed(1);

console.log(`Original: ${originalSize} chars`);
console.log(`Cleaned:  ${cleanedSize} chars`);
console.log(`Reduced:  ${reduction}%`);

// Count style blocks
const originalStyles = (original.match(/<style/g) || []).length;
const cleanedStyles = (cleaned.match(/<style/g) || []).length;
console.log(`\nStyle blocks: ${originalStyles} → ${cleanedStyles}`);

// Count inline styles
const originalInline = (original.match(/style="/g) || []).length;
const cleanedInline = (cleaned.match(/style="/g) || []).length;
console.log(`Inline styles: ${originalInline} → ${cleanedInline}`);

console.log('\n✅ Experiment complete!');
console.log('📁 Files:');
console.log('   - test-page.html (cleaned)');
console.log('   - test-page-backup.html (original)');
console.log('\n💡 Open both in browser to compare');
