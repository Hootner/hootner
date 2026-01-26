#!/usr/bin/env node

/**
 * API Security Scanner Agent
 * 
 * Scans all HTML pages for:
 * - API key references and potential leaks
 * - Database connection strings
 * - Hardcoded credentials
 * - Insecure API calls
 * - Environment variable exposure
 * 
 * Usage: node agents/api-security-scanner-agent.js [options]
 * Options:
 *   --path <path>     Scan specific path (default: apps/frontend/dist)
 *   --json            Output results as JSON
 *   --detailed        Include code snippets in report
 *   --fix             Suggest fixes for found issues
 */

const fs = require('fs');
const path = require('path');

class APISecurityScanner {
  constructor(options = {}) {
    this.options = {
      basePath: options.path || 'apps/frontend/dist',
      json: options.json || false,
      detailed: options.detailed || false,
      fix: options.fix || false
    };

    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };

    // Security patterns to detect
    this.patterns = {
      // API Keys
      apiKeys: [
        { pattern: /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'API Key Exposure' },
        { pattern: /apikey\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'API Key Exposure' },
        { pattern: /API_KEY\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'API Key Exposure' },
        { pattern: /x-api-key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'API Key Header' }
      ],
      
      // AWS/Cloud Credentials
      awsCredentials: [
        { pattern: /AKIA[0-9A-Z]{16}/g, severity: 'critical', type: 'AWS Access Key' },
        { pattern: /aws[_-]?access[_-]?key[_-]?id\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'AWS Credentials' },
        { pattern: /aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'AWS Secret Key' }
      ],
      
      // Database Connections
      dbConnections: [
        { pattern: /mongodb:\/\/[^'"]+/gi, severity: 'critical', type: 'MongoDB Connection String' },
        { pattern: /postgres:\/\/[^'"]+/gi, severity: 'critical', type: 'PostgreSQL Connection String' },
        { pattern: /mysql:\/\/[^'"]+/gi, severity: 'critical', type: 'MySQL Connection String' },
        { pattern: /dynamodb[_-]?endpoint\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'high', type: 'DynamoDB Endpoint' },
        { pattern: /connection[_-]?string\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'high', type: 'Database Connection String' }
      ],
      
      // Secrets and Tokens
      secrets: [
        { pattern: /secret[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'Secret Key' },
        { pattern: /private[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'Private Key' },
        { pattern: /bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/gi, severity: 'critical', type: 'Bearer Token (JWT)' },
        { pattern: /token\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'high', type: 'Authentication Token' }
      ],
      
      // Third-party API Keys
      thirdParty: [
        { pattern: /stripe[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'Stripe API Key' },
        { pattern: /sk_live_[0-9a-zA-Z]{24,}/g, severity: 'critical', type: 'Stripe Secret Key' },
        { pattern: /pk_live_[0-9a-zA-Z]{24,}/g, severity: 'high', type: 'Stripe Public Key' },
        { pattern: /firebase[_-]?api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'high', type: 'Firebase API Key' },
        { pattern: /AIza[0-9A-Za-z\-_]{35}/g, severity: 'high', type: 'Google API Key' }
      ],
      
      // Passwords
      passwords: [
        { pattern: /password\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'Hardcoded Password' },
        { pattern: /passwd\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'Hardcoded Password' },
        { pattern: /pwd\s*[:=]\s*['"]([^'"]+)['"]/gi, severity: 'critical', type: 'Hardcoded Password' }
      ],
      
      // Insecure API Calls
      insecureAPIs: [
        { pattern: /fetch\s*\(\s*['"]http:\/\/[^'"]+['"]/gi, severity: 'medium', type: 'Insecure HTTP Request' },
        { pattern: /XMLHttpRequest.*http:\/\//gi, severity: 'medium', type: 'Insecure XHR Request' },
        { pattern: /axios\.(get|post|put|delete)\s*\(\s*['"]http:\/\/[^'"]+['"]/gi, severity: 'medium', type: 'Insecure Axios Request' }
      ],
      
      // Environment Variables in Frontend
      envVars: [
        { pattern: /process\.env\.[A-Z_]+/g, severity: 'medium', type: 'Environment Variable Reference' },
        { pattern: /import\.meta\.env\.[A-Z_]+/g, severity: 'low', type: 'Vite Environment Variable' }
      ],
      
      // Localhost/Development URLs
      devUrls: [
        { pattern: /localhost:\d+/gi, severity: 'low', type: 'Localhost URL' },
        { pattern: /127\.0\.0\.1:\d+/g, severity: 'low', type: 'Loopback IP Address' },
        { pattern: /0\.0\.0\.0:\d+/g, severity: 'low', type: 'All Interfaces Binding' }
      ],
      
      // Direct Database Access in Frontend
      frontendDB: [
        { pattern: /DynamoDB|dynamodb/g, severity: 'high', type: 'DynamoDB Reference in Frontend' },
        { pattern: /\.getItem\s*\(|\.putItem\s*\(|\.query\s*\(/gi, severity: 'high', type: 'Direct Database Operation' },
        { pattern: /AWS\.DynamoDB/g, severity: 'critical', type: 'AWS SDK Direct Usage' }
      ]
    };
  }

  /**
   * Scan directory recursively for files
   */
  scanDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.scanDirectory(filePath, fileList);
        }
      } else {
        // Include only HTML files
        const ext = path.extname(file).toLowerCase();
        if (ext === '.html') {
          fileList.push(filePath);
        }
      }
    });
    
    return fileList;
  }

  /**
   * Analyze file content for security issues
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Scan with all pattern categories
      Object.entries(this.patterns).forEach(([category, patterns]) => {
        patterns.forEach(({ pattern, severity, type }) => {
          const matches = [...content.matchAll(pattern)];
          
          matches.forEach((match, index) => {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const line = content.split('\n')[lineNumber - 1]?.trim();
            
            const finding = {
              file: relativePath,
              line: lineNumber,
              severity: severity,
              type: type,
              category: category,
              match: match[0],
              context: line,
              suggestion: this.getSuggestion(type, category)
            };
            
            if (this.options.detailed) {
              finding.snippet = this.getCodeSnippet(content, lineNumber, 3);
            }
            
            this.findings[severity].push(finding);
          });
        });
      });
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  /**
   * Get code snippet around the line
   */
  getCodeSnippet(content, lineNumber, contextLines = 3) {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - contextLines - 1);
    const end = Math.min(lines.length, lineNumber + contextLines);
    
    return lines.slice(start, end).map((line, idx) => {
      const currentLine = start + idx + 1;
      const marker = currentLine === lineNumber ? '>' : ' ';
      return `${marker} ${currentLine}: ${line}`;
    }).join('\n');
  }

  /**
   * Get security suggestion for the issue
   */
  getSuggestion(type, category) {
    const suggestions = {
      'API Key Exposure': 'Move API keys to environment variables (.env) and use a backend proxy to call APIs',
      'AWS Access Key': 'CRITICAL: Revoke this key immediately via AWS Console and use IAM roles instead',
      'AWS Credentials': 'Use AWS Secrets Manager or environment variables, never commit credentials',
      'MongoDB Connection String': 'Store connection strings in environment variables with restricted access',
      'PostgreSQL Connection String': 'Use environment variables and implement connection pooling',
      'MySQL Connection String': 'Store in secure vault (AWS Secrets Manager) and rotate regularly',
      'DynamoDB Endpoint': 'Use AWS SDK configuration and IAM roles instead of hardcoded endpoints',
      'Database Connection String': 'Store in environment variables and use secret management',
      'Secret Key': 'Move to AWS Secrets Manager or encrypted environment variables',
      'Private Key': 'CRITICAL: Store in secure vault, rotate immediately if exposed',
      'Bearer Token (JWT)': 'Never hardcode tokens, use secure storage and refresh mechanisms',
      'Authentication Token': 'Use secure HTTP-only cookies or localStorage with encryption',
      'Stripe API Key': 'Use environment variables and implement server-side validation',
      'Stripe Secret Key': 'CRITICAL: Revoke immediately and use only on backend',
      'Firebase API Key': 'Restrict API key usage in Firebase console and use domain restrictions',
      'Google API Key': 'Add API restrictions in Google Cloud Console',
      'Hardcoded Password': 'CRITICAL: Remove immediately and implement proper authentication',
      'Insecure HTTP Request': 'Use HTTPS for all API calls',
      'Environment Variable Reference': 'Ensure environment variables don\'t contain sensitive data in frontend',
      'Localhost URL': 'Replace with environment-based configuration for production',
      'DynamoDB Reference in Frontend': 'Use backend API layer instead of direct database access',
      'Direct Database Operation': 'Implement API gateway/backend to handle database operations',
      'AWS SDK Direct Usage': 'CRITICAL: Never use AWS SDK directly in frontend, use backend APIs'
    };
    
    return suggestions[type] || 'Review and secure this reference';
  }

  /**
   * Generate report
   */
  generateReport() {
    const totalFindings = Object.values(this.findings).flat().length;
    
    if (this.options.json) {
      return JSON.stringify(this.findings, null, 2);
    }
    
    let report = '\n';
    report += '═══════════════════════════════════════════════════════════════\n';
    report += '   🔍 API SECURITY SCANNER - COMPREHENSIVE REPORT\n';
    report += '═══════════════════════════════════════════════════════════════\n\n';
    report += `📊 Total Findings: ${totalFindings}\n`;
    report += `🔴 Critical: ${this.findings.critical.length}\n`;
    report += `🟠 High: ${this.findings.high.length}\n`;
    report += `🟡 Medium: ${this.findings.medium.length}\n`;
    report += `🟢 Low: ${this.findings.low.length}\n`;
    report += `ℹ️  Info: ${this.findings.info.length}\n\n`;
    
    // Report by severity
    ['critical', 'high', 'medium', 'low', 'info'].forEach(severity => {
      const findings = this.findings[severity];
      
      if (findings.length > 0) {
        const icon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
          info: 'ℹ️'
        }[severity];
        
        report += `\n${icon} ${severity.toUpperCase()} SEVERITY (${findings.length})\n`;
        report += '─'.repeat(65) + '\n';
        
        findings.forEach((finding, idx) => {
          report += `\n[${idx + 1}] ${finding.type}\n`;
          report += `    File: ${finding.file}:${finding.line}\n`;
          report += `    Category: ${finding.category}\n`;
          report += `    Context: ${finding.context}\n`;
          
          if (this.options.fix) {
            report += `    💡 Suggestion: ${finding.suggestion}\n`;
          }
          
          if (this.options.detailed && finding.snippet) {
            report += `    Code Snippet:\n`;
            report += finding.snippet.split('\n').map(l => `      ${l}`).join('\n') + '\n';
          }
        });
      }
    });
    
    // Summary and recommendations
    report += '\n\n';
    report += '═══════════════════════════════════════════════════════════════\n';
    report += '   📋 RECOMMENDATIONS\n';
    report += '═══════════════════════════════════════════════════════════════\n\n';
    
    if (this.findings.critical.length > 0) {
      report += '🚨 CRITICAL ACTIONS REQUIRED:\n';
      report += '   1. Immediately revoke any exposed credentials\n';
      report += '   2. Rotate all API keys and secrets found\n';
      report += '   3. Implement AWS Secrets Manager for credentials\n';
      report += '   4. Add .env files to .gitignore\n';
      report += '   5. Run git history scan to remove past commits\n\n';
    }
    
    report += '✅ GENERAL BEST PRACTICES:\n';
    report += '   • Use environment variables for all sensitive data\n';
    report += '   • Implement backend API layer for database access\n';
    report += '   • Use HTTPS for all external API calls\n';
    report += '   • Add pre-commit hooks to scan for secrets\n';
    report += '   • Implement API key rotation policies\n';
    report += '   • Use AWS IAM roles instead of access keys\n';
    report += '   • Regular security audits with tools like Snyk, GitGuardian\n\n';
    
    if (totalFindings === 0) {
      report += '✨ No security issues found! Great job! ✨\n\n';
    }
    
    return report;
  }

  /**
   * Export findings to JSON file
   */
  exportFindings(filename = 'api-security-report.json') {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.values(this.findings).flat().length,
        critical: this.findings.critical.length,
        high: this.findings.high.length,
        medium: this.findings.medium.length,
        low: this.findings.low.length,
        info: this.findings.info.length
      },
      findings: this.findings
    };
    
    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Report exported to: ${filename}`);
  }

  /**
   * Run the security scan
   */
  async run() {
    console.log('🔍 Starting API Security Scan...\n');
    console.log(`📁 Scanning path: ${this.options.basePath}\n`);
    
    const scanPath = path.resolve(process.cwd(), this.options.basePath);
    
    if (!fs.existsSync(scanPath)) {
      console.error(`❌ Error: Path not found: ${scanPath}`);
      process.exit(1);
    }
    
    const files = this.scanDirectory(scanPath);
    console.log(`📄 Found ${files.length} files to analyze\n`);
    
    let analyzed = 0;
    for (const file of files) {
      this.analyzeFile(file);
      analyzed++;
      if (analyzed % 10 === 0) {
        process.stdout.write(`\rAnalyzing... ${analyzed}/${files.length} files`);
      }
    }
    
    console.log(`\r✅ Analyzed ${analyzed}/${files.length} files\n`);
    
    // Generate and display report
    const report = this.generateReport();
    console.log(report);
    
    // Export findings
    this.exportFindings('api-security-report.json');
    
    // Exit with error code if critical issues found
    if (this.findings.critical.length > 0) {
      console.log('⚠️  CRITICAL ISSUES DETECTED - Please address immediately!\n');
      process.exit(1);
    }
  }
}

// CLI Entry Point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    path: 'apps/frontend/dist',
    json: false,
    detailed: false,
    fix: false
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--path':
        options.path = args[++i];
        break;
      case '--json':
        options.json = true;
        break;
      case '--detailed':
        options.detailed = true;
        break;
      case '--fix':
        options.fix = true;
        break;
      case '--help':
      case '-h':
        console.log(`
API Security Scanner Agent

Usage: node agents/api-security-scanner-agent.js [options]

Options:
  --path <path>     Scan specific path (default: apps/frontend/dist)
  --json            Output results as JSON
  --detailed        Include code snippets in report
  --fix             Suggest fixes for found issues
  --help, -h        Show this help message

Examples:
  # Scan default path
  node agents/api-security-scanner-agent.js

  # Scan specific directory
  node agents/api-security-scanner-agent.js --path src/

  # Detailed report with fix suggestions
  node agents/api-security-scanner-agent.js --detailed --fix

  # Export as JSON
  node agents/api-security-scanner-agent.js --json > report.json
        `);
        process.exit(0);
    }
  }
  
  const scanner = new APISecurityScanner(options);
  scanner.run().catch(error => {
    console.error('❌ Scanner error:', error);
    process.exit(1);
  });
}

module.exports = APISecurityScanner;
