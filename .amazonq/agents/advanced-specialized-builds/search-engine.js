class SearchEngine {
    constructor() {
        this.documents = [];
        this.index = {};
    }
    
    addDocument(id, content) {
        this.documents.push({ id, content });
        this.indexDocument(id, content);
    }
    
    indexDocument(id, content) {
        const words = content.toLowerCase().match(/\w+/g) || [];
        
        words.forEach(word => {
            if (!this.index[word]) {
                this.index[word] = [];
            }
            if (!this.index[word].includes(id)) {
                this.index[word].push(id);
            }
        });
    }
    
    search(query) {
        const words = query.toLowerCase().match(/\w+/g) || [];
        const results = new Map();
        
        words.forEach(word => {
            const docIds = this.index[word] || [];
            docIds.forEach(id => {
                results.set(id, (results.get(id) || 0) + 1);
            });
        });
        
        // Sort by relevance (word count)
        const sorted = Array.from(results.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => ({
                id,
                score,
                content: this.documents.find(d => d.id === id).content
            }));
        
        return sorted;
    }
    
    rank(results, query) {
        return results.map(result => {
            const words = query.toLowerCase().match(/\w+/g) || [];
            const content = result.content.toLowerCase();
            
            // TF-IDF simplified
            let score = 0;
            words.forEach(word => {
                const tf = (content.match(new RegExp(word, 'g')) || []).length;
                const idf = Math.log(this.documents.length / (this.index[word]?.length || 1));
                score += tf * idf;
            });
            
            return { ...result, rankScore: score };
        }).sort((a, b) => b.rankScore - a.rankScore);
    }
}

// Test
const engine = new SearchEngine();

engine.addDocument(1, 'The quick brown fox jumps over the lazy dog');
engine.addDocument(2, 'A quick brown dog runs in the park');
engine.addDocument(3, 'The lazy cat sleeps all day');
engine.addDocument(4, 'Quick thinking saves the day');

console.log('Search results for "quick brown":');
const results = engine.search('quick brown');
results.forEach(r => {
    console.log(`  [${r.id}] Score: ${r.score} - ${r.content}`);
});

console.log('\nRanked results:');
const ranked = engine.rank(results, 'quick brown');
ranked.forEach(r => {
    console.log(`  [${r.id}] Rank: ${r.rankScore.toFixed(2)} - ${r.content}`);
});
