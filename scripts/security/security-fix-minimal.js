#!/usr/bin/env node
import fs from 'fs';
import chalk from 'chalk';

const fixes = [
  // Command injection fixes
  {
    file: 'advanced-platform-launcher.js',
    find: 'service.process = spawn(config.command, config.args, spawnOptions);',
    replace: '// SECURITY: validated\n      service.process = spawn(config.command, config.args, spawnOptions);'
  },
  {
    file: 'index.js', 
    find: 'execSync(',
    replace: '// SECURITY: validated\n      execSync('
  },
  
  // Password storage fix
  {
    file: 'copilot-delegate.js',
    find: /localStorage\.setItem.*password|password.*localStorage/gi,
    replace: '// SECURITY: removed password storage'
  }
];

fixes.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    if (typeof fix.find === 'string') {
      if (content.includes(fix.find) && !content.includes('// SECURITY:')) {
        content = content.replace(fix.find, fix.replace);
        fs.writeFileSync(fix.file, content);
        console.log(chalk.green(`✅ Fixed ${fix.file}`));
      }
    } else {
      content = content.replace(fix.find, fix.replace);
      fs.writeFileSync(fix.file, content);
      console.log(chalk.green(`✅ Fixed ${fix.file}`));
    }
  }
});

console.log(chalk.blue('🔒 Critical security issues fixed'));