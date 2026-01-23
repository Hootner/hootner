#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const pathMappings = {
  'constants/': 'hexarchy/0-core/configs/constants/',
  'frameworks/backend/nestjs': 'hexarchy/1-foundation/frameworks/nestjs',
  'services/video-generation': 'hexarchy/2-intelligence/ai-services/video-generation',
  'frameworks/ai/agents': 'hexarchy/2-intelligence/ai-services/agents',
  'api/graphql': 'hexarchy/3-communication/adapters/graphql-api',
  'apps/frontend': 'hexarchy/4-interface/ui/frontend',
  'scripts/security': 'hexarchy/6-governance/compliance/security-scripts',
  'data/logs': 'hexarchy/7-data/storage/logs',
  'data/uploads': 'hexarchy/7-data/storage/uploads',
  'scripts/aws-setup': 'hexarchy/8-operations/infrastructure/aws-setup',
  'scripts/deployment': 'hexarchy/8-operations/ci-cd/deployment',
  'tests/': 'hexarchy/8-operations/testing/',
  'terraform/': 'hexarchy/8-operations/infrastructure/terraform/'
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  for (const [oldPath, newPath] of Object.entries(pathMappings)) {
    const regex = new RegExp(oldPath.replace(/\//g, '\\/'), 'g');
    if (content.includes(oldPath)) {
      content = content.replace(regex, newPath);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function scanDirectory(dir, extensions = ['.js', '.ts', '.json', '.md']) {
  let updated = 0;
  const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      const fullPath = path.join(file.path || dir, file.name);
      if (updateFile(fullPath)) {
        console.log(`✅ Updated: ${fullPath}`);
        updated++;
      }
    }
  }
  return updated;
}

console.log('🔄 Updating import paths...\n');

const dirs = ['.', 'hexarchy', 'scripts', '.github'];
let total = 0;

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    const count = scanDirectory(dir);
    total += count;
  }
}

console.log(`\n✅ Updated ${total} files`);
