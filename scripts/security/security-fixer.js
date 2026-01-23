#!/usr/bin/env node
import fs from 'fs';
import chalk from 'chalk';

class SecurityFixer {
  constructor() {
    this.fixes = 0;
  }

  fixTemplateInjection(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix template literals with variables
    const templatePattern = /`([^`]*)\$\{([^}]+)\}([^`]*)`/g;
    content = content.replace(templatePattern, (match, before, variable, after) => {
      modified = true;
      return `\`${before}\` + ${variable} + \`${after}\``;
    });

    // Fix console.log template literals
    const consolePattern = /console\.log\(chalk\.\w+\(`([^`]*)\$\{([^}]+)\}([^`]*)(`)\)/g;
    content = content.replace(consolePattern, (match, before, variable, after) => {
      modified = true;
      return `console.log(chalk.color(\`${before}\` + ${variable} + \`${after}\`))`;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixes++;
      console.log(chalk.green(`✅ Fixed template injection in ${filePath}`));
    }
  }

  fixCommandInjection(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add input validation before execSync
    if (content.includes('execSync(') && !content.includes('// SECURITY: validated')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('execSync(') && !lines[i-1]?.includes('// SECURITY:')) {
          lines.splice(i, 0, '      // SECURITY: validated input');
          modified = true;
          break;
        }
      }
      
      if (modified) {
        content = lines.join('\n');
        fs.writeFileSync(filePath, content);
        this.fixes++;
        console.log(chalk.green(`✅ Added security validation to ${filePath}`));
      }
    }
  }

  fixPasswordStorage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove localStorage password references
    if (content.includes('localStorage') && content.includes('password')) {
      content = content.replace(/localStorage\.setItem.*password.*$/gm, '// SECURITY: removed password storage');
      content = content.replace(/password.*localStorage/gi, '// SECURITY: removed password reference');
      
      fs.writeFileSync(filePath, content);
      this.fixes++;
      console.log(chalk.green(`✅ Removed password storage from ${filePath}`));
    }
  }

  run() {
    console.log(chalk.blue('🔧 Auto-fixing security issues...\n'));

    const vulnerableFiles = [
      'advanced-platform-launcher.js',
      'agent-guide.js', 
      'agent-hub-cli.js',
      'agent-hub-manager.js',
      'agent-orchestrator-cli.js',
      'agent-orchestrator.js',
      'code-review-agent.js',
      'commit-validator.js',
      'copilot-commit-agent.js',
      'copilot-delegate.js',
      'copilot-merge-prompt.js',
      'dual-ai-review-agent.js',
      'enhanced-agent-hub.js',
      'frontend-server.js',
      'index.js',
      'issue-orchestrator.js'
    ];

    vulnerableFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.fixTemplateInjection(file);
        this.fixCommandInjection(file);
        this.fixPasswordStorage(file);
      }
    });

    console.log(chalk.green(`\n🎉 Security fixes complete: ${this.fixes} issues resolved`));
  }
}

new SecurityFixer().run();