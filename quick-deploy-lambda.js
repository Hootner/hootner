#!/usr/bin/env node

/**
 * Quick AWS Lambda Deployment
 * Deploy with existing configuration
 */

import { execSync } from 'child_process';

const exec = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
};

console.log('🦉 Quick Deploy HOOTNER Serverless\n');

// Use existing samconfig.toml
exec('sam build');
exec('sam deploy');

console.log('\n✅ Deployed successfully!');