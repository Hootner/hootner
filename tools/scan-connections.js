#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const connections = {
  dynamodb: [],
  secrets: [],
  s3: [],
  graphql: [],
  apiKeys: [],
  environment: [],
  outdated: []
};

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fileName = filePath.split('\\').pop();
    
    // Check for DynamoDB connections
    if (content.includes('DynamoDB') || content.includes('dynamodb') || content.includes('TABLE_NAME')) {
      connections.dynamodb.push(fileName);
    }
    
    // Check for Secrets Manager
    if (content.includes('SecretsManager') || content.includes('API_SECRETS') || content.includes('JWT_SECRET')) {
      connections.secrets.push(fileName);
    }
    
    // Check for S3 connections
    if (content.includes('S3') || content.includes('UPLOAD_BUCKET') || content.includes('s3://')) {
      connections.s3.push(fileName);
    }
    
    // Check for GraphQL
    if (content.includes('graphql') || content.includes('GraphQL') || content.includes('/graphql')) {
      connections.graphql.push(fileName);
    }
    
    // Check for API Keys
    if (content.includes('API_KEY') || content.includes('STRIPE_') || content.includes('api-key')) {
      connections.apiKeys.push(fileName);
    }
    
    // Check for environment variables
    if (content.includes('process.env') || content.includes('.env') || fileName.includes('.env')) {
      connections.environment.push(fileName);
    }
    
    // Check for outdated patterns
    if (content.includes('nodejs20') || content.includes('node:20') || content.includes('mongodb://')) {
      connections.outdated.push(fileName);
    }
    
  } catch (error) {
    // Skip binary files
  }
}

function scanDirectory(dir, depth = 0) {
  if (depth > 3) return; // Limit depth
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item.startsWith('.') && item !== '.env') continue;
      if (['node_modules', 'dist', 'build'].includes(item)) continue;
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, depth + 1);
      } else if (item.match(/\.(js|ts|yaml|yml|json|md)$/)) {
        scanFile(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
}

console.log('🔍 Scanning all files for connections...\n');

scanDirectory('.');

console.log('📊 CONNECTION ANALYSIS:\n');

console.log(`🗄️  DynamoDB (${connections.dynamodb.length} files):`);
connections.dynamodb.slice(0, 10).forEach(f => console.log(`   ${f}`));

console.log(`\n🔐 Secrets Manager (${connections.secrets.length} files):`);
connections.secrets.slice(0, 10).forEach(f => console.log(`   ${f}`));

console.log(`\n📦 S3 Storage (${connections.s3.length} files):`);
connections.s3.slice(0, 10).forEach(f => console.log(`   ${f}`));

console.log(`\n🔗 GraphQL (${connections.graphql.length} files):`);
connections.graphql.slice(0, 10).forEach(f => console.log(`   ${f}`));

console.log(`\n🔑 API Keys (${connections.apiKeys.length} files):`);
connections.apiKeys.slice(0, 10).forEach(f => console.log(`   ${f}`));

console.log(`\n🌍 Environment (${connections.environment.length} files):`);
connections.environment.slice(0, 10).forEach(f => console.log(`   ${f}`));

if (connections.outdated.length > 0) {
  console.log(`\n⚠️  OUTDATED (${connections.outdated.length} files):`);
  connections.outdated.forEach(f => console.log(`   ${f}`));
}

console.log('\n🎯 ISSUES TO FIX:');
if (connections.outdated.length > 0) {
  console.log('❌ Found outdated Node.js 20 or MongoDB references');
}
if (connections.secrets.length < 3) {
  console.log('❌ Insufficient secrets management');
}
if (connections.dynamodb.length < 5) {
  console.log('❌ Limited DynamoDB integration');
}

console.log('\n✅ Next: Review flagged files and update connections');