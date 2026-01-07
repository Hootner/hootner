#!/usr/bin/env node
// Advanced Learning Progression - Skill Tree System

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKILL_TREE = {
  // Prerequisites map: what you need before building X
  dependencies: {
    'Compiler': ['Assembler', 'CPU Emulator'],
    'JIT Compiler': ['Compiler', 'CPU Emulator'],
    'Operating System': ['Bootloader', 'Kernel', 'Scheduler', 'Memory Manager'],
    'Virtual Machine': ['CPU Emulator', 'Memory Allocator'],
    'Container': ['Operating System', 'Virtual Machine'],
    'Web Server': ['TCP Server', 'HTTP Server'],
    'Database': ['File System', 'Hash Table', 'B-Tree'],
    'Blockchain': ['Cryptography', 'Hash Table', 'Networking'],
    'Browser': ['HTML Parser', 'CSS Parser', 'JS Engine', 'Render Engine'],
    'Game Engine': ['Graphics Renderer', 'Physics Engine', 'Audio Engine']
  },
  
  // Unlocks: what becomes available after completing X
  unlocks: {
    'CPU Emulator': ['Assembler', 'Debugger', 'Virtual Machine'],
    'Compiler': ['JIT Compiler', 'Optimizer', 'Programming Language'],
    'Operating System': ['Container', 'Hypervisor', 'Embedded OS'],
    'Database': ['ORM', 'Query Language', 'Distributed DB'],
    'Web Server': ['Web Framework', 'API Gateway', 'Load Balancer'],
    'Blockchain': ['Smart Contract', 'Cryptocurrency', 'Consensus']
  },
  
  // Difficulty levels
  difficulty: {
    beginner: ['Hash Table', 'Stack', 'Queue', 'Linked List'],
    intermediate: ['Compiler', 'Database', 'Web Server', 'Regex Engine'],
    advanced: ['Operating System', 'JIT Compiler', 'Blockchain', 'Browser'],
    expert: ['Hypervisor', 'Distributed System', 'Quantum Simulator']
  },
  
  // Learning paths
  paths: {
    'Systems Programming': ['CPU Emulator', 'Assembler', 'Linker', 'OS', 'Kernel'],
    'Web Development': ['HTTP Server', 'Web Server', 'Database', 'Web Framework'],
    'Compiler Engineering': ['Lexer', 'Parser', 'Compiler', 'Optimizer', 'JIT'],
    'Distributed Systems': ['Networking', 'Database', 'Message Queue', 'Consensus'],
    'Game Development': ['Graphics', 'Physics', 'Audio', 'Game Engine'],
    'Blockchain': ['Cryptography', 'Hash', 'Blockchain', 'Smart Contract']
  }
};

class ProgressionSystem {
  constructor() {
    this.progress = this.load();
  }

  load() {
    const file = path.join(__dirname, '.progression.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return { completed: [], inProgress: [], skillPoints: 0, level: 1 };
  }

  save() {
    const file = path.join(__dirname, '.progression.json');
    fs.writeFileSync(file, JSON.stringify(this.progress, null, 2));
  }

  complete(template) {
    if (!this.progress.completed.includes(template)) {
      this.progress.completed.push(template);
      this.progress.skillPoints += this.getPoints(template);
      this.progress.level = Math.floor(this.progress.skillPoints / 10) + 1;
      this.save();
      
      const unlocked = SKILL_TREE.unlocks[template] || [];
      console.log(`\n✓ Completed: ${template}`);
      console.log(`  +${this.getPoints(template)} skill points`);
      console.log(`  Level: ${this.progress.level}`);
      if (unlocked.length) {
        console.log(`  Unlocked: ${unlocked.join(', ')}`);
      }
    }
  }

  getPoints(template) {
    if (SKILL_TREE.difficulty.expert.includes(template)) return 10;
    if (SKILL_TREE.difficulty.advanced.includes(template)) return 5;
    if (SKILL_TREE.difficulty.intermediate.includes(template)) return 3;
    return 1;
  }

  canBuild(template) {
    const deps = SKILL_TREE.dependencies[template] || [];
    return deps.every(d => this.progress.completed.includes(d));
  }

  suggest() {
    const available = [];
    Object.keys(SKILL_TREE.dependencies).forEach(template => {
      if (!this.progress.completed.includes(template) && this.canBuild(template)) {
        available.push(template);
      }
    });
    return available;
  }

  showPath(pathName) {
    const path = SKILL_TREE.paths[pathName];
    if (!path) {
      console.log('Available paths:', Object.keys(SKILL_TREE.paths).join(', '));
      return;
    }
    
    console.log(`\n📚 ${pathName} Learning Path:\n`);
    path.forEach((template, i) => {
      const done = this.progress.completed.includes(template);
      const canDo = this.canBuild(template);
      const status = done ? '✓' : canDo ? '→' : '🔒';
      console.log(`${i + 1}. ${status} ${template}`);
    });
  }

  stats() {
    console.log('\n🎮 Your Progress:\n');
    console.log(`Level: ${this.progress.level}`);
    console.log(`Skill Points: ${this.progress.skillPoints}`);
    console.log(`Completed: ${this.progress.completed.length} templates`);
    console.log(`Available: ${this.suggest().length} templates`);
    
    const nextLevel = this.progress.level * 10;
    const toNext = nextLevel - this.progress.skillPoints;
    console.log(`\nNext Level: ${toNext} points needed`);
  }
}

const prog = new ProgressionSystem();
const cmd = process.argv[2];

if (cmd === 'complete') {
  prog.complete(process.argv[3]);
} else if (cmd === 'suggest') {
  console.log('\n💡 Available to build:\n');
  prog.suggest().forEach(t => console.log(`  • ${t}`));
} else if (cmd === 'path') {
  prog.showPath(process.argv[3]);
} else if (cmd === 'stats') {
  prog.stats();
} else {
  console.log(`
🦉 Progression System

Commands:
  stats              - Show your progress
  complete <name>    - Mark template complete
  suggest            - Show what you can build next
  path <name>        - Show learning path

Example:
  node progression.js complete "CPU Emulator"
  node progression.js suggest
  node progression.js path "Systems Programming"
  `);
}

export default ProgressionSystem;
