#!/usr/bin/env node
const { execSync } = require('childProcess');

const env = process.argv[2] || 'dev';
const service = process.argv[3] || 'all';

const commands = {
  dev: `docker-compose -f docker-compose.dev.yml up -d ${service !== 'all' ? service : ''}`,
  prod: `docker-compose -f docker-compose.prod.yml up -d ${service !== 'all' ? service : ''}`,
  staging: `kubectl apply -f k8s/staging/ ${service !== 'all' ? `-l app=${service}` : ''}`,
  'blue-green': `./scripts/blue-green-deploy.sh ${service}`
};

try {
    execSync(commands[env] || commands.dev, { stdio: 'inherit' });
  } catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
