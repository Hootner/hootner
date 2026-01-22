#!/usr/bin/env node
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

const TASKS_FILE = 'copilot-tasks.json';

class CopilotTaskManager {
  constructor() {
    this.tasks = this.loadTasks();
  }

  loadTasks() {
    try {
      return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    } catch {
      return { tasks: [], completed: [] };
    }
  }

  saveTasks() {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(this.tasks, null, 2));
  }

  delegate(description, files = [], priority = 'medium') {
    const task = {
      id: Date.now(),
      description,
      files,
      priority,
      status: 'pending',
      created: new Date().toISOString(),
      copilotInstructions: this.generateInstructions(description, files)
    };
    
    this.tasks.tasks.push(task);
    this.saveTasks();
    
    console.log(chalk.green(`✅ Task delegated: ${description}`));
    console.log(chalk.cyan('📋 Copilot Instructions:'));
    console.log(task.copilotInstructions);
    return task.id;
  }

  generateInstructions(description, files) {
    return `@workspace ${description}
Files to focus on: ${files.join(', ') || 'any relevant files'}
Use /fix for code issues
Use Ctrl+I for inline suggestions
Comment your changes with // COPILOT: [description]`;
  }

  monitor() {
    console.log(chalk.blue('🔍 Monitoring Copilot Progress...\n'));
    
    this.tasks.tasks.forEach(task => {
      const status = this.checkTaskStatus(task);
      console.log(`${this.getStatusIcon(status)} Task ${task.id}: ${task.description}`);
      console.log(`   Priority: ${task.priority} | Status: ${status}\n`);
    });
  }

  checkTaskStatus(task) {
    // Check if files have COPILOT comments indicating work
    const hasChanges = task.files.some(file => {
      try {
        const safeFilePath = path.resolve(file);
        const content = fs.readFileSync(safeFilePath, 'utf8');
        return content.includes('// COPILOT:');
      } catch {
        return false;
      }
    });
    
    return hasChanges ? 'in-progress' : 'pending';
  }

  getStatusIcon(status) {
    const icons = {
      'pending': '⏳',
      'in-progress': '🔄',
      'completed': '✅'
    };
    return icons[status] || '❓';
  }

  complete(taskId) {
    const taskIndex = this.tasks.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const task = this.tasks.tasks.splice(taskIndex, 1)[0];
      task.status = 'completed';
      task.completed = new Date().toISOString();
      this.tasks.completed.push(task);
      this.saveTasks();
      console.log(chalk.green(`✅ Task ${taskId} marked complete`));
    }
  }
}

// CLI Interface
const manager = new CopilotTaskManager();
const [,, command, ...args] = process.argv;

switch (command) {
  case 'delegate': {
    const [description, ...files] = args;
    manager.delegate(description, files);
    break;
  }
  case 'monitor': {
    manager.monitor();
    break;
  }
  case 'complete': {
    manager.complete(parseInt(args[0]));
    break;
  }
  default: {
    console.log(chalk.yellow('Usage:'));
    console.log('node copilot-delegate.js delegate "Fix security issues" file1.js file2.js');
    console.log('node copilot-delegate.js monitor');
    console.log('node copilot-delegate.js complete <taskId>');
  }
}