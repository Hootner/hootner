#!/usr/bin/env node
/**
 * Layer 10: Version Control - Git-like version control system
 * Dependencies: Layer 3 (Filesystem), Layer 6 (Database)
 */

class VersionControl {
  constructor() {
    this.commits = new Map();
    this.branches = new Map(['main', []]);
    this.currentBranch = 'main';
    this.head = null;
    this.staging = new Map();
    this.workingDir = new Map();
  }

  // Initialize repository
  init() {
    this.branches.set('main', []);
    this.currentBranch = 'main';
    console.log('[INIT] Repository initialized');
  }

  // Add file to staging
  add(path, content) {
    this.staging.set(path, content);
    console.log(`[ADD] ${path}`);
  }

  // Commit changes
  commit(message, author = 'user') {
    const commitId = this.generateId();
    const timestamp = Date.now();
    
    const commit = {
      id: commitId,
      message,
      author,
      timestamp,
      parent: this.head,
      files: new Map(this.staging),
      branch: this.currentBranch
    };
    
    this.commits.set(commitId, commit);
    this.branches.get(this.currentBranch).push(commitId);
    this.head = commitId;
    this.staging.clear();
    
    console.log(`[COMMIT] ${commitId.slice(0, 7)} ${message}`);
    return commitId;
  }

  // Create branch
  branch(name) {
    if (this.branches.has(name)) {
      console.log(`[ERROR] Branch ${name} already exists`);
      return false;
    }
    
    this.branches.set(name, this.head ? [this.head] : []);
    console.log(`[BRANCH] Created ${name}`);
    return true;
  }

  // Switch branch
  checkout(name) {
    if (!this.branches.has(name)) {
      console.log(`[ERROR] Branch ${name} not found`);
      return false;
    }
    
    this.currentBranch = name;
    const commits = this.branches.get(name);
    this.head = commits[commits.length - 1] || null;
    
    console.log(`[CHECKOUT] Switched to ${name}`);
    return true;
  }

  // Merge branch
  merge(sourceBranch) {
    if (!this.branches.has(sourceBranch)) {
      console.log(`[ERROR] Branch ${sourceBranch} not found`);
      return false;
    }
    
    const sourceCommits = this.branches.get(sourceBranch);
    const sourceHead = sourceCommits[sourceCommits.length - 1];
    
    if (!sourceHead) {
      console.log(`[ERROR] No commits in ${sourceBranch}`);
      return false;
    }
    
    const sourceCommit = this.commits.get(sourceHead);
    
    // Simple merge: copy files from source
    for (const [path, content] of sourceCommit.files) {
      this.staging.set(path, content);
    }
    
    const mergeId = this.commit(`Merge ${sourceBranch} into ${this.currentBranch}`);
    console.log(`[MERGE] ${sourceBranch} -> ${this.currentBranch}`);
    
    return mergeId;
  }

  // Show log
  log(limit = 10) {
    const commits = this.branches.get(this.currentBranch);
    const log = [];
    
    for (let i = commits.length - 1; i >= 0 && log.length < limit; i--) {
      const commit = this.commits.get(commits[i]);
      log.push({
        id: commit.id.slice(0, 7),
        message: commit.message,
        author: commit.author,
        date: new Date(commit.timestamp).toISOString()
      });
    }
    
    return log;
  }

  // Show diff
  diff(commitId1, commitId2) {
    const commit1 = this.commits.get(commitId1);
    const commit2 = this.commits.get(commitId2);
    
    if (!commit1 || !commit2) return [];
    
    const diffs = [];
    
    // Check all files
    const allFiles = new Set([...commit1.files.keys(), ...commit2.files.keys()]);
    
    for (const path of allFiles) {
      const content1 = commit1.files.get(path);
      const content2 = commit2.files.get(path);
      
      if (!content1) {
        diffs.push({ path, type: 'added', content: content2 });
      } else if (!content2) {
        diffs.push({ path, type: 'deleted', content: content1 });
      } else if (content1 !== content2) {
        diffs.push({ path, type: 'modified', old: content1, new: content2 });
      }
    }
    
    return diffs;
  }

  // Show status
  status() {
    return {
      branch: this.currentBranch,
      head: this.head?.slice(0, 7),
      staged: this.staging.size,
      modified: this.workingDir.size
    };
  }

  // Generate commit ID
  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Get stats
  stats() {
    return {
      commits: this.commits.size,
      branches: this.branches.size,
      currentBranch: this.currentBranch
    };
  }
}

// Demo
if (require.main === module) {
  const vcs = new VersionControl();
  
  console.log('=== Version Control Demo ===\n');
  
  // Initialize
  vcs.init();
  
  console.log();
  
  // First commit
  vcs.add('README.md', '# My Project');
  vcs.add('index.js', 'console.log("Hello");');
  vcs.commit('Initial commit');
  
  console.log();
  
  // Second commit
  vcs.add('index.js', 'console.log("Hello World");');
  vcs.commit('Update greeting');
  
  console.log();
  
  // Create and switch branch
  vcs.branch('feature');
  vcs.checkout('feature');
  
  console.log();
  
  // Commit on feature branch
  vcs.add('feature.js', 'module.exports = {};');
  vcs.commit('Add feature');
  
  console.log();
  
  // Switch back and merge
  vcs.checkout('main');
  vcs.merge('feature');
  
  console.log();
  
  // Show log
  console.log('Log:', vcs.log(3));
  
  console.log('\nStatus:', vcs.status());
  console.log('Stats:', vcs.stats());
}

module.exports = VersionControl;
