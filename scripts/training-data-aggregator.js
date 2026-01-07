#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Training Data Aggregator
 * Combines multiple data sources into ML-ready formats
 */

const CONFIG = {
  sources: {
    platform: 'services/hootner-training-data.txt',
    educational: 'services/hootner-training-data-educational.txt',
    journals: 'docs/journal/',
    logs: 'docs/reports/combined.log'
  },
  output: {
    combined: 'services/training-data-combined.txt',
    jsonl: 'services/training-data.jsonl',
    csv: 'services/training-data.csv',
    embeddings: 'services/training-data-embeddings.json'
  }
};

class TrainingDataAggregator {
  constructor() {
    this.data = [];
    this.stats = {
      platform: 0,
      educational: 0,
      journals: 0,
      logs: 0,
      total: 0
    };
  }

  /**
   * Load all data sources
   */
  async loadAll() {
    console.log('📥 Loading training data sources...\n');
    
    await this.loadPlatformData();
    await this.loadEducationalData();
    await this.loadJournals();
    await this.loadLogs();
    
    this.stats.total = this.data.length;
    this.printStats();
  }

  /**
   * Load platform video data
   */
  async loadPlatformData() {
    const file = path.join(process.cwd(), CONFIG.sources.platform);
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    lines.forEach(line => {
      this.data.push({
        text: line.trim(),
        source: 'platform',
        category: this.categorize(line),
        type: 'video_content',
        timestamp: new Date().toISOString()
      });
    });
    
    this.stats.platform = lines.length;
    console.log(`✅ Platform data: ${lines.length} entries`);
  }

  /**
   * Load educational content
   */
  async loadEducationalData() {
    const file = path.join(process.cwd(), CONFIG.sources.educational);
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    lines.forEach(line => {
      this.data.push({
        text: line.trim(),
        source: 'educational',
        category: this.categorize(line),
        type: 'tutorial_content',
        timestamp: new Date().toISOString()
      });
    });
    
    this.stats.educational = lines.length;
    console.log(`✅ Educational data: ${lines.length} entries`);
  }

  /**
   * Load journal entries
   */
  async loadJournals() {
    const dir = path.join(process.cwd(), CONFIG.sources.journals);
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    let count = 0;
    
    files.forEach(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      
      lines.forEach(line => {
        if (line.length > 20) {
          this.data.push({
            text: line.trim(),
            source: 'journal',
            category: this.categorize(line),
            type: 'developer_notes',
            timestamp: file.replace('.md', '')
          });
          count++;
        }
      });
    });
    
    this.stats.journals = count;
    console.log(`✅ Journal data: ${count} entries from ${files.length} files`);
  }

  /**
   * Load Q logs (sanitized)
   */
  async loadLogs() {
    const file = path.join(process.cwd(), CONFIG.sources.logs);
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    let count = 0;
    
    lines.forEach(line => {
      const sanitized = this.sanitize(line);
      if (sanitized && sanitized.length > 20) {
        this.data.push({
          text: sanitized,
          source: 'logs',
          category: this.categorize(sanitized),
          type: 'developer_interaction',
          timestamp: new Date().toISOString()
        });
        count++;
      }
    });
    
    this.stats.logs = count;
    console.log(`✅ Log data: ${count} entries (sanitized)`);
  }

  /**
   * Categorize content
   */
  categorize(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/build|create|implement|develop/)) return 'tutorial';
    if (lower.match(/cpu|assembly|kernel|os|compiler/)) return 'systems';
    if (lower.match(/database|storage|cache|redis/)) return 'data';
    if (lower.match(/network|protocol|api|server/)) return 'networking';
    if (lower.match(/game|graphics|render|physics/)) return 'graphics';
    if (lower.match(/machine learning|neural|ai|ml/)) return 'ai';
    if (lower.match(/blockchain|crypto|smart contract/)) return 'blockchain';
    if (lower.match(/video|stream|upload|watch/)) return 'video';
    if (lower.match(/comment|like|share|subscribe/)) return 'social';
    if (lower.match(/security|auth|encrypt|firewall/)) return 'security';
    
    return 'general';
  }

  /**
   * Sanitize sensitive data
   */
  sanitize(text) {
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '<email>')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '<phone>')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '<ip>')
      .replace(/[a-f0-9]{32,}/gi, '<hash>')
      .replace(/sk_live_[a-zA-Z0-9]+/g, '<api_key>')
      .replace(/Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g, 'Bearer <token>')
      .replace(/password["\s:=]+[^\s"]+/gi, 'password <redacted>');
  }

  /**
   * Export to combined text
   */
  exportCombined() {
    const output = path.join(process.cwd(), CONFIG.output.combined);
    const content = this.data.map(d => d.text).join('\n');
    fs.writeFileSync(output, content, 'utf8');
    console.log(`\n📄 Combined text: ${output}`);
  }

  /**
   * Export to JSONL (for ML training)
   */
  exportJSONL() {
    const output = path.join(process.cwd(), CONFIG.output.jsonl);
    const lines = this.data.map(d => JSON.stringify(d)).join('\n');
    fs.writeFileSync(output, lines, 'utf8');
    console.log(`📄 JSONL format: ${output}`);
  }

  /**
   * Export to CSV
   */
  exportCSV() {
    const output = path.join(process.cwd(), CONFIG.output.csv);
    const headers = 'text,source,category,type,timestamp\n';
    const rows = this.data.map(d => 
      `"${d.text.replace(/"/g, '""')}","${d.source}","${d.category}","${d.type}","${d.timestamp}"`
    ).join('\n');
    fs.writeFileSync(output, headers + rows, 'utf8');
    console.log(`📄 CSV format: ${output}`);
  }

  /**
   * Export embeddings format
   */
  exportEmbeddings() {
    const output = path.join(process.cwd(), CONFIG.output.embeddings);
    const grouped = {};
    
    this.data.forEach(d => {
      if (!grouped[d.category]) grouped[d.category] = [];
      grouped[d.category].push(d.text);
    });
    
    fs.writeFileSync(output, JSON.stringify(grouped, null, 2), 'utf8');
    console.log(`📄 Embeddings format: ${output}`);
  }

  /**
   * Print statistics
   */
  printStats() {
    console.log('\n📊 Training Data Statistics:');
    console.log('─'.repeat(50));
    console.log(`Platform content:    ${this.stats.platform.toLocaleString()}`);
    console.log(`Educational content: ${this.stats.educational.toLocaleString()}`);
    console.log(`Journal entries:     ${this.stats.journals.toLocaleString()}`);
    console.log(`Log entries:         ${this.stats.logs.toLocaleString()}`);
    console.log('─'.repeat(50));
    console.log(`Total entries:       ${this.stats.total.toLocaleString()}`);
    
    const categories = {};
    this.data.forEach(d => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });
    
    console.log('\n📂 Categories:');
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat.padEnd(15)} ${count.toLocaleString()}`);
      });
  }

  /**
   * Run aggregation
   */
  async run() {
    console.log('🦉 HOOTNER Training Data Aggregator\n');
    
    await this.loadAll();
    
    console.log('\n📤 Exporting formats...');
    this.exportCombined();
    this.exportJSONL();
    this.exportCSV();
    this.exportEmbeddings();
    
    console.log('\n✨ Aggregation complete!\n');
  }
}

// Run if called directly
if (require.main === module) {
  const aggregator = new TrainingDataAggregator();
  aggregator.run().catch(console.error);
}

module.exports = TrainingDataAggregator;
