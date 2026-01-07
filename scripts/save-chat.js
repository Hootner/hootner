#!/usr/bin/env node
/**
 * Save chat summary - Run this before closing chat
 * Usage: npm run journal:save "Brief summary of what we discussed"
 */

import fs from 'fs/promises';

const summary = process.argv.slice(2).join(' ') || 'Chat session completed';
const today = new Date().toISOString().split('T')[0];
const journalFile = `docs/journal/${today}.md`;
const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

try {
  await fs.mkdir('docs/journal', { recursive: true });
  
  let content = '';
  try {
    content = await fs.readFile(journalFile, 'utf-8');
  } catch (e) {
    content = `# Dev Journal - ${today}\n\n`;
  }
  
  content += `\n---\n\n## ${timestamp} - 💬 Chat Closed\n\n${summary}\n\n`;
  
  await fs.writeFile(journalFile, content);
  console.log(`✅ Chat saved: ${summary}`);
} catch (error) {
  console.error('❌ Failed to save:', error.message);
}
