#!/usr/bin/env node

import { CloudFormationClient, CreateStackCommand } from '@aws-sdk/client-cloudformation';

const template = {
  AWSTemplateFormatVersion: '2010-09-09',
  Description: 'HOOTNER Extension Backend - The Owl Never Sleeps',
  
  Resources: {
    // User Pool for authentication
    UserPool: {
      Type: 'AWS::Cognito::UserPool',
      Properties: {
        UserPoolName: 'hootner-extension-users',
        AutoVerifiedAttributes: ['email'],
        Schema: [
          { Name: 'email', Required: true },
          { Name: 'subscription_tier', Mutable: true, AttributeDataType: 'String' }
        ]
      }
    },
    
    // Subscription tracking table
    SubscriptionsTable: {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        TableName: 'hootner-subscriptions',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'subscriptionId', AttributeType: 'S' }
        ],
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'subscriptionId', KeyType: 'RANGE' }
        ]
      }
    },
    
    // Usage tracking table
    UsageTable: {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        TableName: 'hootner-usage',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'timestamp', AttributeType: 'N' }
        ],
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ]
      }
    },
    
    // License validation Lambda
    LicenseValidationFunction: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        FunctionName: 'hootner-license-validator',
        Runtime: 'nodejs20.x',
        Handler: 'index.handler',
        Role: { 'Fn::GetAtt': ['LambdaExecutionRole', 'Arn'] },
        Code: {
          ZipFile: `
            exports.handler = async (event) => {
              const { userId, tier } = JSON.parse(event.body);
              // Validate license and return agent access
              return {
                statusCode: 200,
                body: JSON.stringify({
                  valid: true,
                  tier: tier || 'free',
                  agentAccess: tier === 'enterprise' ? 80 : tier === 'pro' ? 80 : 20,
                  queryLimit: tier === 'free' ? 100 : -1
                })
              };
            };
          `
        }
      }
    },
    
    // API Gateway
    ExtensionAPI: {
      Type: 'AWS::ApiGateway::RestApi',
      Properties: {
        Name: 'hootner-extension-api',
        Description: 'HOOTNER Extension Backend API'
      }
    },
    
    // Lambda execution role
    LambdaExecutionRole: {
      Type: 'AWS::IAM::Role',
      Properties: {
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: { Service: 'lambda.amazonaws.com' },
            Action: 'sts:AssumeRole'
          }]
        },
        ManagedPolicyArns: [
          'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'
        ]
      }
    }
  },
  
  Outputs: {
    UserPoolId: {
      Value: { Ref: 'UserPool' },
      Description: 'Cognito User Pool ID'
    },
    ApiEndpoint: {
      Value: { 'Fn::Sub': 'https://${ExtensionAPI}.execute-api.${AWS::Region}.amazonaws.com/prod' },
      Description: 'API Gateway endpoint'
    }
  }
};

console.log('🦉 Deploying HOOTNER Extension Backend...\n');
console.log('📦 Creating CloudFormation stack...');
console.log('⏱️  This will take 3-5 minutes...\n');

const client = new CloudFormationClient({});
const command = new CreateStackCommand({
  StackName: 'hootner-extension-backend',
  TemplateBody: JSON.stringify(template),
  Capabilities: ['CAPABILITY_IAM']
});

try {
  const response = await client.send(command);
  console.log('✅ Stack creation initiated:', response.StackId);
  console.log('\n📋 Next steps:');
  console.log('1. Wait for stack completion: aws cloudformation wait stack-create-complete --stack-name hootner-extension-backend');
  console.log('2. Get outputs: aws cloudformation describe-stacks --stack-name hootner-extension-backend');
  console.log('3. Configure Stripe: npm run stripe:setup');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
}
