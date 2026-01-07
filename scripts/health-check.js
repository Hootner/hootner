import { execSync } from 'child_process';

console.log('=== PROJECT HEALTH CHECK ===\n');

// 1. Security vulnerabilities
console.log('1. Security Scan...');
try {
  execSync('npm audit --json > docs/reports/security-audit.json', { encoding: 'utf-8' });
  const audit = JSON.parse(execSync('type docs\\reports\\security-audit.json', { encoding: 'utf-8' }));
  const vulns = audit.metadata.vulnerabilities;
  console.log(`   Critical: ${vulns.critical}, High: ${vulns.high}, Moderate: ${vulns.moderate}, Low: ${vulns.low}`);
} catch (e) {
  console.log('   Error running audit');
}

// 2. Outdated dependencies
console.log('\n2. Outdated Dependencies...');
try {
  const outdated = execSync('npm outdated --json', { encoding: 'utf-8' });
  const packages = Object.keys(JSON.parse(outdated || '{}'));
  console.log(`   ${packages.length} packages need updating`);
  if (packages.length > 0) console.log(`   ${packages.slice(0, 5).join(', ')}...`);
} catch (e) {
  console.log('   All dependencies up to date');
}

// 3. Linting errors
console.log('\n3. Linting Errors...');
try {
  execSync('npm run lint', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('   No linting errors');
} catch (e) {
  console.log('   Linting errors found - run: npm run lint:fix');
}

// 4. Config validation
console.log('\n4. Config Files...');
const configs = ['package.json', 'mcp-config.json', '.eslintrc.json'];
for (const config of configs) {
  try {
    execSync(`type ${config}`, { encoding: 'utf-8', stdio: 'pipe' });
    JSON.parse(execSync(`type ${config}`, { encoding: 'utf-8' }));
    console.log(`   ✓ ${config}`);
  } catch {
    console.log(`   ✗ ${config} - Invalid or missing`);
  }
}

// 5. Git status
console.log('\n5. Git Status...');
try {
  const status = execSync('git status --short', { encoding: 'utf-8' });
  const lines = status.split('\n').filter(l => l);
  console.log(`   ${lines.length} uncommitted changes`);
  const modified = lines.filter(l => l.startsWith(' M')).length;
  const deleted = lines.filter(l => l.startsWith(' D')).length;
  const untracked = lines.filter(l => l.startsWith('??')).length;
  console.log(`   Modified: ${modified}, Deleted: ${deleted}, Untracked: ${untracked}`);
} catch (e) {
  console.log('   Error checking git status');
}

console.log('\n=== RECOMMENDATIONS ===');
console.log('1. Run: npm run lint:fix');
console.log('2. Run: npm audit fix');
console.log('3. Review git changes: git status');
console.log('4. Test before commit: npm test');
