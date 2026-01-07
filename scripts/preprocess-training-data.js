#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * ML Training Data Preprocessor
 * Formats data for TensorFlow, PyTorch, Hugging Face, etc.
 */

class TrainingDataPreprocessor {
  constructor(inputFile = 'services/training-data.jsonl') {
    this.inputFile = path.join(process.cwd(), inputFile);
    this.data = [];
    this.vocab = new Set();
    this.labelMap = {};
  }

  /**
   * Load JSONL data
   */
  load() {
    console.log('📥 Loading training data...\n');
    const content = fs.readFileSync(this.inputFile, 'utf8');
    this.data = content.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    console.log(`✅ Loaded ${this.data.length} entries`);
  }

  /**
   * Build vocabulary
   */
  buildVocab() {
    console.log('\n📚 Building vocabulary...');
    this.data.forEach(item => {
      const tokens = this.tokenize(item.text);
      tokens.forEach(token => this.vocab.add(token));
    });
    console.log(`✅ Vocabulary size: ${this.vocab.size}`);
  }

  /**
   * Tokenize text
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  /**
   * Create label mapping
   */
  createLabelMap() {
    const categories = [...new Set(this.data.map(d => d.category))];
    categories.forEach((cat, idx) => {
      this.labelMap[cat] = idx;
    });
    console.log(`\n🏷️  Labels: ${Object.keys(this.labelMap).length}`);
  }

  /**
   * Export for TensorFlow.js
   */
  exportTensorFlow() {
    const output = {
      metadata: {
        vocab_size: this.vocab.size,
        num_classes: Object.keys(this.labelMap).length,
        max_length: 100
      },
      vocab: Array.from(this.vocab),
      labels: this.labelMap,
      data: this.data.map(item => ({
        text: item.text,
        tokens: this.tokenize(item.text).slice(0, 100),
        label: this.labelMap[item.category],
        category: item.category
      }))
    };

    const file = 'services/training-data-tensorflow.json';
    fs.writeFileSync(file, JSON.stringify(output, null, 2));
    console.log(`\n📄 TensorFlow format: ${file}`);
  }

  /**
   * Export for PyTorch
   */
  exportPyTorch() {
    const output = this.data.map(item => ({
      input_ids: this.tokenize(item.text).slice(0, 100),
      label: this.labelMap[item.category],
      attention_mask: Array(Math.min(this.tokenize(item.text).length, 100)).fill(1)
    }));

    const file = 'services/training-data-pytorch.jsonl';
    const content = output.map(o => JSON.stringify(o)).join('\n');
    fs.writeFileSync(file, content);
    console.log(`📄 PyTorch format: ${file}`);
  }

  /**
   * Export for Hugging Face
   */
  exportHuggingFace() {
    const train = [];
    const test = [];
    
    this.data.forEach((item, idx) => {
      const entry = {
        text: item.text,
        label: item.category
      };
      (idx % 10 === 0 ? test : train).push(entry);
    });

    fs.writeFileSync(
      'services/training-data-hf-train.jsonl',
      train.map(e => JSON.stringify(e)).join('\n')
    );
    fs.writeFileSync(
      'services/training-data-hf-test.jsonl',
      test.map(e => JSON.stringify(e)).join('\n')
    );

    console.log(`📄 Hugging Face: train (${train.length}) + test (${test.length})`);
  }

  /**
   * Export for OpenAI fine-tuning
   */
  exportOpenAI() {
    const output = this.data.map(item => ({
      messages: [
        { role: 'system', content: 'You are a helpful assistant for the HOOTNER platform.' },
        { role: 'user', content: `Categorize: ${item.text}` },
        { role: 'assistant', content: item.category }
      ]
    }));

    const file = 'services/training-data-openai.jsonl';
    fs.writeFileSync(file, output.map(o => JSON.stringify(o)).join('\n'));
    console.log(`📄 OpenAI format: ${file}`);
  }

  /**
   * Export embeddings for vector DB
   */
  exportVectorDB() {
    const output = this.data.map((item, idx) => ({
      id: idx,
      text: item.text,
      metadata: {
        source: item.source,
        category: item.category,
        type: item.type,
        timestamp: item.timestamp
      }
    }));

    const file = 'services/training-data-vectordb.json';
    fs.writeFileSync(file, JSON.stringify(output, null, 2));
    console.log(`📄 Vector DB format: ${file}`);
  }

  /**
   * Export for recommendation engine
   */
  exportRecommendations() {
    const grouped = {};
    
    this.data.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push({
        text: item.text,
        type: item.type,
        source: item.source
      });
    });

    const file = 'services/training-data-recommendations.json';
    fs.writeFileSync(file, JSON.stringify(grouped, null, 2));
    console.log(`📄 Recommendations format: ${file}`);
  }

  /**
   * Generate statistics
   */
  generateStats() {
    const stats = {
      total_entries: this.data.length,
      vocab_size: this.vocab.size,
      categories: Object.keys(this.labelMap).length,
      sources: [...new Set(this.data.map(d => d.source))],
      types: [...new Set(this.data.map(d => d.type))],
      avg_length: Math.round(
        this.data.reduce((sum, d) => sum + d.text.length, 0) / this.data.length
      ),
      category_distribution: {}
    };

    Object.keys(this.labelMap).forEach(cat => {
      stats.category_distribution[cat] = this.data.filter(d => d.category === cat).length;
    });

    const file = 'services/training-data-stats.json';
    fs.writeFileSync(file, JSON.stringify(stats, null, 2));
    console.log(`\n📊 Statistics: ${file}`);
    
    console.log('\n📈 Quick Stats:');
    console.log(`  Total entries: ${stats.total_entries.toLocaleString()}`);
    console.log(`  Vocabulary: ${stats.vocab_size.toLocaleString()} tokens`);
    console.log(`  Categories: ${stats.categories}`);
    console.log(`  Avg length: ${stats.avg_length} chars`);
  }

  /**
   * Run preprocessing
   */
  run() {
    console.log('🦉 HOOTNER Training Data Preprocessor\n');
    
    this.load();
    this.buildVocab();
    this.createLabelMap();
    
    console.log('\n📤 Exporting ML formats...');
    this.exportTensorFlow();
    this.exportPyTorch();
    this.exportHuggingFace();
    this.exportOpenAI();
    this.exportVectorDB();
    this.exportRecommendations();
    
    this.generateStats();
    
    console.log('\n✨ Preprocessing complete!\n');
  }
}

// Run if called directly
if (require.main === module) {
  const preprocessor = new TrainingDataPreprocessor();
  preprocessor.run();
}

module.exports = TrainingDataPreprocessor;
