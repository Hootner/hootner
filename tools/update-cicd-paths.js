#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const workflowDir = '.github/workflows';
const updates = {
  'api/graphql': 'hexarchy/3-communication/adapters/graphql-api',
  'services/video-generation': 'hexarchy/2-intelligence/ai-services/video-generation',
  'scripts/deployment': 'hexarchy/8-operations/ci-cd/deployment',
  'tests/': 'hexarchy/8-operations/testing/',
  'terraform/': 'hexarchy/8-operations/infrastructure/terraform/'
};

console.log('🔄 Updating CI/CD pipeline paths...\n');

if (!fs.existsSync(workflowDir)) {
  console.log('❌ No workflows found');
  process.exit(0);
}

const workflows = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
let updated = 0;

for (const file of workflows) {
  const filePath = path.join(workflowDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldPath, newPath] of Object.entries(updates)) {
    if (content.includes(oldPath)) {
      content = content.replace(new RegExp(oldPath, 'g'), newPath);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
    updated++;
  }
}

console.log(`\n✅ Updated ${updated} workflow files`);
