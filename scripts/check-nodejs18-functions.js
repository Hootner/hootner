#!/usr/bin/env node

/**
 * Check Lambda Functions for Node.js 18 Runtime
 * Alternative to AWS Trusted Advisor for identifying outdated runtimes
 */

import { LambdaClient, ListFunctionsCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';

const client = new LambdaClient({});

async function checkNodeJs18Functions() {
  console.log('🔍 Checking for Lambda functions using Node.js 18 runtime...\n');

  const nodejs18Functions = [];
  let marker = undefined;

  try {
    do {
      const command = new ListFunctionsCommand({
        Marker: marker,
        MaxItems: 50
      });

      const response = await client.send(command);

      if (response.Functions) {
        for (const func of response.Functions) {
          if (func.Runtime === 'nodejs18.x') {
            nodejs18Functions.push({
              name: func.FunctionName,
              runtime: func.Runtime,
              lastModified: func.LastModified,
              arn: func.FunctionArn,
              memorySize: func.MemorySize,
              timeout: func.Timeout
            });
          }
        }
      }

      marker = response.NextMarker;
    } while (marker);

    // Display results
    if (nodejs18Functions.length === 0) {
      console.log('✅ No functions found using Node.js 18 runtime');
    } else {
      console.log(`⚠️  Found ${nodejs18Functions.length} function(s) using Node.js 18:\n`);
      console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
      console.log('│ Function Name                    │ Last Modified     │ Memory │ Timeout   │');
      console.log('├─────────────────────────────────────────────────────────────────────────────┤');

      for (const func of nodejs18Functions) {
        const name = func.name.padEnd(32).substring(0, 32);
        const date = func.lastModified.substring(0, 10);
        const memory = `${func.memorySize}MB`.padEnd(6);
        const timeout = `${func.timeout}s`.padEnd(9);
        console.log(`│ ${name} │ ${date} │ ${memory} │ ${timeout} │`);
      }

      console.log('└─────────────────────────────────────────────────────────────────────────────┘');
      console.log('\n📋 Detailed Information:\n');

      for (const func of nodejs18Functions) {
        console.log(`Function: ${func.name}`);
        console.log(`  ARN: ${func.arn}`);
        console.log(`  Runtime: ${func.runtime}`);
        console.log(`  Last Modified: ${func.lastModified}`);
        console.log(`  Memory: ${func.memorySize} MB`);
        console.log(`  Timeout: ${func.timeout} seconds`);
        console.log('');
      }

      console.log('\n💡 Recommendations:');
      console.log('  • Node.js 18 reaches end-of-life on April 30, 2026');
      console.log('  • Consider upgrading to Node.js 20.x or later');
      console.log('  • Test your functions with the new runtime before deploying');
      console.log('  • Update package.json and dependencies as needed');
    }

    // Export results as JSON
    const report = {
      timestamp: new Date().toISOString(),
      totalFunctions: nodejs18Functions.length,
      functions: nodejs18Functions,
      recommendation: 'Upgrade to Node.js 20.x or later before April 30, 2026'
    };

    return report;

  } catch (error) {
    console.error('❌ Error checking Lambda functions:', error.message);
    if (error.name === 'CredentialsProviderError') {
      console.error('\n💡 Please configure AWS credentials:');
      console.error('   aws configure');
    }
    throw error;
  }
}

// Run the check
checkNodeJs18Functions()
  .then(report => {
    // Write report to file
    const fs = require('fs');
    const reportPath = './nodejs18-runtime-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  })
  .catch(() => {
    process.exit(1);
  });
