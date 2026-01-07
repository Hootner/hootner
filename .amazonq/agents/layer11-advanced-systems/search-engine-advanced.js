#!/usr/bin/env node
/**
 * Layer 11: Search Engine - Web search with crawling and ranking
 * Dependencies: Layer 5 (HTTP Client), Layer 6 (Search Engine, Database)
 */

class SearchEngine {
  constructor() {
    this.index = new Map();
    this.documents = new Map();
    this.pageRank = new Map();
    this.links = new Map();
  }

  // Crawl and index document
  crawl(url, content, outLinks = []) {
    const docId = this.documents.size;
    
    this.documents.set(docId, {
      id: docId,
      url,
      content,
      title: this.extractTitle(content),
      crawled: Date.now()
    });
    
    // Store links for PageRank
    this.links.set(docId, outLinks);
    
    // Index content
    this.indexDocument(docId, content);
    
    console.log(`[CRAWL] ${url} (${outLinks.length} links)`);
  }

  // Extract title
  extractTitle(content) {
    const match = content.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : 'Untitled';
  }

  // Index document
  indexDocument(docId, content) {
    const tokens = this.tokenize(content);
    
    for (const token of tokens) {
      if (!this.index.has(token)) {
        this.index.set(token, new Map());
      }
      
      const postings = this.index.get(token);
      postings.set(docId, (postings.get(docId) || 0) + 1);
    }
  }

  // Tokenize text
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/<[^>]*>/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  // Calculate PageRank
  calculatePageRank(iterations = 10, damping = 0.85) {
    const n = this.documents.size;
    
    // Initialize
    for (let i = 0; i < n; i++) {
      this.pageRank.set(i, 1 / n);
    }
    
    // Iterate
    for (let iter = 0; iter < iterations; iter++) {
      const newRank = new Map();
      
      for (let i = 0; i < n; i++) {
        let rank = (1 - damping) / n;
        
        // Sum contributions from incoming links
        for (let j = 0; j < n; j++) {
          const outLinks = this.links.get(j) || [];
          if (outLinks.includes(i)) {
            rank += damping * this.pageRank.get(j) / outLinks.length;
          }
        }
        
        newRank.set(i, rank);
      }
      
      this.pageRank = newRank;
    }
    
    console.log('[PAGERANK] Calculated');
  }

  // Search
  search(query, limit = 10) {
    const tokens = this.tokenize(query);
    const scores = new Map();
    
    console.log(`[SEARCH] "${query}"`);
    
    // Score documents
    for (const token of tokens) {
      const postings = this.index.get(token);
      if (!postings) continue;
      
      for (const [docId, freq] of postings) {
        // TF-IDF
        const tf = freq;
        const idf = Math.log(this.documents.size / postings.size);
        const tfidf = tf * idf;
        
        // PageRank boost
        const pr = this.pageRank.get(docId) || 0;
        
        const score = tfidf * (1 + pr * 10);
        scores.set(docId, (scores.get(docId) || 0) + score);
      }
    }
    
    // Sort and return
    const results = Array.from(scores.entries())
      .map(([docId, score]) => ({
        document: this.documents.get(docId),
        score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    console.log(`[RESULTS] ${results.length} documents`);
    return results;
  }

  // Autocomplete
  autocomplete(prefix, limit = 5) {
    const suggestions = [];
    
    for (const term of this.index.keys()) {
      if (term.startsWith(prefix.toLowerCase())) {
        suggestions.push(term);
      }
    }
    
    return suggestions.slice(0, limit);
  }

  // Get stats
  stats() {
    return {
      documents: this.documents.size,
      terms: this.index.size,
      avgTermsPerDoc: Array.from(this.documents.values())
        .reduce((sum, doc) => sum + this.tokenize(doc.content).length, 0) / this.documents.size
    };
  }
}

// Demo
if (require.main === module) {
  const search = new SearchEngine();
  
  console.log('=== Search Engine Demo ===\n');
  
  // Crawl documents
  search.crawl('http://example.com/page1', 
    '<title>Machine Learning</title><body>Machine learning is a subset of artificial intelligence</body>',
    [1, 2]
  );
  
  search.crawl('http://example.com/page2',
    '<title>Deep Learning</title><body>Deep learning uses neural networks for machine learning</body>',
    [0]
  );
  
  search.crawl('http://example.com/page3',
    '<title>AI Overview</title><body>Artificial intelligence includes machine learning and deep learning</body>',
    [0, 1]
  );
  
  console.log();
  
  // Calculate PageRank
  search.calculatePageRank();
  
  console.log();
  
  // Search
  const results = search.search('machine learning');
  results.forEach(r => {
    console.log(`  ${r.document.title} (score: ${r.score.toFixed(2)})`);
  });
  
  console.log();
  
  // Autocomplete
  console.log('Autocomplete "mach":', search.autocomplete('mach'));
  
  console.log('\nStats:', search.stats());
}

module.exports = SearchEngine;
