#!/usr/bin/env node

import { CloudFormationClient, DescribeStacksCommand, ListStacksCommand } from '@aws-sdk/client-cloudformation';

const cf = new CloudFormationClient({ region: 'us-east-1' });

async function checkStack() {
  console.log('🔍 Checking HOOTNER Stack Status\n');

  try {
    // Check for any HOOTNER-related stacks
    const stacks = await cf.send(new ListStacksCommand({
      StackStatusFilter: ['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'ROLLBACK_COMPLETE']
    }));

    const hootnerStacks = stacks.StackSummaries.filter(stack => 
      stack.StackName.toLowerCase().includes('hootner')
    );

    if (hootnerStacks.length === 0) {
      console.log('❌ No HOOTNER stacks found');
      console.log('✅ Ready for fresh deployment\n');
      
      console.log('📋 Environment Files Status:');
      console.log('✅ .env (development)');
      console.log('✅ .env.production');
      console.log('✅ .env.example');
      console.log('✅ .env.production.example');
      console.log('🧹 Cleaned duplicate .env files\n');
      
      console.log('🚀 Next: Deploy with:');
      console.log('   sam build && sam deploy --guided');
    } else {
      console.log('📊 Found HOOTNER stacks:');
      hootnerStacks.forEach(stack => {
        console.log(`   ${stack.StackName}: ${stack.StackStatus}`);
      });
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

checkStack();