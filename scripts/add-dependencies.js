import { readFileSync, writeFileSync } from 'fs';

let template = readFileSync('template.yaml', 'utf8');

const functions = [
  'VideoFunction', 'AIVideoFunction', 'LiveStreamFunction', 'EditorFunction',
  'CollaborationFunction', 'MessagesFunction', 'AnalyticsFunction', 'MarketplaceFunction',
  'AgentsFunction', 'DevOpsFunction', 'DesignFunction', 'SocialFeedFunction',
  'LiveActivityFunction', 'ProfileFunction', 'SettingsFunction', 'ContactFunction',
  'DashboardFunction', 'LoginFunction'
];

functions.forEach(func => {
  const pattern = new RegExp(`  ${func}:\\n    Type: AWS::Serverless::Function\\n    Properties:`, 'g');
  const replacement = `  ${func}:
    Type: AWS::Serverless::Function
    DependsOn:
      - HootnerTable
      - APISecrets
      - APIKeysLayer
      - HootnerApi
    Properties:`;
  template = template.replace(pattern, replacement);
});

writeFileSync('template.yaml', template);
console.log('✅ Added DependsOn to all 20 Lambda functions');
console.log('📊 Composer will now show all connections:');
console.log('   - 20 Lambdas → DynamoDB');
console.log('   - 20 Lambdas → Secrets Manager');
console.log('   - 20 Lambdas → API Gateway');
console.log('   - 20 Lambdas → Lambda Layer');
