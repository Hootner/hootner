#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

console.log('🔧 Post-Deployment Configuration\n');

// Get stack outputs
const outputs = JSON.parse(
  execSync('aws cloudformation describe-stacks --stack-name hootner-platform --query "Stacks[0].Outputs" --output json').toString()
);

const apiKey = outputs.find(o => o.OutputKey === 'ApiKey')?.OutputValue;
const apiEndpoint = outputs.find(o => o.OutputKey === 'ApiEndpoint')?.OutputValue;
const graphqlEndpoint = outputs.find(o => o.OutputKey === 'GraphQLEndpoint')?.OutputValue;

console.log('✅ Deployment Complete!\n');
console.log('📊 Outputs:');
console.log(`   API Key: ${apiKey}`);
console.log(`   API Endpoint: ${apiEndpoint}`);
console.log(`   GraphQL: ${graphqlEndpoint}\n`);

// Update CloudFront config
const config = `const API_CONFIG = {
  apiKey: '${apiKey}',
  endpoints: {
    graphql: '${graphqlEndpoint}',
    videos: '${apiEndpoint}/api/videos',
    aiVideo: '${apiEndpoint}/api/ai-video',
    liveStream: '${apiEndpoint}/api/live-stream',
    editor: '${apiEndpoint}/api/editor',
    collaboration: '${apiEndpoint}/api/collaboration',
    messages: '${apiEndpoint}/api/messages',
    analytics: '${apiEndpoint}/api/analytics',
    marketplace: '${apiEndpoint}/api/marketplace',
    agents: '${apiEndpoint}/api/agents',
    devops: '${apiEndpoint}/api/devops',
    design: '${apiEndpoint}/api/design',
    feed: '${apiEndpoint}/api/feed',
    activity: '${apiEndpoint}/api/activity',
    profile: '${apiEndpoint}/api/profile',
    settings: '${apiEndpoint}/api/settings',
    contact: '${apiEndpoint}/api/contact',
    dashboard: '${apiEndpoint}/api/dashboard',
    login: '${apiEndpoint}/api/login'
  }
};

async function apiRequest(endpoint, options = {}) {
  return fetch(endpoint, {
    ...options,
    headers: {
      'x-api-key': API_CONFIG.apiKey,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

async function graphqlRequest(query, variables = {}) {
  const response = await apiRequest(API_CONFIG.endpoints.graphql, {
    method: 'POST',
    body: JSON.stringify({ query, variables })
  });
  return response.json();
}`;

writeFileSync('cloudfront-api-config.js', config);

console.log('📝 Created: cloudfront-api-config.js');
console.log('\n📤 Next: Upload to CloudFront');
console.log('   aws s3 cp cloudfront-api-config.js s3://YOUR_BUCKET/');
