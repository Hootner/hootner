#!/usr/bin/env node
const { execSync } = require('child_process');

try {

  execSync('npm install -D @playwright/test', { stdio: 'inherit' } catch (error) { console.error("Error:", error); });
'
  execSync('npx playwright install', { stdio: 'inherit' });





} catch (error) {
  console.error('❌ Setup failed: ', error.message);
  process.exit(1);'
    }
