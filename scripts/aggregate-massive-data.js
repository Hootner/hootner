#!/usr/bin/env node

/**
 * Massive Training Data Aggregator
 * Pulls data from multiple large sources to create substantial training dataset
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MassiveDataAggregator {
  constructor() {
    this.outputDir = 'services/massive-training-data';
    this.stats = {
      codebase: 0,
      wikipedia: 0,
      github: 0,
      stackoverflow: 0,
      books: 0,
      total: 0
    };
  }

  /**
   * Create output directory
   */
  setup() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    console.log('🦉 Massive Training Data Aggregator\n');
  }

  /**
   * Extract all code from HOOTNER codebase
   */
  extractCodebase() {
    console.log('📦 Extracting HOOTNER codebase...');
    
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.md', '.json', '.yml', '.yaml'];
    const exclude = ['node_modules', 'dist', 'build', '.git', 'coverage'];
    
    let allCode = [];
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!exclude.includes(file)) {
            walkDir(filePath);
          }
        } else {
          const ext = path.extname(file);
          if (extensions.includes(ext)) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              allCode.push(`// File: ${filePath}\n${content}\n\n`);
            } catch (e) {
              // Skip unreadable files
            }
          }
        }
      }
    };
    
    walkDir(process.cwd());
    
    const output = allCode.join('');
    fs.writeFileSync(path.join(this.outputDir, 'codebase.txt'), output);
    
    this.stats.codebase = output.split(/\s+/).length;
    console.log(`✅ Codebase: ${this.stats.codebase.toLocaleString()} words\n`);
  }

  /**
   * Download Wikipedia programming articles
   */
  async downloadWikipedia() {
    console.log('📚 Downloading Wikipedia articles...');
    console.log('   (This requires internet connection)\n');
    
    const topics = [
      'Programming_language',
      'Algorithm',
      'Data_structure',
      'Software_engineering',
      'Computer_science',
      'Machine_learning',
      'Artificial_intelligence',
      'Web_development',
      'Database',
      'Operating_system',
      'Computer_network',
      'Cryptography',
      'Game_development',
      'Mobile_app_development',
      'Cloud_computing',
      'DevOps',
      'Microservices',
      'Blockchain',
      'Quantum_computing',
      'Compiler'
    ];
    
    let allText = [];
    
    for (const topic of topics) {
      try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          allText.push(`# ${data.title}\n\n${data.extract}\n\n`);
          console.log(`   ✓ ${data.title}`);
        }
      } catch (e) {
        console.log(`   ✗ ${topic} (failed)`);
      }
    }
    
    const output = allText.join('');
    fs.writeFileSync(path.join(this.outputDir, 'wikipedia.txt'), output);
    
    this.stats.wikipedia = output.split(/\s+/).length;
    console.log(`\n✅ Wikipedia: ${this.stats.wikipedia.toLocaleString()} words\n`);
  }

  /**
   * Clone popular GitHub repos for training
   */
  cloneGitHubRepos() {
    console.log('🐙 Cloning GitHub repositories...');
    console.log('   (Optional - requires git and internet)\n');
    
    const repos = [
      'https://github.com/airbnb/javascript',  // Style guide
      'https://github.com/trekhleb/javascript-algorithms',  // Algorithms
      'https://github.com/TheAlgorithms/Python',  // Python algorithms
      'https://github.com/donnemartin/system-design-primer',  // System design
      'https://github.com/jwasham/coding-interview-university'  // Interview prep
    ];
    
    const reposDir = path.join(this.outputDir, 'github-repos');
    if (!fs.existsSync(reposDir)) {
      fs.mkdirSync(reposDir, { recursive: true });
    }
    
    let allContent = [];
    
    for (const repo of repos) {
      const repoName = repo.split('/').pop();
      const repoPath = path.join(reposDir, repoName);
      
      try {
        if (!fs.existsSync(repoPath)) {
          console.log(`   Cloning ${repoName}...`);
          execSync(`git clone --depth 1 ${repo} "${repoPath}"`, { stdio: 'ignore' });
        }
        
        // Extract markdown and code files
        const extractFiles = (dir) => {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && file !== '.git' && file !== 'node_modules') {
              extractFiles(filePath);
            } else if (file.endsWith('.md') || file.endsWith('.js') || file.endsWith('.py')) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                allContent.push(content);
              } catch (e) {}
            }
          }
        };
        
        extractFiles(repoPath);
        console.log(`   ✓ ${repoName}`);
        
      } catch (e) {
        console.log(`   ✗ ${repoName} (skipped - requires git)`);
      }
    }
    
    const output = allContent.join('\n\n');
    fs.writeFileSync(path.join(this.outputDir, 'github.txt'), output);
    
    this.stats.github = output.split(/\s+/).length;
    console.log(`\n✅ GitHub: ${this.stats.github.toLocaleString()} words\n`);
  }

  /**
   * Generate synthetic programming Q&A
   */
  generateSyntheticQA() {
    console.log('💬 Generating synthetic Q&A...');
    
    const qa = [];
    
    // Common programming questions and answers
    const questions = [
      { q: 'How do I reverse a string in JavaScript?', a: 'Use string.split("").reverse().join("") or spread operator [...string].reverse().join("")' },
      { q: 'What is the difference between let and const?', a: 'let allows reassignment, const prevents reassignment but allows mutation of objects and arrays' },
      { q: 'How do I make an HTTP request?', a: 'Use fetch API, axios library, or XMLHttpRequest for making HTTP requests in JavaScript' },
      { q: 'What is a closure?', a: 'A closure is a function that has access to variables in its outer scope even after the outer function has returned' },
      { q: 'How do I sort an array?', a: 'Use array.sort() with optional compare function for custom sorting logic' },
      { q: 'What is async await?', a: 'Async await is syntactic sugar for promises that makes asynchronous code look synchronous' },
      { q: 'How do I handle errors?', a: 'Use try catch blocks for synchronous code and catch method for promises' },
      { q: 'What is the event loop?', a: 'The event loop handles asynchronous operations by processing callbacks from the callback queue' },
      { q: 'How do I optimize performance?', a: 'Use profiling, reduce complexity, cache results, lazy load, and minimize network requests' },
      { q: 'What is REST API?', a: 'REST is an architectural style using HTTP methods for CRUD operations on resources' }
    ];
    
    questions.forEach(({ q, a }) => {
      qa.push(`Question: ${q}\nAnswer: ${a}\n\n`);
    });
    
    const output = qa.join('');
    fs.writeFileSync(path.join(this.outputDir, 'qa.txt'), output);
    
    this.stats.stackoverflow = output.split(/\s+/).length;
    console.log(`✅ Q&A: ${this.stats.stackoverflow.toLocaleString()} words\n`);
  }

  /**
   * Add programming books content (public domain)
   */
  addBooks() {
    console.log('📖 Adding programming books...');
    
    const books = `
Structure and Interpretation of Computer Programs teaches fundamental programming concepts
The Art of Computer Programming by Donald Knuth covers algorithms comprehensively
Clean Code by Robert Martin explains writing maintainable code
Design Patterns by Gang of Four documents reusable object oriented solutions
Introduction to Algorithms provides comprehensive algorithm analysis
The Pragmatic Programmer offers practical software development advice
Code Complete covers software construction best practices
Refactoring improves existing code without changing behavior
Working Effectively with Legacy Code helps maintain old systems
Domain Driven Design connects software to business domains
Test Driven Development writes tests before implementation
Continuous Delivery automates software release process
Site Reliability Engineering ensures system reliability
Building Microservices designs distributed systems
Designing Data Intensive Applications handles big data
The Phoenix Project teaches DevOps through narrative
The Mythical Man Month discusses software project management
Peopleware addresses human factors in software development
The Lean Startup applies lean principles to startups
Zero to One discusses building innovative companies
    `.trim();
    
    fs.writeFileSync(path.join(this.outputDir, 'books.txt'), books);
    
    this.stats.books = books.split(/\s+/).length;
    console.log(`✅ Books: ${this.stats.books.toLocaleString()} words\n`);
  }

  /**
   * Combine all sources
   */
  combineAll() {
    console.log('🔗 Combining all sources...');
    
    const files = fs.readdirSync(this.outputDir)
      .filter(f => f.endsWith('.txt'))
      .map(f => path.join(this.outputDir, f));
    
    let combined = [];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      combined.push(content);
    }
    
    const output = combined.join('\n\n');
    const finalPath = 'services/training-data-massive.txt';
    fs.writeFileSync(finalPath, output);
    
    this.stats.total = output.split(/\s+/).length;
    
    console.log(`\n✅ Combined to: ${finalPath}`);
    console.log(`📊 Total: ${this.stats.total.toLocaleString()} words\n`);
  }

  /**
   * Print final statistics
   */
  printStats() {
    console.log('📈 Final Statistics:');
    console.log('─'.repeat(50));
    console.log(`Codebase:        ${this.stats.codebase.toLocaleString()} words`);
    console.log(`Wikipedia:       ${this.stats.wikipedia.toLocaleString()} words`);
    console.log(`GitHub:          ${this.stats.github.toLocaleString()} words`);
    console.log(`Q&A:             ${this.stats.stackoverflow.toLocaleString()} words`);
    console.log(`Books:           ${this.stats.books.toLocaleString()} words`);
    console.log('─'.repeat(50));
    console.log(`TOTAL:           ${this.stats.total.toLocaleString()} words`);
    console.log('─'.repeat(50));
    
    const chars = this.stats.total * 5; // Rough estimate
    const mb = (chars / 1024 / 1024).toFixed(2);
    console.log(`Estimated size:  ${mb} MB`);
    console.log(`\n▶️  Train model:`);
    console.log(`   python services/transformer-llm-service.py\n`);
  }

  /**
   * Run aggregation
   */
  async run() {
    this.setup();
    
    this.extractCodebase();
    await this.downloadWikipedia();
    this.cloneGitHubRepos();
    this.generateSyntheticQA();
    this.addBooks();
    
    this.combineAll();
    this.printStats();
    
    console.log('✨ Massive data aggregation complete!\n');
  }
}

// Run
if (require.main === module) {
  const aggregator = new MassiveDataAggregator();
  aggregator.run().catch(console.error);
}

module.exports = MassiveDataAggregator;
