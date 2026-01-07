// Minimal Vector Database - Embeddings, Similarity Search, Indexing
class VectorDB {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.vectors = [];
    this.index = new Map();
  }

  // Add vector
  add(id, vector, metadata = {}) {
    if (vector.length !== this.dimensions) {
      throw new Error(`Vector must have ${this.dimensions} dimensions`);
    }

    this.vectors.push({ id, vector, metadata });
    this.index.set(id, this.vectors.length - 1);
  }

  // Cosine similarity
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Euclidean distance
  euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  // Search similar vectors
  search(queryVector, k = 5, metric = 'cosine') {
    if (queryVector.length !== this.dimensions) {
      throw new Error(`Query vector must have ${this.dimensions} dimensions`);
    }

    const results = this.vectors.map(item => {
      const similarity = metric === 'cosine' 
        ? this.cosineSimilarity(queryVector, item.vector)
        : -this.euclideanDistance(queryVector, item.vector); // Negative for sorting

      return { ...item, similarity };
    });

    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, k);
  }

  // Get by ID
  get(id) {
    const idx = this.index.get(id);
    return idx !== undefined ? this.vectors[idx] : null;
  }

  // Delete
  delete(id) {
    const idx = this.index.get(id);
    if (idx !== undefined) {
      this.vectors.splice(idx, 1);
      this.index.delete(id);
      // Rebuild index
      this.vectors.forEach((v, i) => this.index.set(v.id, i));
    }
  }

  size() {
    return this.vectors.length;
  }
}

// Demo: Document Embeddings
console.log('=== Vector Database Demo ===\n');

const db = new VectorDB(5); // 5-dimensional vectors

// Mock embeddings for documents
const docs = [
  { id: 'doc1', text: 'Machine learning tutorial', vector: [0.8, 0.6, 0.1, 0.2, 0.3] },
  { id: 'doc2', text: 'Deep learning basics', vector: [0.7, 0.7, 0.2, 0.1, 0.2] },
  { id: 'doc3', text: 'Cooking recipes', vector: [0.1, 0.2, 0.9, 0.8, 0.1] },
  { id: 'doc4', text: 'Neural networks guide', vector: [0.75, 0.65, 0.15, 0.25, 0.3] },
  { id: 'doc5', text: 'Italian cuisine', vector: [0.2, 0.1, 0.85, 0.9, 0.15] }
];

// Add documents
docs.forEach(doc => {
  db.add(doc.id, doc.vector, { text: doc.text });
});

console.log(`Added ${db.size()} documents\n`);

// Search: ML-related query
console.log('--- Search: ML-related query ---');
const mlQuery = [0.75, 0.65, 0.1, 0.15, 0.25];
const mlResults = db.search(mlQuery, 3);

mlResults.forEach((result, i) => {
  console.log(`${i + 1}. ${result.metadata.text}`);
  console.log(`   Similarity: ${result.similarity.toFixed(4)}\n`);
});

// Search: Cooking-related query
console.log('--- Search: Cooking-related query ---');
const cookingQuery = [0.15, 0.15, 0.9, 0.85, 0.1];
const cookingResults = db.search(cookingQuery, 2);

cookingResults.forEach((result, i) => {
  console.log(`${i + 1}. ${result.metadata.text}`);
  console.log(`   Similarity: ${result.similarity.toFixed(4)}\n`);
});

export default VectorDB;
