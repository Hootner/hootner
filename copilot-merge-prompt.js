#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';

class MergeCommitGenerator {
  generatePrompt() {
    try {
      // SECURITY: validated input
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const commits = execSync('git log --oneline --no-merges origin/main..HEAD 2>/dev/null || git log --oneline --no-merges -5', { encoding: 'utf8' }).trim();
      const files = execSync('git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~5..HEAD', { encoding: 'utf8' }).trim();
      
      const commitLines = commits.split('\n').filter(Boolean);
      const fileList = files.split('\n').filter(Boolean);
      
      console.log(chalk.blue('🔀 GitHub Copilot Merge Commit Prompt\n'));
      console.log(chalk.cyan('Branch:'), branch);
      console.log(chalk.cyan('Commits:'), commitLines.length);
      console.log(chalk.cyan('Files Changed:'), fileList.length);
      console.log('\n' + chalk.yellow('─'.repeat(60)) + '\n');
      
      // Generate the prompt
      const prompt = `Generate a merge commit message for merging ${branch} into main.

Summary of changes:
` + commitLines.slice(0, 10).map(c => `- ${c + ``).join('\n')}

Files modified (${fileList.length} total):
${fileList.slice(0, 15).map(f => `- ` + f + ``).join('\n')}${fileList.length > 15 ? '\n- ... and more' : ''}

Format:
Merge: [Brief summary of feature/fix]

- Key change 1
- Key change 2
- Key change 3

Impact: [User/system impact]
Testing: [What was tested]`;

      console.log(chalk.green(prompt));
      console.log('\n' + chalk.yellow('─'.repeat(60)) + '\n');
      console.log(chalk.cyan('💡 Usage:'));
      console.log('1. Copy the prompt above');
      console.log('2. Open GitHub Copilot Chat (Ctrl+Shift+I)');
      console.log('3. Paste and let Copilot generate the message');
      console.log('4. Use: git commit -m "generated message"\n');
      
    } catch (err) {
      console.error(chalk.red(`Error: ` + err.message + ``));
      process.exit(1);
    }
  }
}

new MergeCommitGenerator().generatePrompt();
