#!/usr/bin/env node

/**
 * Secret Scanner for Pre-commit Hook
 * Scans staged files for potential secrets (passwords, tokens, API keys, etc.)
 * Exits with code 1 if secrets are found, 0 otherwise
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Secret patterns to detect
const SECRET_PATTERNS = [
  // API Keys and Tokens
  { pattern: /(?:api[_-]?key|apikey)[\s]*[=:]["']?([a-zA-Z0-9_-]{20,})["']?/gi, name: 'API Key' },
  { pattern: /(?:secret[_-]?key|secretkey)[\s]*[=:]["']?([a-zA-Z0-9_-]{20,})["']?/gi, name: 'Secret Key' },
  { pattern: /(?:access[_-]?token|accesstoken)[\s]*[=:]["']?([a-zA-Z0-9_-]{20,})["']?/gi, name: 'Access Token' },
  { pattern: /(?:auth[_-]?token|authtoken)[\s]*[=:]["']?([a-zA-Z0-9_-]{20,})["']?/gi, name: 'Auth Token' },
  
  // AWS
  { pattern: /AKIA[0-9A-Z]{16}/gi, name: 'AWS Access Key' },
  { pattern: /aws[_-]?secret[_-]?access[_-]?key[\s]*[=:]["']?([a-zA-Z0-9/+=]{40})["']?/gi, name: 'AWS Secret Key' },
  
  // GitHub Token
  { pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/gi, name: 'GitHub Token' },
  
  // Private Keys
  { pattern: /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/gi, name: 'Private Key' },
  
  // JWT Tokens
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/gi, name: 'JWT Token' },
  
  // Generic Passwords
  { pattern: /(?:password|passwd|pwd)[\s]*[=:]["']?([^\s"']{8,})["']?/gi, name: 'Password' },
  
  // Database Connection Strings
  { pattern: /(?:mongodb|mysql|postgres|postgresql):\/\/[^\s"']+:[^\s"']+@[^\s"']+/gi, name: 'Database Connection String' },
  
  // Stripe Keys
  { pattern: /(?:sk|pk)_(?:live|test)_[0-9a-zA-Z]{24,}/gi, name: 'Stripe Key' },
  
  // Generic Secrets (base64 encoded strings that look like secrets)
  { pattern: /(?:secret|token|key)[\s]*[=:]["']?([A-Za-z0-9+/]{40,}={0,2})["']?/gi, name: 'Generic Secret' }
];

// Files to ignore (e.g., test files, examples)
const IGNORE_PATTERNS = [
  '.env.example',
  '.env.template',
  'package-lock.json',
  'package.json',
  '.md',
  'test-commit.js',
  'SECRETS.md'
];

// Safe values that are placeholders (not actual secrets)
const SAFE_PLACEHOLDERS = [
  'your-api-key-here',
  'your-secret-key',
  'password123',
  'example.com',
  'changeme',
  'placeholder',
  'xxxxxxxxxx',
  'your_token_here',
  'test_key',
  'sample_token'
];

function isSafePlaceholder(value) {
  const lowerValue = value.toLowerCase();
  return SAFE_PLACEHOLDERS.some(placeholder => lowerValue.includes(placeholder.toLowerCase()));
}

function shouldIgnoreFile(filename) {
  return IGNORE_PATTERNS.some(pattern => filename.includes(pattern));
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
    return output.trim().split('\n').filter(f => f);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

function scanFileForSecrets(filename, content) {
  const findings = [];
  
  for (const { pattern, name } of SECRET_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const matchedText = match[0];
      const potentialSecret = match[1] || matchedText;
      
      // Skip if it's a safe placeholder
      if (isSafePlaceholder(matchedText) || isSafePlaceholder(potentialSecret)) {
        continue;
      }
      
      // Get line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      findings.push({
        file: filename,
        line: lineNumber,
        type: name,
        preview: matchedText.substring(0, 50) + (matchedText.length > 50 ? '...' : '')
      });
    }
  }
  
  return findings;
}

function scanSecrets() {
  console.log('🔍 Scanning for secrets in staged files...\n');
  
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('No staged files to scan.');
    return 0;
  }
  
  let allFindings = [];
  
  for (const file of stagedFiles) {
    if (shouldIgnoreFile(file)) {
      console.log(`⏭️  Skipping: ${file} (ignored file type)`);
      continue;
    }
    
    try {
      const content = readFileSync(file, 'utf-8');
      const findings = scanFileForSecrets(file, content);
      
      if (findings.length > 0) {
        allFindings = allFindings.concat(findings);
      } else {
        console.log(`✅ Clean: ${file}`);
      }
    } catch (error) {
      // File might be binary or deleted
      console.log(`⏭️  Skipping: ${file} (${error.message})`);
    }
  }
  
  if (allFindings.length > 0) {
    console.log('\n❌ POTENTIAL SECRETS DETECTED!\n');
    console.log('═'.repeat(80));
    
    for (const finding of allFindings) {
      console.log(`\n📁 File: ${finding.file}:${finding.line}`);
      console.log(`🔑 Type: ${finding.type}`);
      console.log(`📝 Preview: ${finding.preview}`);
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n⚠️  Please remove secrets before committing!');
    console.log('💡 Tip: Use environment variables or .env files (add to .gitignore)');
    console.log('💡 If this is a false positive, add to IGNORE_PATTERNS in scripts/scan-secrets.js\n');
    
    return 1; // Exit with error code
  }
  
  console.log('\n✅ No secrets detected in staged files!\n');
  return 0;
}

// Run the scanner
const exitCode = scanSecrets();
process.exit(exitCode);
