#!/usr/bin/env node

const migrations = {
  'api/graphql': {
    target: 'hexarchy/3-communication/adapters/graphql-api',
    reason: 'API communication layer'
  },
  'services/video-generation': {
    target: 'hexarchy/2-intelligence/ai-services/video-generation',
    reason: 'AI service'
  },
  'scripts/aws-setup.js': {
    target: 'hexarchy/8-operations/infrastructure/aws-setup.js',
    reason: 'Infrastructure operations'
  },
  'scripts/deployment': {
    target: 'hexarchy/8-operations/ci-cd/deployment',
    reason: 'Deployment operations'
  },
  'scripts/security': {
    target: 'hexarchy/6-governance/compliance/security-scripts',
    reason: 'Security governance'
  },
  'frameworks/ai/agents': {
    target: 'hexarchy/2-intelligence/ai-services/agents',
    reason: 'AI intelligence layer'
  },
  'frameworks/backend/nestjs': {
    target: 'hexarchy/1-foundation/frameworks/nestjs',
    reason: 'Backend foundation'
  },
  'apps/frontend': {
    target: 'hexarchy/4-interface/ui/frontend',
    reason: 'User interface layer'
  },
  'constants': {
    target: 'hexarchy/0-core/configs/constants',
    reason: 'Core configuration'
  },
  'tests': {
    target: 'hexarchy/8-operations/testing',
    reason: 'Operations testing'
  },
  'data/logs': {
    target: 'hexarchy/7-data/storage/logs',
    reason: 'Data storage'
  },
  'data/uploads': {
    target: 'hexarchy/7-data/storage/uploads',
    reason: 'Data storage'
  },
  'terraform': {
    target: 'hexarchy/8-operations/infrastructure/terraform',
    reason: 'Infrastructure as code'
  }
};

console.log('🔍 HEXARCHY MIGRATION ANALYSIS\n');
console.log('Items that can be moved into hexarchy:\n');

Object.entries(migrations).forEach(([source, { target, reason }], i) => {
  console.log(`${i + 1}. ${source}`);
  console.log(`   → ${target}`);
  console.log(`   Reason: ${reason}\n`);
});

console.log(`\n📊 Total: ${Object.keys(migrations).length} items can be migrated`);
console.log('\n💡 Benefits:');
console.log('   • Better organization by domain');
console.log('   • Clear separation of concerns');
console.log('   • Easier to scale individual layers');
console.log('   • Improved maintainability');

export default migrations;
