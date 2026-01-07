# HOOTNER Training Data Pipeline

## Overview

This pipeline aggregates and preprocesses training data from multiple sources for HOOTNER's AI/ML features.

## Data Sources

1. **Platform Data** (`hootner-training-data.txt`)
   - Video titles, descriptions, comments
   - User interactions and social content
   - Platform feature descriptions

2. **Educational Data** (`hootner-training-data-educational.txt`)
   - Tutorial content and learning paths
   - Technical project descriptions
   - Skill progression tracking

3. **Journal Entries** (`docs/journal/*.md`)
   - Developer notes and insights
   - Project planning and architecture
   - Real learning patterns

4. **Q Logs** (`docs/reports/combined.log`)
   - Developer interactions (sanitized)
   - Code-related conversations
   - Technical Q&A patterns

## Usage

### 1. Aggregate Data

```bash
npm run train:aggregate
```

Combines all sources into:
- `training-data-combined.txt` - Plain text
- `training-data.jsonl` - Structured JSONL
- `training-data.csv` - CSV format
- `training-data-embeddings.json` - Grouped by category

### 2. Preprocess for ML

```bash
npm run train:preprocess
```

Generates ML-ready formats:
- `training-data-tensorflow.json` - TensorFlow.js
- `training-data-pytorch.jsonl` - PyTorch
- `training-data-hf-train.jsonl` - Hugging Face (train)
- `training-data-hf-test.jsonl` - Hugging Face (test)
- `training-data-openai.jsonl` - OpenAI fine-tuning
- `training-data-vectordb.json` - Vector databases
- `training-data-recommendations.json` - Recommendation engine
- `training-data-stats.json` - Statistics

### 3. Run Complete Pipeline

```bash
npm run train:all
```

## Data Categories

Training data is automatically categorized:

- `tutorial` - How-to content
- `systems` - Low-level programming
- `data` - Databases and storage
- `networking` - Network protocols
- `graphics` - Games and rendering
- `ai` - Machine learning
- `blockchain` - Crypto and web3
- `video` - Video platform features
- `social` - User interactions
- `security` - Auth and encryption
- `general` - Uncategorized

## Privacy & Sanitization

All sensitive data is automatically sanitized:
- Email addresses → `<email>`
- Phone numbers → `<phone>`
- IP addresses → `<ip>`
- API keys → `<api_key>`
- Tokens → `<token>`
- Passwords → `<redacted>`

## Use Cases

### 1. Content Recommendations
```javascript
// Use training-data-recommendations.json
const recommendations = require('./training-data-recommendations.json');
const similar = recommendations['tutorial']; // Get similar tutorials
```

### 2. Search & Discovery
```javascript
// Use training-data-vectordb.json for semantic search
const vectorData = require('./training-data-vectordb.json');
// Feed to Pinecone, Weaviate, or Milvus
```

### 3. Code Editor AI
```javascript
// Use educational + journal data for context-aware assistance
const tfData = require('./training-data-tensorflow.json');
// Train custom model or fine-tune existing
```

### 4. Learning Path Suggestions
```javascript
// Use category distribution to suggest next steps
const stats = require('./training-data-stats.json');
console.log(stats.category_distribution);
```

## ML Framework Integration

### TensorFlow.js
```javascript
const data = require('./training-data-tensorflow.json');
// data.vocab, data.labels, data.data ready to use
```

### PyTorch
```python
import json
with open('training-data-pytorch.jsonl') as f:
    data = [json.loads(line) for line in f]
```

### Hugging Face
```python
from datasets import load_dataset
dataset = load_dataset('json', 
    data_files={
        'train': 'training-data-hf-train.jsonl',
        'test': 'training-data-hf-test.jsonl'
    })
```

### OpenAI Fine-tuning
```bash
openai api fine_tunes.create \
  -t training-data-openai.jsonl \
  -m gpt-3.5-turbo
```

## Statistics

Run aggregation to see:
- Total entries per source
- Category distribution
- Vocabulary size
- Average text length
- Source breakdown

## Adding New Sources

Edit `scripts/training-data-aggregator.js`:

```javascript
CONFIG.sources.myNewSource = 'path/to/data.txt';

async loadMyNewSource() {
  // Load and process your data
  this.data.push({
    text: 'content',
    source: 'myNewSource',
    category: this.categorize('content'),
    type: 'custom_type',
    timestamp: new Date().toISOString()
  });
}
```

## Best Practices

1. **Run aggregation regularly** as new data is added
2. **Review sanitization** to ensure no PII leaks
3. **Balance categories** for better model performance
4. **Version your datasets** for reproducibility
5. **Monitor data quality** using stats output

## Next Steps

1. Train recommendation model using TensorFlow data
2. Build semantic search with vector embeddings
3. Fine-tune code editor AI with educational content
4. Create learning path suggestions from category data
5. Implement content moderation using trained models

---

**The Owl Never Sleeps** 🦉
