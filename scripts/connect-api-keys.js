#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

console.log('🔑 Connecting API Keys for CloudFront Apps\n');

// Step 1: Deploy SAM template with API keys
console.log('📦 Building SAM application...');
execSync('sam build -t template-with-keys.yaml', { stdio: 'inherit' });

console.log('\n🚀 Deploying to AWS...');
execSync('sam deploy -t template-with-keys.yaml --stack-name hootner-api-keys --guided', { stdio: 'inherit' });

// Step 2: Get outputs
console.log('\n📊 Retrieving API keys...');
const outputs = JSON.parse(
  execSync('aws cloudformation describe-stacks --stack-name hootner-api-keys --query "Stacks[0].Outputs" --output json').toString()
);

const apiKey = outputs.find(o => o.OutputKey === 'ApiGatewayKey')?.OutputValue;
const apiEndpoint = outputs.find(o => o.OutputKey === 'ApiEndpoint')?.OutputValue;
const graphqlEndpoint = outputs.find(o => o.OutputKey === 'GraphQLEndpoint')?.OutputValue;

console.log('\n✅ API Keys Retrieved:');
console.log(`   API Key: ${apiKey}`);
console.log(`   API Endpoint: ${apiEndpoint}`);
console.log(`   GraphQL: ${graphqlEndpoint}`);

// Step 3: Update config file
console.log('\n📝 Updating cloudfront-api-config.js...');
let config = readFileSync('cloudfront-api-config.js', 'utf8');
config = config.replace(/REPLACE_WITH_API_GATEWAY_KEY/g, apiKey);
config = config.replace(/YOUR_API_ID\.execute-api\.us-east-1\.amazonaws\.com\/prod/g, apiEndpoint.replace('https://', ''));
writeFileSync('cloudfront-api-config.js', config);

// Step 4: Create .env for CloudFront
console.log('\n📝 Creating .env.cloudfront...');
writeFileSync('.env.cloudfront', `
API_GATEWAY_KEY=${apiKey}
API_ENDPOINT=${apiEndpoint}
GRAPHQL_ENDPOINT=${graphqlEndpoint}
CLOUDFRONT_DOMAIN=daxqx65ar35pp.cloudfront.net
`);

console.log('\n✅ Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('   1. Upload cloudfront-api-config.js to S3/CloudFront');
console.log('   2. Include in all HTML pages: <script src="cloudfront-api-config.js"></script>');
console.log('   3. Use apiRequest() or graphqlRequest() in your apps');
console.log('\n🔗 CloudFront Apps:');
console.log('   https://daxqx65ar35pp.cloudfront.net/video-player.html');
console.log('   https://daxqx65ar35pp.cloudfront.net/ai-video.html');
console.log('   (All 20 apps now have API access)');
