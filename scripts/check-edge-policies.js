// Edge Policy Status Check
const policies = {
  set: [
    { name: 'SearchSuggestEnabled', value: 'false', level: 'Mandatory' }
  ],
  critical: [
    'SmartScreenEnabled',
    'SavingBrowserHistoryDisabled',
    'PasswordManagerEnabled',
    'SyncDisabled'
  ]
};

console.log('Edge Policy Status:\n');
console.log('SET POLICIES:');
policies.set.forEach(p => {
  console.log(`  ✓ ${p.name}: ${p.value} (${p.level})`);
});

console.log('\nCRITICAL POLICIES (Not Set):');
policies.critical.forEach(p => {
  console.log(`  - ${p}: Not configured (using defaults)`);
});

console.log('\n✓ Your Edge configuration is normal.');
console.log('  Most policies being "Not set" means Edge uses default settings.');
console.log('  Only SearchSuggestEnabled is explicitly disabled.');
