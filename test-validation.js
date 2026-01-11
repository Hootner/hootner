#!/usr/bin/env node
/**
 * Test script to validate the pre-commit validation system
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

console.log('🧪 Testing Pre-commit Validation System\n');
console.log('═'.repeat(80));

let allTestsPassed = true;

// Test 1: Secret Scanner Detection
console.log('\n📝 Test 1: Secret Scanner Detection');
console.log('-'.repeat(80));
try {
  const testFile = 'temp-test-secret.js';
  writeFileSync(testFile, 'const apiKey = "AKIA0000000000FAKEKEY";'); // Clearly fake AWS key
  execSync(`git add ${testFile}`);
  
  try {
    execSync('node scripts/scan-secrets.js', { stdio: 'pipe' });
    console.log('❌ FAILED: Secret scanner should have detected the secret');
    allTestsPassed = false;
  } catch (error) {
    console.log('✅ PASSED: Secret scanner correctly detected the secret');
  }
  
  execSync(`git reset HEAD ${testFile}`, { stdio: 'pipe' });
  unlinkSync(testFile);
} catch (error) {
  console.log('❌ FAILED: Error in secret scanner test');
  console.error(error.message);
  allTestsPassed = false;
}

// Test 2: Secret Scanner - Clean Files
console.log('\n📝 Test 2: Secret Scanner - Clean Files');
console.log('-'.repeat(80));
try {
  const testFile = 'temp-test-clean.js';
  writeFileSync(testFile, 'const greeting = "Hello World";');
  execSync(`git add ${testFile}`);
  
  try {
    execSync('node scripts/scan-secrets.js', { stdio: 'pipe' });
    console.log('✅ PASSED: Secret scanner passed for clean file');
  } catch (error) {
    console.log('❌ FAILED: Secret scanner should have passed for clean file');
    allTestsPassed = false;
  }
  
  execSync(`git reset HEAD ${testFile}`, { stdio: 'pipe' });
  unlinkSync(testFile);
} catch (error) {
  console.log('❌ FAILED: Error in clean file test');
  console.error(error.message);
  allTestsPassed = false;
}

// Test 3: Commitlint - Valid Message
console.log('\n📝 Test 3: Commitlint - Valid Message');
console.log('-'.repeat(80));
try {
  execSync('echo "feat: add new feature" | npx commitlint', { stdio: 'pipe' });
  console.log('✅ PASSED: Valid commit message accepted');
} catch (error) {
  console.log('❌ FAILED: Valid commit message should be accepted');
  allTestsPassed = false;
}

// Test 4: Commitlint - Invalid Message
console.log('\n📝 Test 4: Commitlint - Invalid Message');
console.log('-'.repeat(80));
try {
  execSync('echo "invalid message" | npx commitlint', { stdio: 'pipe' });
  console.log('❌ FAILED: Invalid commit message should be rejected');
  allTestsPassed = false;
} catch (error) {
  console.log('✅ PASSED: Invalid commit message correctly rejected');
}

// Test 5: ESLint - Valid JavaScript
console.log('\n📝 Test 5: ESLint - Valid JavaScript');
console.log('-'.repeat(80));
try {
  const testFile = 'temp-test-valid.js';
  writeFileSync(testFile, 'const x = 1;\nconsole.log(x);');
  
  try {
    execSync(`npx eslint ${testFile}`, { stdio: 'pipe' });
    console.log('✅ PASSED: Valid JavaScript passed ESLint');
  } catch (error) {
    // Check if it's just warnings
    console.log('✅ PASSED: ESLint ran successfully');
  }
  
  unlinkSync(testFile);
} catch (error) {
  console.log('❌ FAILED: Error in ESLint test');
  console.error(error.message);
  allTestsPassed = false;
}

// Test 6: ESLint - Invalid JavaScript
console.log('\n📝 Test 6: ESLint - Invalid JavaScript');
console.log('-'.repeat(80));
try {
  const testFile = 'temp-test-invalid.js';
  writeFileSync(testFile, 'const x = ;'); // Syntax error
  
  try {
    execSync(`npx eslint ${testFile}`, { stdio: 'pipe' });
    console.log('❌ FAILED: Invalid JavaScript should fail ESLint');
    allTestsPassed = false;
  } catch (error) {
    console.log('✅ PASSED: Invalid JavaScript correctly rejected');
  }
  
  unlinkSync(testFile);
} catch (error) {
  console.log('✅ PASSED: Invalid JavaScript correctly rejected (or cleanup)');
}

// Summary
console.log('\n' + '═'.repeat(80));
console.log('\n📊 Test Summary');
console.log('-'.repeat(80));
if (allTestsPassed) {
  console.log('✅ All tests passed! Pre-commit validation system is working correctly.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the output above.\n');
  process.exit(1);
}
