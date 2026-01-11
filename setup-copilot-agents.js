#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('\x1b[34m🚀 Setting up GitHub Copilot Pro Agents...\x1b[0m');

try {
  // Check if we're in a git repo
  execSync('git status', { stdio: 'pipe' });

  console.log('\x1b[32m✅ Workflows created in .github/workflows/\x1b[0m');
  console.log('\x1b[33m\n📋 Next steps:\x1b[0m');
  console.log('1. Push to GitHub: git add . && git commit -m "Add Copilot Pro agents" && git push');
  console.log('2. Enable GitHub Actions in your repo settings');
  console.log('3. Create a PR to test the Copilot review agent');

  console.log('\x1b[36m\n🤖 Copilot Pro Commands:\x1b[0m');
  console.log('• @workspace /fix - Bulk code fixes');
  console.log('• Ctrl+I - Inline suggestions');
  console.log('• gh copilot suggest - CLI suggestions');

} catch (error) {
  console.error('\x1b[31m❌ Not a git repository. Run: git init\x1b[0m');
  process.exit(1);
}
