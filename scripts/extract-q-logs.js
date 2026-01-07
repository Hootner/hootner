#!/usr/bin/env node

/**
 * Q Conversation Log Extractor
 * Extracts your AI collaboration patterns for HOOTNER training
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class QLogExtractor {
  constructor() {
    this.conversations = [];
    this.stats = {
      files: 0,
      conversations: 0,
      words: 0
    };
  }

  /**
   * Find Q log locations
   */
  findQLogs() {
    const possiblePaths = [
      // Project logs
      path.join(process.cwd(), 'docs/reports/combined.log'),
      path.join(process.cwd(), '.amazonq/logs'),
      
      // User home directory
      path.join(os.homedir(), '.aws/amazonq/logs'),
      path.join(os.homedir(), '.amazonq/logs'),
      path.join(os.homedir(), 'AppData/Local/Amazon Q/logs'),
      path.join(os.homedir(), 'Library/Application Support/Amazon Q/logs'),
      
      // VS Code extension logs
      path.join(os.homedir(), '.vscode/extensions'),
      path.join(os.homedir(), 'AppData/Roaming/Code/logs')
    ];

    const foundPaths = [];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPaths.push(p);
      }
    }

    return foundPaths;
  }

  /**
   * Extract conversations from log file
   */
  extractFromLog(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let currentConversation = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and system logs
        if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('{')) {
          continue;
        }
        
        // Detect conversation boundaries
        if (trimmed.length > 10) {
          currentConversation.push(trimmed);
        }
        
        // Save conversation if it's substantial
        if (currentConversation.length > 5) {
          this.conversations.push(currentConversation.join('\n'));
          currentConversation = [];
        }
      }
      
      // Add last conversation
      if (currentConversation.length > 0) {
        this.conversations.push(currentConversation.join('\n'));
      }
      
    } catch (e) {
      console.log(`   ✗ Could not read ${filePath}`);
    }
  }

  /**
   * Extract from directory
   */
  extractFromDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          this.extractFromDirectory(filePath);
        } else if (file.endsWith('.log') || file.endsWith('.txt')) {
          this.extractFromLog(filePath);
          this.stats.files++;
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }

  /**
   * Format conversations for training
   */
  formatForTraining() {
    const formatted = [];
    
    for (const conv of this.conversations) {
      // Clean up the conversation
      let cleaned = conv
        .replace(/\[.*?\]/g, '') // Remove timestamps
        .replace(/\{.*?\}/g, '') // Remove JSON
        .replace(/https?:\/\/\S+/g, '') // Remove URLs
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleaned.length > 50) {
        formatted.push(cleaned);
      }
    }
    
    return formatted.join('\n\n');
  }

  /**
   * Save to training data
   */
  save() {
    const output = this.formatForTraining();
    const outputPath = path.join(process.cwd(), 'services/training-data-q-conversations.txt');
    
    fs.writeFileSync(outputPath, output, 'utf8');
    
    this.stats.conversations = this.conversations.length;
    this.stats.words = output.split(/\s+/).length;
    
    console.log(`\n✅ Saved to: ${outputPath}`);
    console.log(`📊 Conversations: ${this.stats.conversations}`);
    console.log(`📊 Words: ${this.stats.words.toLocaleString()}`);
  }

  /**
   * Manual input option
   */
  manualInput() {
    console.log('\n📝 Manual Q Conversation Input');
    console.log('Paste your Q conversations below, then press Ctrl+D (Unix) or Ctrl+Z (Windows):\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const lines = [];
    rl.on('line', (line) => {
      lines.push(line);
    });
    
    rl.on('close', () => {
      const content = lines.join('\n');
      const outputPath = path.join(process.cwd(), 'services/training-data-q-conversations.txt');
      fs.writeFileSync(outputPath, content, 'utf8');
      
      const words = content.split(/\s+/).length;
      console.log(`\n✅ Saved ${words.toLocaleString()} words to ${outputPath}`);
      console.log('\n▶️  Run pipeline to include in training:');
      console.log('   node run-training-pipeline.js\n');
    });
  }

  /**
   * Run extraction
   */
  run(manual = false) {
    console.log('🦉 Q Conversation Log Extractor\n');
    
    if (manual) {
      this.manualInput();
      return;
    }
    
    console.log('🔍 Searching for Q logs...\n');
    
    const logPaths = this.findQLogs();
    
    if (logPaths.length === 0) {
      console.log('❌ No Q logs found automatically.\n');
      console.log('💡 Options:');
      console.log('1. Run with --manual flag to paste conversations');
      console.log('2. Check if Q logs exist in:');
      console.log('   - docs/reports/combined.log');
      console.log('   - ~/.aws/amazonq/logs');
      console.log('   - %APPDATA%/Amazon Q/logs\n');
      return;
    }
    
    console.log(`✅ Found ${logPaths.length} log location(s):\n`);
    logPaths.forEach(p => console.log(`   ${p}`));
    console.log();
    
    console.log('📥 Extracting conversations...\n');
    
    for (const logPath of logPaths) {
      const stat = fs.statSync(logPath);
      
      if (stat.isDirectory()) {
        this.extractFromDirectory(logPath);
      } else {
        this.extractFromLog(logPath);
        this.stats.files++;
      }
    }
    
    if (this.conversations.length === 0) {
      console.log('❌ No conversations extracted.\n');
      console.log('💡 Try manual input:');
      console.log('   node scripts/extract-q-logs.js --manual\n');
      return;
    }
    
    console.log(`✅ Extracted from ${this.stats.files} file(s)\n`);
    
    this.save();
    
    console.log('\n▶️  Run pipeline to include in training:');
    console.log('   node run-training-pipeline.js\n');
  }
}

// Run
if (require.main === module) {
  const args = process.argv.slice(2);
  const manual = args.includes('--manual');
  
  const extractor = new QLogExtractor();
  extractor.run(manual);
}

module.exports = QLogExtractor;
