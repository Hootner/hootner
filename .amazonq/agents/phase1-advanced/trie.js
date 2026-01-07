// Minimal Trie - Prefix Tree for String Operations
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
    this.value = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, value = null) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEnd = true;
    node.value = value;
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char);
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char);
    }
    return true;
  }

  // Autocomplete suggestions
  autocomplete(prefix, limit = 10) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char);
    }

    const results = [];
    const dfs = (node, path) => {
      if (results.length >= limit) return;
      if (node.isEnd) results.push(prefix + path);
      
      for (const [char, child] of node.children) {
        dfs(child, path + char);
      }
    };
    dfs(node, '');
    return results;
  }

  // Delete word
  delete(word) {
    const deleteHelper = (node, word, index) => {
      if (index === word.length) {
        if (!node.isEnd) return false;
        node.isEnd = false;
        return node.children.size === 0;
      }

      const char = word[index];
      const child = node.children.get(char);
      if (!child) return false;

      const shouldDelete = deleteHelper(child, word, index + 1);
      if (shouldDelete) {
        node.children.delete(char);
        return node.children.size === 0 && !node.isEnd;
      }
      return false;
    };
    deleteHelper(this.root, word, 0);
  }

  // Get all words
  getAllWords() {
    const words = [];
    const dfs = (node, path) => {
      if (node.isEnd) words.push(path);
      for (const [char, child] of node.children) {
        dfs(child, path + char);
      }
    };
    dfs(this.root, '');
    return words;
  }
}

// Demo: Dictionary with Autocomplete
const dict = new Trie();

// Add words
['apple', 'app', 'application', 'apply', 'banana', 'band', 'bandana'].forEach(word => {
  dict.insert(word);
});

console.log('Search "app":', dict.search('app')); // true
console.log('Search "appl":', dict.search('appl')); // false
console.log('Starts with "app":', dict.startsWith('app')); // true
console.log('Autocomplete "app":', dict.autocomplete('app')); // ['apple', 'application', 'apply']
console.log('Autocomplete "ban":', dict.autocomplete('ban')); // ['banana', 'band', 'bandana']

dict.delete('app');
console.log('After delete "app":', dict.search('app')); // false
console.log('All words:', dict.getAllWords());

export default Trie;
