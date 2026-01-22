#!/usr/bin/env node

/**
 * HOOTNER Security Audit Script
 * Comprehensive security scanning and vulnerability assessment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityAuditor {
  constructor() {
    this.results = {
      vulnerabilities: [],
      warnings: [],
      passed: [],
      summary: {}
    };
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, details };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (details) console.log('  Details:', details);
    
    this.results[level === 'error' ? 'vulnerabilities' : level === 'warn' ? 'warnings' : 'passed'].push(logEntry);
  }

  async checkDependencies() {
    console.log('\n🔍 Checking dependencies for vulnerabilities...');
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.total > 0) {
        this.log('error', `Found ${audit.metadata.vulnerabilities.total} vulnerabilities`, audit.metadata.vulnerabilities);
      } else {
        this.log('info', 'No dependency vulnerabilities found');
      }
    } catch (error) {
      this.log('warn', 'Could not run npm audit', error.message);
    }
  }

  checkEnvironmentSecurity() {
    console.log('\n🔒 Checking environment security...');
    
    const envExample = path.join(__dirname, '.env.example');
    const envFile = path.join(__dirname, '.env');
    
    // Check if .env exists in production
    if (fs.existsSync(envFile)) {
      this.log('warn', '.env file exists - ensure it\'s not committed to version control');
    }
    
    // Check .env.example for weak defaults
    if (fs.existsSync(envExample)) {
      const envContent = fs.readFileSync(envExample, 'utf8');
      
      const weakPatterns = [
        { pattern: /JWT_SECRET=.*test.*|JWT_SECRET=.*dev.*|JWT_SECRET=.*123.*/i, message: 'Weak JWT secret detected' },
        { pattern: /PASSWORD=.*123.*|PASSWORD=.*test.*|PASSWORD=.*admin.*/i, message: 'Weak default password detected' },
        { pattern: /SECRET.*=.*secret.*|SECRET.*=.*key.*/i, message: 'Generic secret values detected' }
      ];
      
      weakPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(envContent)) {
          this.log('warn', message);
        }
      });
    }
  }

  checkFilePermissions() {
    console.log('\n📁 Checking file permissions...');
    
    const sensitiveFiles = [
      '.env',
      'package.json',
      'docker-compose.yml',
      'api/graphql/server.js'
    ];
    
    sensitiveFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = (stats.mode & parseInt('777', 8)).toString(8);
          
          if (mode === '777' || mode === '666') {
            this.log('error', `File ${file} has overly permissive permissions: ${mode}`);
          } else {
            this.log('info', `File ${file} permissions OK: ${mode}`);
          }
        } catch (error) {
          this.log('warn', `Could not check permissions for ${file}`, error.message);
        }
      }
    });
  }

  checkDockerSecurity() {
    console.log('\n🐳 Checking Docker security...');
    
    const dockerFiles = ['Dockerfile', 'Dockerfile.frontend', 'docker-compose.yml'];
    
    dockerFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for security best practices
        const securityChecks = [
          { pattern: /USER root/i, message: `${file}: Running as root user detected`, level: 'error' },
          { pattern: /--privileged/i, message: `${file}: Privileged mode detected`, level: 'error' },
          { pattern: /ADD.*http/i, message: `${file}: Using ADD with HTTP URLs`, level: 'warn' },
          { pattern: /COPY.*--chown/i, message: `${file}: Using proper file ownership`, level: 'info' }
        ];
        
        securityChecks.forEach(({ pattern, message, level }) => {
          if (pattern.test(content)) {
            this.log(level, message);
          }
        });
      }
    });
  }

  checkCodeSecurity() {
    console.log('\n💻 Checking code security patterns...');
    
    const jsFiles = [
      'index.js',
      'frontend-server.js',
      'api/graphql/server.js'
    ];
    
    jsFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const securityPatterns = [
          { pattern: /eval\s*\(/i, message: `${file}: eval() usage detected`, level: 'error' },
          { pattern: /innerHTML\s*=/i, message: `${file}: innerHTML usage (XSS risk)`, level: 'warn' },
          { pattern: /process\.env\.\w+/g, message: `${file}: Environment variable usage`, level: 'info' },
          { pattern: /console\.log.*password|console\.log.*secret/i, message: `${file}: Potential secret logging`, level: 'error' }
        ];
        
        securityPatterns.forEach(({ pattern, message, level }) => {
          if (pattern.test(content)) {
            this.log(level, message);
          }
        });
      }
    });
  }

  generateReport() {
    console.log('\n📊 Generating security report...');
    
    this.results.summary = {
      vulnerabilities: this.results.vulnerabilities.length,
      warnings: this.results.warnings.length,
      passed: this.results.passed.length,
      timestamp: new Date().toISOString()
    };
    
    const reportPath = path.join(__dirname, 'security-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📋 Security Audit Summary:');
    console.log(`   🔴 Vulnerabilities: ${this.results.summary.vulnerabilities}`);
    console.log(`   🟡 Warnings: ${this.results.summary.warnings}`);
    console.log(`   🟢 Passed: ${this.results.summary.passed}`);
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    return this.results.summary.vulnerabilities === 0;
  }
}

// Run security audit
async function runSecurityAudit() {
  console.log('🛡️  HOOTNER Security Audit Starting...\n');
  
  const auditor = new SecurityAuditor();
  
  try {
    await auditor.checkDependencies();
    auditor.checkEnvironmentSecurity();
    auditor.checkFilePermissions();
    auditor.checkDockerSecurity();
    auditor.checkCodeSecurity();
    
    const passed = auditor.generateReport();
    
    console.log('\n🛡️  Security audit completed!');
    process.exit(passed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Security audit failed:', error.message);
    process.exit(1);
  }
}

runSecurityAudit();