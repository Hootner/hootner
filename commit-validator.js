#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';

class CommitValidator {
  validate() {
    const msg = this.getCommitMessage();
    const files = this.getStagedFiles();
    
    const checks = [
      () => this.validateConventional(msg),
      () => this.validateSecurity(files),
      () => this.validateSyntax(files)
    ];
    
    for (const check of checks) {
      const result = check();
      if (!result.valid) {
        console.log(chalk.red(`❌ ${result.error}`));
        process.exit(1);
      }
    }
    
    console.log(chalk.green('✅ Commit validation passed'));
  }
  
  getCommitMessage() {
    return execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  }
  
  getStagedFiles() {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n').filter(Boolean);
  }
  
  validateConventional(msg) {
    const pattern = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}/;
    return pattern.test(msg) 
      ? { valid: true }
      : { valid: false, error: 'Use conventional commits: feat/fix/docs: description' };
  }
  
  validateSecurity(files) {
    const secrets = /(?:password|secret|key|token|api_key).*=.*['"]/i;
    for (const file of files) {
      try {
        const content = execSync(`git show :${file}`, { encoding: 'utf8' });
        if (secrets.test(content)) {
          return { valid: false, error: `Potential secret in ${file}` };
        }
      } catch (err) {
        // Ignore file read errors
      }
    }
    return { valid: true };
  }
  
  validateSyntax(files) {
    const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts'));
    for (const file of jsFiles) {
      try {
        execSync(`npx eslint ${file}`, { stdio: 'pipe' });
      } catch {
        return { valid: false, error: `Syntax errors in ${file}` };
      }
    }
    return { valid: true };
  }
}

new CommitValidator().validate();