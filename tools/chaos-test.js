#!/usr/bin/env node
const { execSync } = require('childProcess');

const scenario = process.argv[2] || 'chaos-monkey';
const duration = process.argv[3] || '5';

const scenarios = {
  'chaos-monkey': `node tests/chaos/chaos-monkey.js --duration=${duration}`,
  'load-test': `node tests/chaos/load-test.js --duration=${duration}`,
  'spike-test': `node tests/chaos/spike-test.js --duration=${duration}`,
  'recovery-test': `node tests/chaos/recovery-test.js --duration=${duration}`
};

try {
    execSync(scenarios[scenario] || scenarios['chaos-monkey'], { stdio: 'inherit' });
  } catch (error) {
  console.error('❌ Chaos test failed:', error.message);
  process.exit(1);
}
