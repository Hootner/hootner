#!/usr/bin/env node

/**
 * Security Audit Script
 * Scans codebase for common security vulnerabilities
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = []
    this.scannedFiles = 0
    this.patterns = {
      // XSS vulnerabilities
      xss: [
        /innerHTML\s*=\s*[^;]+/g,
        /document\.write\s*\(/g,
        /eval\s*\(/g,
        /setTimeout\s*\(\s*['"]/g,
        /setInterval\s*\(\s*['"]/g,
      ],

      // SQL Injection
      sqlInjection: [
        /query\s*\(\s*['"]\s*SELECT.*\+/gi,
        /query\s*\(\s*['"]\s*INSERT.*\+/gi,
        /query\s*\(\s*['"]\s*UPDATE.*\+/gi,
        /query\s*\(\s*['"]\s*DELETE.*\+/gi,
      ],

      // CSRF vulnerabilities
      csrf: [
        /app\.use\s*\(\s*express\.json\s*\(\s*\)\s*\)/g,
        /app\.post\s*\([^)]+\)\s*,\s*(?!.*csrf)/g,
      ],

      // Insecure random
      insecureRandom: [/(?<!crypto\.)Math\.random\s*\(\s*\)/g],

      // Hardcoded secrets
      hardcodedSecrets: [
        /password\s*[:=]\s*['"]\w+['"]/gi,
        /secret\s*[:=]\s*['"]\w+['"]/gi,
        /api[_-]?key\s*[:=]\s*['"]\w+['"]/gi,
        /token\s*[:=]\s*['"]\w+['"]/gi,
      ],

      // Directory traversal
      directoryTraversal: [
        /\.\.[\/\\]/g,
        /path\.join\s*\([^)]*\.\./g,
        /fs\.readFile\s*\([^)]*\.\./g,
      ],

      // Command injection
      commandInjection: [
        /exec\s*\(\s*[^)]*\+/g,
        /spawn\s*\(\s*[^)]*\+/g,
        /execSync\s*\(\s*[^)]*\+/g,
      ],
    }
  }

  async scanDirectory(dirPath) {
    console.log(`🔍 Starting security audit of: ${dirPath}\n`)

    await this.scanRecursive(dirPath)

    this.generateReport()
  }

  async scanRecursive(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanRecursive(fullPath)
        }
      } else if (entry.isFile()) {
        // Only scan relevant file types
        const ext = path.extname(entry.name)
        if (['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext)) {
          await this.scanFile(fullPath)
        }
      }
    }
  }

  async scanFile(filePath) {
    try {
      // Validate file path to prevent directory traversal
      const resolvedPath = path.resolve(filePath)
      if (!resolvedPath.startsWith(path.resolve(process.cwd()))) {
        throw new Error('Invalid file path detected')
      }

      const content = fs.readFileSync(resolvedPath, 'utf8')
      this.scannedFiles++

      // Scan for each vulnerability type
      for (const [vulnType, patterns] of Object.entries(this.patterns)) {
        for (const pattern of patterns) {
          const matches = content.match(pattern)
          if (matches) {
            matches.forEach((match) => {
              this.vulnerabilities.push({
                type: vulnType,
                file: filePath,
                match: match.trim(),
                line: this.getLineNumber(content, match),
                severity: this.getSeverity(vulnType),
              })
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message)
    }
  }

  getLineNumber(content, match) {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1
      }
    }
    return 1
  }

  getSeverity(vulnType) {
    const severityMap = {
      xss: 'High',
      sqlInjection: 'Critical',
      csrf: 'High',
      insecureRandom: 'Medium',
      hardcodedSecrets: 'Critical',
      directoryTraversal: 'High',
      commandInjection: 'Critical',
    }
    return severityMap[vulnType] || 'Medium'
  }

  generateReport() {
    console.log('🛡️  SECURITY AUDIT REPORT')
    console.log('='.repeat(50))
    console.log(`Files scanned: ${this.scannedFiles}`)
    console.log(`Vulnerabilities found: ${this.vulnerabilities.length}\n`)

    if (this.vulnerabilities.length === 0) {
      console.log('✅ No security vulnerabilities detected!')
      return
    }

    // Group by severity
    const bySeverity = this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = acc[vuln.severity] || []
      acc[vuln.severity].push(vuln)
      return acc
    }, {})

    // Display by severity
    ;['Critical', 'High', 'Medium', 'Low'].forEach((severity) => {
      if (bySeverity[severity]) {
        console.log(
          `\n🚨 ${severity.toUpperCase()} SEVERITY (${bySeverity[severity].length})`
        )
        console.log('-'.repeat(30))

        bySeverity[severity].forEach((vuln) => {
          console.log(`📁 ${path.relative(process.cwd(), vuln.file)}:${vuln.line}`)
          console.log(`   Type: ${vuln.type}`)
          console.log(`   Code: ${vuln.match}`)
          console.log(`   Fix: ${this.getSuggestion(vuln.type)}\n`)
        })
      }
    })

    this.generateFixScript()
  }

  getSuggestion(vulnType) {
    const suggestions = {
      xss: 'Use XSS sanitization library (xss) or escape HTML entities',
      sqlInjection: 'Use parameterized queries or ORM with prepared statements',
      csrf: 'Add CSRF protection middleware (csurf)',
      insecureRandom: 'Use crypto.randomBytes() for cryptographic randomness',
      hardcodedSecrets: 'Move secrets to environment variables or secure vault',
      directoryTraversal: 'Validate and sanitize file paths, use path.resolve()',
      commandInjection: 'Validate input and use safe alternatives to exec()',
    }
    return suggestions[vulnType] || 'Review code for security implications'
  }

  generateFixScript() {
    console.log('\n🔧 AUTOMATED FIXES')
    console.log('='.repeat(30))

    const fixes = {
      csrf: 'npm install csurf && add CSRF middleware',
      xss: 'npm install xss && sanitize user inputs',
      insecureRandom: 'Replace Math.random() with crypto.randomBytes()',
      hardcodedSecrets: 'Move secrets to .env file',
    }

    const neededFixes = [...new Set(this.vulnerabilities.map((v) => v.type))]

    if (neededFixes.length > 0) {
      console.log('Run these commands to fix common issues:\n')

      neededFixes.forEach((fix) => {
        if (fixes[fix]) {
          console.log(`• ${fixes[fix]}`)
        }
      })

      console.log('\n📋 Security checklist:')
      console.log('□ Install security dependencies (helmet, xss, csurf)')
      console.log('□ Add input validation and sanitization')
      console.log('□ Implement proper authentication and authorization')
      console.log('□ Use HTTPS in production')
      console.log('□ Set up proper CORS configuration')
      console.log('□ Add rate limiting')
      console.log('□ Regular security audits and dependency updates')
    }
  }
}

// Run the audit
const auditor = new SecurityAuditor()
const targetDir = process.argv[2] || process.cwd()

auditor.scanDirectory(targetDir).catch(console.error)
