/**
 * A06:2021 Vulnerable and Outdated Components
 */

const { execSync } = require('child_process');
const fs = require('fs/promises');

/**
 * checkDependencies
 */
const checkDependencies = () => {
  try {
    const result = execSync('npm audit --json', { encoding: 'utf8', timeout: 30000 });
    const audit = JSON.parse(result);

    const critical = audit.metadata?.vulnerabilities?.critical || 0;
    const high = audit.metadata?.vulnerabilities?.high || 0;

    if (critical > 0 || high > 0) {
      console.warn(`⚠️  Security vulnerabilities: ${critical} critical, ${high} high`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Dependency check error:', error.message);
  }
};

/**
 * checkOutdatedPackages
 */
const checkOutdatedPackages = async () => {
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const outdated = [];
    for (const [pkg, version] of Object.entries(deps)) {
      if (
        version.includes('*') ||
        version.includes('x') ||
        version.startsWith('^') ||
        version.startsWith('~')
      ) {
        outdated.push(`${pkg}@${version}`);
      }
    }

    if (outdated.length > 0 && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Loose version constraints detected:', outdated.join(', '));
    }
  } catch (error) {
    console.error('Outdated packages check error:', error.message);
  }
};

module.exports = { checkDependencies, checkOutdatedPackages };
