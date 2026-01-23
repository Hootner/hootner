#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const migrations = [
  { src: 'constants', dest: 'hexarchy/0-core/configs/constants' },
  { src: 'frameworks/backend/nestjs', dest: 'hexarchy/1-foundation/frameworks/nestjs' },
  { src: 'services/video-generation', dest: 'hexarchy/2-intelligence/ai-services/video-generation' },
  { src: 'frameworks/ai/agents', dest: 'hexarchy/2-intelligence/ai-services/agents' },
  { src: 'api/graphql', dest: 'hexarchy/3-communication/adapters/graphql-api' },
  { src: 'apps/frontend', dest: 'hexarchy/4-interface/ui/frontend' },
  { src: 'scripts/security', dest: 'hexarchy/6-governance/compliance/security-scripts' },
  { src: 'data/logs', dest: 'hexarchy/7-data/storage/logs' },
  { src: 'data/uploads', dest: 'hexarchy/7-data/storage/uploads' },
  { src: 'scripts/aws-setup.js', dest: 'hexarchy/8-operations/infrastructure/aws-setup.js' },
  { src: 'scripts/deployment', dest: 'hexarchy/8-operations/ci-cd/deployment' },
  { src: 'tests', dest: 'hexarchy/8-operations/testing' },
  { src: 'terraform', dest: 'hexarchy/8-operations/infrastructure/terraform' }
];

console.log('🚀 HEXARCHY MIGRATION STARTED\n');

let migrated = 0;
let skipped = 0;

for (const { src, dest } of migrations) {
  if (!fs.existsSync(src)) {
    console.log(`⏭️  Skip: ${src} (not found)`);
    skipped++;
    continue;
  }

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  try {
    if (fs.existsSync(dest)) {
      console.log(`⚠️  Skip: ${src} (destination exists)`);
      skipped++;
      continue;
    }

    execSync(`xcopy "${src}" "${dest}" /E /I /H /Y`, { stdio: 'pipe' });
    console.log(`✅ Migrated: ${src} → ${dest}`);
    migrated++;
  } catch (error) {
    console.log(`❌ Failed: ${src}`);
  }
}

console.log(`\n📊 Migration Complete:`);
console.log(`   ✅ Migrated: ${migrated}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   📦 Total: ${migrations.length}`);
