#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for untrained data sources...\n');

const sources = {
  'Q Logs': 'docs/reports/combined.log',
  'Journal Entries': 'docs/journal/',
  'Code Scan Reports': 'docs/reports/code-scan-report.txt',
  'Project Structure': 'docs/reports/PROJECT_STRUCTURE.txt',
  'Documentation': 'docs/',
  'README Files': '**/*.md',
  'Code Comments': '**/*.js',
  'Configuration Files': 'config/',
  'Scripts': 'scripts/',
  'Services': 'services/',
  'Tests': 'tests/',
  'GitHub Workflows': '.github/workflows/',
  'Git Commits': '.git/logs/',
  'TODO Comments': 'scan with scripts/scan-todos.js'
};

console.log('📊 Available Training Data Sources:\n');

Object.entries(sources).forEach(([name, path]) => {
  console.log(`✓ ${name.padEnd(25)} ${path}`);
});

console.log('\n💡 Unique Data HOOTNER Hasn\'t Seen:\n');

const unique = [
  '1. Your Q conversation logs (developer interactions)',
  '2. Journal entries (learning patterns, insights)',
  '3. Code scan reports (quality metrics)',
  '4. Project structure (architecture decisions)',
  '5. Git commit messages (development history)',
  '6. TODO comments (planned features)',
  '7. Code comments (implementation details)',
  '8. GitHub workflow configs (CI/CD patterns)',
  '9. Configuration files (system setup)',
  '10. Test files (usage examples)'
];

unique.forEach(item => console.log(`  ${item}`));

console.log('\n🎯 Most Valuable for Training:\n');
console.log('  1. Q Logs - Real developer problem-solving');
console.log('  2. Journal Entries - Learning progression');
console.log('  3. Code Comments - Implementation context');
console.log('  4. Git Commits - Development narrative');
console.log('  5. TODO Comments - Feature roadmap');

console.log('\n▶️  Run pipeline to include these:');
console.log('   node run-training-pipeline.js\n');
