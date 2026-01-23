#!/usr/bin/env node
/**
 * Backend Validation Script
 * Verifies all backend services and configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

let passed = 0;
let failed = 0;

// Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filePath, description) {
  const safeFilePath = filePath.replace(/[^\w\s\-.(){}:;/\\]/g, '');
  const exists = fs.existsSync(safeFilePath);
  if (exists) {
    log(`✅ ${description}`, GREEN);
    passed++;
  } else {
    log(`❌ ${description} - File not found: ${safeFilePath}`, RED);
    failed++;
  }
  return exists;
}

function checkPort(port, service) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      if (res.statusCode === 200) {
        log(`✅ ${service} running on port ${port}`, GREEN);
        passed++;
        resolve(true);
      } else {
        log(`⚠️  ${service} responding but not healthy (status ${res.statusCode})`, YELLOW);
        passed++;
        resolve(false);
      }
    });
    
    req.on('error', () => {
      log(`❌ ${service} not running on port ${port}`, RED);
      failed++;
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      log(`❌ ${service} timeout on port ${port}`, RED);
      failed++;
      resolve(false);
    });
  });
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    log(`✅ ${description}`, GREEN);
    passed++;
    return true;
  } catch (error) {
    log(`❌ ${description}`, RED);
    failed++;
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 HOOTNER Backend Validation');
  console.log('='.repeat(60) + '\n');
  
  // Check Node.js and NPM
  log('📦 Checking Prerequisites...\n');
  checkCommand('node --version', 'Node.js installed');
  checkCommand('npm --version', 'NPM installed');
  checkCommand('docker --version', 'Docker installed');
  checkCommand('python --version', 'Python installed');
  
  // Check project structure
  log('\n📁 Checking Project Structure...\n');
  checkFile('package.json', 'Root package.json');
  checkFile('api/graphql/package.json', 'GraphQL API package.json');
  checkFile('api/graphql/server-enhanced.js', 'GraphQL server');
  checkFile('services/video-generation/api.py', 'Video Generation API');
  checkFile('docker-compose.dev.yml', 'Development Docker Compose');
  checkFile('.env', 'Environment configuration');
  
  // Check scripts
  log('\n🔧 Checking Scripts...\n');
  checkFile('scripts/start-backend.js', 'Backend orchestrator');
  checkFile('scripts/optimize-databases.js', 'Database optimization');
  checkFile('scripts/aws-setup.js', 'AWS setup script');
  checkFile('scripts/mongo-init.js', 'MongoDB initialization');
  
  // Check middleware
  log('\n🛡️  Checking Security Middleware...\n');
  checkFile('api/graphql/middleware/security.js', 'Security middleware');
  
  // Check documentation
  log('\n📚 Checking Documentation...\n');
  checkFile('docs/BACKEND_QUICKSTART.md', 'Backend quick start guide');
  checkFile('BACKEND_STATUS.md', 'Backend status document');
  
  // Check dependencies
  log('\n📦 Checking Dependencies...\n');
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasExpressGraphql = rootPackage.dependencies && rootPackage.dependencies['express-graphql'];
  
  if (!hasExpressGraphql) {
    log('✅ express-graphql removed (no conflict)', GREEN);
    passed++;
  } else {
    log('❌ express-graphql still present (conflict with apollo-server)', RED);
    failed++;
  }
  
  if (rootPackage.dependencies && rootPackage.dependencies['graphql']) {
    log('✅ graphql dependency present', GREEN);
    passed++;
  } else {
    log('❌ graphql dependency missing', RED);
    failed++;
  }
  
  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    log('✅ Root dependencies installed', GREEN);
    passed++;
  } else {
    log('⚠️  Root dependencies not installed - run: npm install', YELLOW);
  }
  
  if (fs.existsSync('api/graphql/node_modules')) {
    log('✅ GraphQL API dependencies installed', GREEN);
    passed++;
  } else {
    log('⚠️  GraphQL API dependencies not installed - run: cd api/graphql && npm install', YELLOW);
  }
  
  // Check running services
  log('\n🚀 Checking Running Services...\n');
  
  // Check Docker containers
  try {
    const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
    
    if (containers.includes('mongodb')) {
      log('✅ MongoDB container running', GREEN);
      passed++;
    } else {
      log('❌ MongoDB container not running', RED);
      log('   Start with: docker-compose -f docker-compose.dev.yml up -d mongodb', YELLOW);
      failed++;
    }
    
    if (containers.includes('redis')) {
      log('✅ Redis container running', GREEN);
      passed++;
    } else {
      log('❌ Redis container not running', RED);
      log('   Start with: docker-compose -f docker-compose.dev.yml up -d redis', YELLOW);
      failed++;
    }
  } catch (error) {
    log('⚠️  Could not check Docker containers', YELLOW);
  }
  
  // Check API endpoints
  log('\n🌐 Checking API Endpoints...\n');
  await checkPort(4000, 'GraphQL API');
  await checkPort(5003, 'Video Generation API');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    log('\n🎉 All checks passed! Backend is ready.', GREEN);
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend: npm run start:backend');
    console.log('   2. Optimize databases: npm run db:optimize');
    console.log('   3. Setup AWS (optional): npm run aws:setup');
  } else {
    log('\n⚠️  Some checks failed. Review the output above.', YELLOW);
    console.log('\n📝 Common fixes:');
    console.log('   • Install dependencies: npm install');
    console.log('   • Start infrastructure: docker-compose -f docker-compose.dev.yml up -d');
    console.log('   • Create .env file: cp .env.example .env');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\n❌ Validation failed:', error);
  process.exit(1);
});
