#!/usr/bin/env node

const migrations = {
  'hexarchy/3-communication/adapters/graphql-api': {
    target: 'hexarchy/3-communication/adapters/graphql-api',
    reason: 'API communication layer'
  },
  'hexarchy/2-intelligence/ai-services/video-generation': {
    target: 'hexarchy/2-intelligence/ai-hexarchy/2-intelligence/ai-services/video-generation',
    reason: 'AI service'
  },
  'hexarchy/8-operations/infrastructure/aws-setup.js': {
    target: 'hexarchy/8-operations/infrastructure/aws-setup.js',
    reason: 'Infrastructure operations'
  },
  'hexarchy/8-operations/ci-cd/deployment': {
    target: 'hexarchy/8-operations/ci-cd/deployment',
    reason: 'Deployment operations'
  },
  'hexarchy/6-governance/compliance/security-scripts': {
    target: 'hexarchy/6-governance/compliance/security-scripts',
    reason: 'Security governance'
  },
  'hexarchy/2-intelligence/ai-services/agents': {
    target: 'hexarchy/2-intelligence/ai-services/agents',
    reason: 'AI intelligence layer'
  },
  'hexarchy/1-foundation/frameworks/nestjs': {
    target: 'hexarchy/1-foundation/frameworks/nestjs',
    reason: 'Backend foundation'
  },
  'hexarchy/4-interface/ui/frontend': {
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
  'hexarchy/7-data/storage/logs': {
    target: 'hexarchy/7-data/storage/logs',
    reason: 'Data storage'
  },
  'hexarchy/7-data/storage/uploads': {
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
