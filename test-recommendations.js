#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'services', 'training-data-recommendations.json');

if (!fs.existsSync(file)) {
  console.log('❌ Run pipeline first: node run-training-pipeline.js\n');
  process.exit(1);
}

const recs = require(file);

console.log('🦉 HOOTNER Training Data Categories:\n');
console.log(Object.keys(recs).map(k => `  - ${k} (${recs[k].length} items)`).join('\n'));

console.log('\n📚 Tutorial Recommendations:\n');
recs.tutorial?.slice(0, 10).forEach((item, i) => {
  console.log(`${i + 1}. ${item.text.substring(0, 80)}...`);
});

console.log('\n💡 Try: const recs = require("./services/training-data-recommendations.json")');
