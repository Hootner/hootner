#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const duplicates = {
  dynamodb: new Map(),
  secrets: new Map(),
  graphql: new Map(),
  s3: new Map()
};

const gaps = [];

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fileName = filePath.split('\\').pop();
    
    // Track DynamoDB patterns
    const dynamoPatterns = [
      content.match(/DynamoDB/g)?.length || 0,
      content.match(/TABLE_NAME/g)?.length || 0,
      content.match(/dynamodb/g)?.length || 0
    ];
    if (dynamoPatterns.some(p => p > 0)) {
      duplicates.dynamodb.set(fileName, dynamoPatterns.reduce((a,b) => a+b));
    }
    
    // Track Secrets patterns
    const secretPatterns = [
      content.match(/JWT_SECRET/g)?.length || 0,
      content.match(/API_SECRETS/g)?.length || 0,
      content.match(/SecretsManager/g)?.length || 0
    ];
    if (secretPatterns.some(p => p > 0)) {
      duplicates.secrets.set(fileName, secretPatterns.reduce((a,b) => a+b));
    }
    
    // Track GraphQL patterns
    const graphqlPatterns = [
      content.match(/graphql/gi)?.length || 0,
      content.match(/\/graphql/g)?.length || 0
    ];
    if (graphqlPatterns.some(p => p > 0)) {
      duplicates.graphql.set(fileName, graphqlPatterns.reduce((a,b) => a+b));
    }
    
    // Track S3 patterns
    const s3Patterns = [
      content.match(/UPLOAD_BUCKET/g)?.length || 0,
      content.match(/S3/g)?.length || 0,
      content.match(/s3:/g)?.length || 0
    ];
    if (s3Patterns.some(p => p > 0)) {
      duplicates.s3.set(fileName, s3Patterns.reduce((a,b) => a+b));
    }
    
    // Check for gaps (files that should have connections but don't)
    if (fileName.includes('lambda') || fileName.includes('handler')) {
      const hasDB = content.includes('TABLE_NAME') || content.includes('DynamoDB');
      const hasSecrets = content.includes('JWT_SECRET') || content.includes('API_SECRETS');
      if (!hasDB || !hasSecrets) {
        gaps.push(`${fileName}: Missing ${!hasDB ? 'DB' : ''}${!hasDB && !hasSecrets ? '+' : ''}${!hasSecrets ? 'Secrets' : ''}`);
      }
    }
    
  } catch (error) {
    // Skip binary files
  }
}

function scanDirectory(dir, depth = 0) {
  if (depth > 3) return;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item.startsWith('.') && item !== '.env') continue;
      if (['node_modules', 'dist', 'build'].includes(item)) continue;
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, depth + 1);
      } else if (item.match(/\.(js|ts|yaml|yml)$/)) {
        scanFile(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
}

console.log('🔍 Scanning for duplicates and gaps...\n');

scanDirectory('.');

console.log('🔄 DUPLICATES (>5 references):');

for (const [type, map] of Object.entries(duplicates)) {
  const heavy = Array.from(map.entries()).filter(([,count]) => count > 5);
  if (heavy.length > 0) {
    console.log(`\n${type.toUpperCase()}:`);
    heavy.sort((a,b) => b[1] - a[1]).slice(0,5).forEach(([file, count]) => {
      console.log(`   ${file}: ${count} refs`);
    });
  }
}

console.log('\n🕳️  GAPS:');
gaps.forEach(gap => console.log(`   ${gap}`));

console.log('\n🎯 ACTIONS:');
console.log('1. Consolidate heavy duplicate files');
console.log('2. Fill connection gaps in Lambda handlers');
console.log('3. Remove redundant connection patterns');