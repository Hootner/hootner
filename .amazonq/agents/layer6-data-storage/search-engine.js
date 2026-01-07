#!/usr/bin/env node
/**
 * Layer 6: Search Engine - Full-text search with inverted index
 * Dependencies: Layer 0 (Hash), Layer 2 (Parser), Layer 6 (Document DB)
 */

class SearchEngine {
  constructor() {
    this.documents = new Map();
    this.invertedIndex = new Map();
    this.nextDocId = 1;
  }

  // Index document
  indexDocument(content, metadata = {}) {
    const docId = this.nextDocId++;
    
    // Store document
    this.documents.set(docId, {
      id: docId,
      content,
      metadata,
      indexed: Date.now()
    });
    
    // Tokenize and build inverted index
    const tokens = this.tokenize(content);
    
    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Map());
      }
      
      const postings = this.invertedIndex.get(token);
      postings.set(docId, (postings.get(docId) || 0) + 1);
    }
    
    console.log(`[INDEX] Document ${docId} (${tokens.length} tokens)`);
    return docId;
  }

  // Tokenize text
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2); // Remove short words
  }

  // Search
  search(query, options = {}) {
    const tokens = this.tokenize(query);
    const scores = new Map();
    
    console.log(`[SEARCH] "${query}" (${tokens.length} terms)`);
    
    // Find documents containing query terms
    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) continue;
      
      const postings = this.invertedIndex.get(token);
      
      for (const [docId, freq] of postings) {
        // TF-IDF scoring
        const tf = freq;
        const idf = Math.log(this.documents.size / postings.size);
        const score = tf * idf;
        
        scores.set(docId, (scores.get(docId) || 0) + score);
      }
    }
    
    // Sort by score
    const results = Array.from(scores.entries())
      .map(([docId, score]) => ({
        document: this.documents.get(docId),
        score
      }))
      .sort((a, b) => b.score - a.score);
    
    // Apply limit
    const limited = options.limit ? results.slice(0, options.limit) : results;
    
    console.log(`[RESULTS] Found ${limited.length} documents`);
    return limited;
  }

  // Boolean search (AND, OR, NOT)
  booleanSearch(query) {
    // Simple: "term1 AND term2" or "term1 OR term2"
    const parts = query.split(/\s+(AND|OR|NOT)\s+/i);
    
    if (parts.length === 1) {
      return this.search(query);
    }
    
    let results = new Set();
    let operator = 'OR';
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].match(/^(AND|OR|NOT)$/i)) {
        operator = parts[i].toUpperCase();
        continue;
      }
      
      const termResults = new Set(
        this.search(parts[i]).map(r => r.document.id)
      );
      
      if (i === 0) {
        results = termResults;
      } else if (operator === 'AND') {
        results = new Set([...results].filter(id => termResults.has(id)));
      } else if (operator === 'OR') {
        results = new Set([...results, ...termResults]);
      } else if (operator === 'NOT') {
        results = new Set([...results].filter(id => !termResults.has(id)));
      }
    }
    
    return Array.from(results).map(id => ({ document: this.documents.get(id) }));
  }

  // Phrase search
  phraseSearch(phrase) {
    const tokens = this.tokenize(phrase);
    const candidates = new Set();
    
    // Find documents containing all terms
    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) return [];
      
      const postings = this.invertedIndex.get(token);
      if (candidates.size === 0) {
        postings.forEach((_, docId) => candidates.add(docId));
      } else {
        const intersection = new Set();
        postings.forEach((_, docId) => {
          if (candidates.has(docId)) intersection.add(docId);
        });
        candidates.clear();
        intersection.forEach(id => candidates.add(id));
      }
    }
    
    // Verify phrase order (simplified)
    const results = [];
    for (const docId of candidates) {
      const doc = this.documents.get(docId);
      if (doc.content.toLowerCase().includes(phrase.toLowerCase())) {
        results.push({ document: doc });
      }
    }
    
    console.log(`[PHRASE] "${phrase}" found in ${results.length} documents`);
    return results;
  }

  // Autocomplete
  autocomplete(prefix, limit = 5) {
    const suggestions = [];
    
    for (const term of this.invertedIndex.keys()) {
      if (term.startsWith(prefix.toLowerCase())) {
        suggestions.push(term);
      }
    }
    
    return suggestions.slice(0, limit);
  }

  // Get statistics
  stats() {
    return {
      documents: this.documents.size,
      terms: this.invertedIndex.size,
      avgTermsPerDoc: Array.from(this.documents.values())
        .reduce((sum, doc) => sum + this.tokenize(doc.content).length, 0) / this.documents.size
    };
  }
}

// Demo
if (require.main === module) {
  const search = new SearchEngine();
  
  console.log('=== Search Engine Demo ===\n');
  
  // Index documents
  search.indexDocument('The quick brown fox jumps over the lazy dog', { title: 'Doc 1' });
  search.indexDocument('A fast brown fox leaps over a sleeping dog', { title: 'Doc 2' });
  search.indexDocument('The lazy cat sleeps all day long', { title: 'Doc 3' });
  search.indexDocument('Quick thinking saves the day', { title: 'Doc 4' });
  
  console.log();
  
  // Search
  const results = search.search('quick fox', { limit: 3 });
  console.log('Results:', results.map(r => r.document.metadata.title));
  
  console.log();
  
  // Boolean search
  const boolResults = search.booleanSearch('fox AND lazy');
  console.log('Boolean:', boolResults.map(r => r.document.metadata.title));
  
  console.log();
  
  // Phrase search
  const phraseResults = search.phraseSearch('brown fox');
  console.log('Phrase:', phraseResults.map(r => r.document.metadata.title));
  
  console.log();
  
  // Autocomplete
  const suggestions = search.autocomplete('qui');
  console.log('Autocomplete "qui":', suggestions);
  
  console.log('\nStats:', search.stats());
}

module.exports = SearchEngine;
