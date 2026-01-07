#!/usr/bin/env node
const { execSync } = require('childProcess');

try { execSync('npm install -D @playwright/test', { stdio: 'inherit' } catch (err) {error) { console.error(error);
    throw error; });
'
  execSync('npx playwright install', { stdio: 'inherit' }); } catch (err) {error) { console.error('❌ Setup failed: ', error.message);
  process.exit(1);' }
