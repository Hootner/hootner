#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

const CONFIG = {
  extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.py'],
  ignoreDirs: [
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
    '.next',
    '__pycache__',
    '.pytest_cache',
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  checks: {
    syntax: true,
    security: true,
    quality: true,
    dependencies: true,
    linting: true,
    tests: true,
  },
};

class CodeScanner {
  constructor(rootDir, config = CONFIG) {
    // Validate rootDir before resolution
    if (!rootDir || typeof rootDir !== 'string') {
      throw new Error('Root directory must be a non-empty string');
    }
    try {
      if (rootDir.includes('\0') || /[;&|`$()]/.test(rootDir)) {
        throw new Error('Invalid root directory path: contains unsafe characters');
      }
      this.rootDir = path.resolve(rootDir);
    } catch (e) {
      throw new Error(`Failed to initialize scanner: ${e.message}`);
    }
    this.config = config;
    this.errors = new Map();
    this.warnings = new Map();
    this.stats = { filesScanned: 0, errors: 0, warnings: 0 };
    this.report = '';

    // Pre-create extension sets and regex cache for performance
    this.jsExtensions = new Set(['.js', '.jsx']);
    this.tsExtensions = new Set(['.ts', '.tsx']);
    this.jstsExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
    this.extensionsSet = new Set(config.extensions);
    this.regexCache = new Map();
  }

  scan() {
    try {
      this.scanDirectory(this.rootDir);
      if (this.config.checks.dependencies) {
        this.checkDependencies();
      }
    } catch (e) {
      this.addError(this.rootDir, `Critical scan failure: ${e.message}`);
    }
    return this.generateReport();
  }

  scanDirectory(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      this.addError(dir, `Directory read error: ${e.message}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Secure path traversal check using path.relative
      const rel = path.relative(this.rootDir, fullPath);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        continue;
      }

      if (entry.isDirectory() && !this.config.ignoreDirs.includes(entry.name)) {
        try {
          this.scanDirectory(fullPath);
        } catch (e) {
          this.addError(fullPath, `Directory scan error: ${e.message}`);
        }
      } else {
        const ext = path.extname(entry.name);
        if (this.extensionsSet.has(ext)) {
          this.scanFile(fullPath);
        }
      }
    }
  }

  scanFile(filePath) {
    // Secure path traversal check using path.relative
    const normalizedPath = path.resolve(filePath);
    const rel = path.relative(this.rootDir, normalizedPath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      this.addError(filePath, 'Path traversal attempt detected');
      return;
    }

    this.stats.filesScanned++;

    // Check file size before reading
    let stats;
    try {
      stats = fs.statSync(normalizedPath);
      if (stats.size > this.config.maxFileSize) {
        this.addWarning(
          filePath,
          `File too large to scan (>${this.config.maxFileSize / (1024 * 1024)}MB)`
        );
        return;
      }
    } catch (e) {
      this.addError(filePath, `File stat error: ${e.message}`);
      return;
    }

    let content;
    try {
      content = fs.readFileSync(normalizedPath, 'utf8');
    } catch (e) {
      const errorMsg = e.message || 'Unknown error';
      if (e.code === 'ENOENT') {
        this.addError(filePath, `File not found: ${errorMsg}`);
      } else if (e.code === 'EACCES' || e.code === 'EPERM') {
        this.addError(filePath, `Permission denied: ${errorMsg}`);
      } else {
        this.addError(filePath, `File read error: ${errorMsg}`);
      }
      return;
    }
    const ext = path.extname(filePath);

    // Syntax checks
    if (this.config.checks.syntax) {
      if (ext === '.json') {
        this.checkJSONSyntax(filePath, content);
      } else if (ext === '.py') {
        this.checkPythonSyntax(filePath, normalizedPath);
      }
    }

    // Security checks
    if (this.config.checks.security) {
      this.checkSecurity(filePath, content, ext);
    }

    // Quality checks
    if (this.config.checks.quality) {
      this.checkQuality(filePath, content, ext);
    }

    // Linting checks disabled - use external linting tools
    // Test checks
    if (this.config.checks.tests && this.isTestFile(filePath)) {
      this.checkTests(filePath, content, ext);
    }
  }

  checkJSONSyntax(filePath, content) {
    try {
      JSON.parse(content);
    } catch (e) {
      this.addError(filePath, `Invalid JSON: ${e.message}`);
    }
  }

  checkPythonSyntax(filePath, normalizedPath) {
    try {
      execSync(`python3 -m py_compile "${normalizedPath}"`, { stdio: 'ignore', timeout: 30000 });
    } catch (e) {
      this.addError(
        filePath,
        `Python syntax error: ${(e.stderr && e.stderr.toString()) || e.message}`
      );
    }
  }

  findPatternMatches(content, regex, msg, callback) {
    try {
      const cacheKey = `${regex.source}:${regex.flags}`;
      let globalRegex = this.regexCache.get(cacheKey);
      if (!globalRegex) {
        globalRegex = new RegExp(
          regex.source,
          regex.flags.includes('g') ? regex.flags : regex.flags + 'g'
        );
        this.regexCache.set(cacheKey, globalRegex);
      }
      globalRegex.lastIndex = 0; // Reset lastIndex for global regex
      let match;
      while ((match = globalRegex.exec(content)) !== null) {
        const start = match.index;
        const line = content.substring(0, start).split(/\r?\n/).length;
        callback(`${msg} at line ${line}`, match);
        // Defensive: avoid infinite loop on zero-width matches
        if (globalRegex.lastIndex === match.index) globalRegex.lastIndex++;
      }
    } catch (e) {
      this.addError('RegexError', `Regex pattern error: ${e.message}`);
    }
  }

  checkSecurity(filePath, content, ext) {
    const commonPatterns = [
      {
        regex:
          /(?:password|secret|token|privateKey|accessKey|clientSecret|authToken)\s*[=:]\s*['"][^'"]+['"]/i,
        msg: 'Hardcoded credential detected',
      },
      {
        regex: /['"](password|apiKey|token|secret)['"]\s*:\s*['"][^'"]+['"]/i,
        msg: 'Hardcoded credential in object',
      },
    ];
    const jsPatterns = [
      {
        regex: /innerHTML\s*[+=]\s*(?![^;]*DOMPurify\.sanitize\([^)]*\))/,
        msg: 'Potential XSS via innerHTML',
      },
      { regex: /outerHTML\s*[+=]/, msg: 'Potential XSS via outerHTML' },
      { regex: /insertAdjacentHTML\s*\(/, msg: 'Potential XSS via insertAdjacentHTML' },
      { regex: /document\.write(ln)?\s*\(/, msg: 'Potential XSS via document.write' },
      { regex: /eval\s*\([^)]*(?:req\.|user|input|params)/, msg: 'Dangerous eval with user input' },
      {
        regex: /(?:SELECT|INSERT|UPDATE|DELETE).*\+.*(?:req\.|params\.|user|input)/i,
        msg: 'Potential SQL injection via concatenation',
      },
      {
        regex: /`(?:SELECT|INSERT|UPDATE|DELETE).*\$\{[^}]+\}/i,
        msg: 'Potential SQL injection via template literal',
      },
      { regex: /setTimeout\s*\(\s*['"]/, msg: 'setTimeout with string - use function' },
      { regex: /createHash\s*\(\s*['"](md5|sha1)['"]\s*\)/i, msg: 'Weak hash algorithm (MD5/SHA1) - use stronger like SHA-256' },
      { regex: /localStorage\.setItem\s*\(\s*['"](token|password|key|secret)['"]/i, msg: 'Storing sensitive data in localStorage - consider more secure storage' },
    ];
    const pyPatterns = [
      { regex: /os\.system\s*\(/, msg: 'Potential command injection via os.system' },
      { regex: /subprocess\.call\s*\(/, msg: 'Potential command injection via subprocess.call' },
      { regex: /exec\s*\(/, msg: 'Dangerous exec() usage' },
      { regex: /pickle\.loads?\(/, msg: 'Unsafe pickle load - use safer alternative' },
      { regex: /yaml\.load\(/, msg: 'Unsafe yaml.load - use yaml.safe_load' },
      { regex: /hashlib\.(md5|sha1)\(/i, msg: 'Weak hash algorithm (MD5/SHA1) - use stronger like SHA-256' },
    ];

    const patterns = [...commonPatterns];
    if (this.jstsExtensions.has(ext)) {
      patterns.push(...jsPatterns);
    } else if (ext === '.py') {
      patterns.push(...pyPatterns);
    }

    patterns.forEach(({ regex, msg }) => {
      this.findPatternMatches(content, regex, `Security: ${msg}`, detail =>
        this.addError(filePath, detail)
      );
    });
  }

  checkQuality(filePath, content, ext) {
    if (!this.jstsExtensions.has(ext)) {
      return;
    }

    // Skip quality checks on scanner/fix scripts to avoid false positives
    if (filePath.includes('scanner') || filePath.includes('fix-')) {
      return;
    }

    const jsPatterns = [
      { regex: /\bvar\s+/, msg: 'Use const/let instead of var' },
      { regex: /([^=!<>])==([^=])/, msg: 'Use === instead of ==' },
      { regex: /([^!])!=([^=])/, msg: 'Use !== instead of !=' },
      { regex: /console\.log\(/, msg: 'Remove console.log before production' },
      { regex: /\.then\(\)/, msg: 'Empty then() - missing handler' },
      { regex: /\.catch\(\)/, msg: 'Empty catch() - missing error handler' },
      { regex: /function\s*\([^)]*\)\s*\{\s*\}/, msg: 'Empty function body' },
      { regex: /if\s*\([^)]+\)\s*;/, msg: 'Empty if statement' },
      { regex: /else\s*;/, msg: 'Empty else statement' },
      { regex: /\bdelete\s+\w+\.prototype/, msg: 'Dangerous prototype deletion' },
      { regex: /with\s*\(/, msg: 'Avoid with statement' },
      { regex: /arguments\.callee/, msg: 'Deprecated arguments.callee' },
      { regex: /new\s+Function\s*\(/, msg: 'Avoid Function constructor' },
      { regex: /\/\*\s*eslint-disable\s*\*\//, msg: 'ESLint disabled - review necessity' },
      { regex: /\/\/\s*@ts-ignore/, msg: 'TypeScript error ignored - fix instead' },
      { regex: /TODO|FIXME|HACK|XXX/, msg: 'Code comment requires attention' },
    ];

    jsPatterns.forEach(({ regex, msg }) => {
      this.findPatternMatches(content, regex, msg, detail => this.addWarning(filePath, detail));
    });

    this.checkUnusedVariables(filePath, content);
    this.checkErrorHandling(filePath, content);
    this.checkComplexity(filePath, content);
    this.checkMagicNumbers(filePath, content);
    this.checkNamingConventions(filePath, content);
    this.checkCodeSmells(filePath, content);
  }

  checkComplexity(filePath, content) {
    const complexityKeywords = /(if|else if|for|while|do|switch|case|\?|\&&|\|\|)/g;
    const matches = content.match(complexityKeywords) || [];
    if (matches.length > 20) {
      this.addWarning(
        filePath,
        `High complexity: ${matches.length} control structures - consider refactoring`
      );
    }
  }

  checkMagicNumbers(filePath, content) {
    const lines = content.split('\n');
    const commonLegitimate = new Set([100, 200, 201, 204, 400, 401, 403, 404, 500, 1000, 1024, 2048, 3000, 4096, 5000, 8192, 10000, 60000]);
    lines.forEach((line, idx) => {
      const magicNumberPattern = /(?<!\d)([1-9]\d{2,})(?!\d)/g;
      const matches = line.match(magicNumberPattern);
      if (
        matches &&
        !line.trim().startsWith('//') &&
        !line.includes('const') &&
        !line.includes('let')
      ) {
        matches.forEach(num => {
          const numVal = Number.parseInt(num);
          const isPowerOf2 = numVal > 0 && (numVal & (numVal - 1)) === 0;
          const isMultipleOf100 = numVal % 100 === 0;
          if (numVal > 100 && !line.includes('0x') && !commonLegitimate.has(numVal) && !isPowerOf2 && !isMultipleOf100) {
            this.addWarning(
              filePath,
              `Magic number ${num} at line ${idx + 1} - use named constant`
            );
          }
        });
      }
    });
  }

  checkNamingConventions(filePath, content) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const singleLetterVar = /(?:const|let|var)\s+([a-hln-z])\s*=/;
      const match = line.match(singleLetterVar);
      if (match) {
        this.addWarning(
          filePath,
          `Single letter variable '${match[1]}' at line ${idx + 1} - use descriptive name`
        );
      }

      if (line.includes('function') || line.includes('const') || line.includes('let')) {
        const snakeCase = /\b([a-z]+_[a-z_]+)\b/;
        const snakeMatch = line.match(snakeCase);
        if (snakeMatch && !line.includes('_test') && !line.includes('_spec')) {
          this.addWarning(
            filePath,
            `Use camelCase instead of snake_case for '${snakeMatch[1]}' at line ${idx + 1}`
          );
        }
      }
    });
  }

  checkCodeSmells(filePath, content) {
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const funcMatch = line.match(/function\s+\w+\s*\(([^)]+)\)/);
      if (funcMatch) {
        const params = funcMatch[1].split(',').filter(p => p.trim());
        if (params.length > 5) {
          this.addWarning(
            filePath,
            `Function has ${params.length} parameters at line ${idx + 1} - use object parameter`
          );
        }
      }
    });

    this.findPatternMatches(
      content,
      /\?[^:;\n}]+:[^;]+\?/g,
      'Nested ternary operator - hard to read',
      detail => this.addWarning(filePath, detail)
    );

    lines.forEach((line, idx) => {
      if (/\/\/\s*(const|let|var|function|if|for|while)\s/.test(line)) {
        this.addWarning(filePath, `Commented out code at line ${idx + 1} - remove if not needed`);
      }
    });
  }

  checkUnusedVariables(filePath, content) {
    const lines = content.split('\n');
    const varPattern = /(?:const|let|var)\s+(\w+)\s*=/g;
    const declared = new Set();

    let match;
    while ((match = varPattern.exec(content)) !== null) {
      const varName = match[1];
      if (varName.startsWith('_')) {
        continue;
      } // Skip intentionally unused
      declared.add(varName);
    }

    declared.forEach(varName => {
      const usagePattern = new RegExp(String.raw`\b${varName}\b`, 'g');
      const matches = content.match(usagePattern) || [];
      if (matches.length === 1) {
        this.addWarning(filePath, `Variable '${varName}' is declared but never used`);
      }
    });
  }

  checkErrorHandling(filePath, content) {
    const lines = content.split('\n');
    this._checkTryCatchPatterns(filePath, content);
    this._checkPromiseHandling(filePath, content);
    this._checkAsyncFunctions(filePath);
    this._checkHTTPRequests(filePath, content);
    this._checkJSONParsing(filePath);
    this._checkEventListeners(filePath, content);
    this._checkCallbackErrors(filePath);
  }

  _checkTryCatchPatterns(filePath, content) {
    this.findPatternMatches(
      content,
      /try\s*\{[^}]*\}\s*finally/g,
      'Try block without catch - errors will be silently ignored',
      detail => this.addError(filePath, detail)
    );
    this.findPatternMatches(
      content,
      /catch\s*\([^)]*\)\s*\{\s*\}/g,
      'Empty catch block - handle errors properly',
      detail => this.addError(filePath, detail)
    );
    this.findPatternMatches(
      content,
      /catch\s*\([^)]*\)\s*\{\s*console\.(log|error)\([^)]*\);?\s*\}/g,
      'Catch block only logs - handle errors properly',
      detail => this.addWarning(filePath, detail)
    );
  }

  _checkPromiseHandling(filePath, content) {
    if (content.includes('.then(') && !content.includes('.catch(')) {
      this.addWarning(filePath, 'Possible unhandled Promise rejection - add .catch');
    }
  }

  _checkAsyncFunctions(filePath) {
    lines.forEach((line, idx) => {
      if (
        line.includes('await ') &&
        !lines
          .slice(Math.max(0, idx - 5), idx + 6)
          .some(l => l.includes('try') || l.includes('catch'))
      ) {
        this.addWarning(
          filePath,
          `await without nearby try-catch at line ${idx + 1} - ensure error handling`
        );
      }
    });
  }

  _checkHTTPRequests(filePath, content) {
    if (
      (content.includes('fetch(') || content.includes('axios.')) &&
      !content.includes('.catch(')
    ) {
      this.addWarning(filePath, 'Possible unhandled HTTP request error - add .catch or try-catch');
    }
  }

  _checkJSONParsing(filePath) {
    lines.forEach((line, idx) => {
      if (line.includes('JSON.parse(')) {
        const prevLines = lines.slice(Math.max(0, idx - 2), idx).join('\n');
        const nextLines = lines.slice(idx, idx + 3).join('\n');
        if (!prevLines.includes('try') && !nextLines.includes('catch')) {
          this.addWarning(filePath, `JSON.parse without try-catch at line ${idx + 1}`);
        }
      }
    });
  }

  _checkEventListeners(filePath, content) {
    this.findPatternMatches(
      content,
      /addEventListener\([^,]+,\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{[^}]*\}\s*\)/g,
      'Event listener without error handling',
      detail => this.addWarning(filePath, detail)
    );
  }

  _checkCallbackErrors(filePath) {
    lines.forEach((line, idx) => {
      if (line.match(/function\s*\(err,/) || line.match(/\(\s*err,\s*/)) {
        const nextLines = lines.slice(idx, idx + 10).join('\n');
        if (!nextLines.includes('if (err') && !nextLines.includes('if(err')) {
          this.addWarning(filePath, `Callback with err parameter but no check at line ${idx + 1}`);
        }
      }
    });
  }

  _checkJSTests(filePath, content) {
    try {
      return {
        hasTests:
          /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filePath) ||
          content.includes('describe(') ||
          content.includes('it('),
        hasAssertions: (content.match(/expect\(|assert\(/g) || []).length > 0,
        hasSkipped: /\.(only|skip)\s*\(/.test(content),
      };
    } catch (e) {
      this.addError(filePath, `Test analysis error: ${e.message}`);
      return { hasTests: false, hasAssertions: false, hasSkipped: false };
    }
  }

  _checkPyTests(content) {
    try {
      return {
        hasTests:
          /^\s*def\s+test_/m.test(content) ||
          content.includes('import pytest') ||
          content.includes('@pytest.'),
        hasAssertions: (content.match(/assert\s+|self\.assert/g) || []).length > 0,
        hasSkipped: content.includes('@pytest.mark.skip'),
      };
    } catch (e) {
      this.addWarning('_checkPyTests', `Test analysis error: ${e.message}`);
      return { hasTests: false, hasAssertions: false, hasSkipped: false };
    }
  }

  _reportTestIssues(filePath, { hasTests, hasAssertions, hasSkipped }) {
    if (!hasTests) {
      this.addWarning(filePath, 'Test file has no test cases');
    }
    if (hasSkipped) {
      this.addWarning(filePath, 'Test has skipped or focused tests - remove before commit');
    }
    if (!hasAssertions) {
      this.addWarning(filePath, 'Test file has no assertions');
    }
  }

  checkTests(filePath, content, ext) {
    let results;
    if (this.jstsExtensions.has(ext)) {
      results = this._checkJSTests(filePath, content);
    } else if (ext === '.py') {
      results = this._checkPyTests(content);
    } else {
      results = null;
    }
    if (results) {
      this._reportTestIssues(filePath, results);
    }
  }

  checkDependencies() {
    if (!fs.existsSync(this.rootDir)) {
      return;
    }
    this._checkNpmDependencies();
    this._checkPythonDependencies();
  }

  _checkNpmDependencies() {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }
    this._checkNpmAudit(packageJsonPath);
    this._checkNpmOutdated(packageJsonPath);
  }

  _checkNpmAudit(packageJsonPath) {
    let auditOutput = '';
    try {
      auditOutput = execSync('npm audit --json', {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000,
      }).toString();
    } catch (e) {
      auditOutput = e.stdout?.toString() || '';
      if (e.stderr) {
        this.addWarning(packageJsonPath, `npm audit warning: ${e.stderr.toString()}`);
      }
    }
    if (auditOutput.trim()) {
      try {
        const audit = JSON.parse(auditOutput);
        if (audit.metadata && audit.metadata.vulnerabilities) {
          const vulns = audit.metadata.vulnerabilities;
          const total = vulns.info + vulns.low + vulns.moderate + vulns.high + vulns.critical;
          if (total > 0) {
            const msg = `Dependencies vulnerabilities: critical: ${vulns.critical || 0}, high: ${vulns.high || 0}, moderate: ${vulns.moderate || 0}, low: ${vulns.low || 0}, info: ${vulns.info || 0}`;
            this.addError(packageJsonPath, msg);
          }
        }
      } catch (parseError) {
        this.addError(packageJsonPath, `Failed to parse npm audit output: ${parseError.message}`);
      }
    }
  }

  _checkNpmOutdated(packageJsonPath) {
    let outdatedOutput = '';
    try {
      outdatedOutput = execSync('npm outdated --json', {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000,
      }).toString();
    } catch (e) {
      outdatedOutput = e.stdout?.toString() || '{}';
      if (e.stderr) {
        this.addWarning(packageJsonPath, `npm outdated warning: ${e.stderr.toString()}`);
      }
    }
    try {
      const outdated = JSON.parse(outdatedOutput || '{}');
      Object.entries(outdated).forEach(([pkg, info]) => {
        if (info && info.current !== info.latest) {
          this.addWarning(
            packageJsonPath,
            `Outdated package: ${pkg} (current: ${info.current}, latest: ${info.latest})`
          );
        }
      });
    } catch (parseError) {
      this.addError(packageJsonPath, `Failed to parse npm outdated output: ${parseError.message}`);
    }
  }

  _checkPythonDependencies() {
    const reqPath = path.join(this.rootDir, 'requirements.txt');
    if (!fs.existsSync(reqPath)) {
      return;
    }
    try {
      const outdated = execSync('pip3 list --outdated --format=freeze', {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000,
      }).toString();
      if (outdated.trim()) {
        const outdatedList = outdated.trim().split('\n').filter(Boolean);
        outdatedList.forEach(pkg => {
          if (pkg) {
            this.addWarning(reqPath, `Outdated Python package: ${pkg}`);
          }
        });
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        // pip3 not found, skip silently
      } else if (e.killed) {
        this.addWarning(reqPath, 'pip list timed out');
      } else {
        this.addWarning(reqPath, `pip list error: ${e.message}`);
      }
    }
  }

  _addIssue(file, message, issueMap, statKey) {
    if (!file || typeof file !== 'string' || typeof message !== 'string' || !message) {
      return;
    }
    const relFile = path.relative(this.rootDir, file);
    if (!issueMap.has(relFile)) {
      issueMap.set(relFile, []);
    }
    issueMap.get(relFile).push(message);
    this.stats[statKey]++;
  }

  addError(file, message) {
    this._addIssue(file, message, this.errors, 'errors');
  }

  addWarning(file, message) {
    this._addIssue(file, message, this.warnings, 'warnings');
  }

  isTestFile(filePath) {
    // Use relative path for test file detection
    const relPath = path.relative(this.rootDir, filePath);
    const testPatterns = [
      /\.test\.(js|ts|jsx|tsx)$/,
      /\.spec\.(js|ts|jsx|tsx)$/,
      /test_.*\.py$/,
      /__tests__/,
    ];
    return testPatterns.some(pattern => pattern.test(relPath));
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    let report = `CODE SCAN REPORT\n${'='.repeat(80)}\n`;
    report += `Timestamp: ${timestamp}\n`;
    report += `Directory: ${this.rootDir}\n`;
    report += `Files Scanned: ${this.stats.filesScanned}\n`;
    report += `Errors: ${this.stats.errors}\n`;
    report += `Warnings: ${this.stats.warnings}\n`;
    report += `${'='.repeat(80)}\n\n`;

    const sortedErrors = [...this.errors.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    if (sortedErrors.length > 0) {
      report += `ERRORS (${this.stats.errors}):\n${'-'.repeat(80)}\n`;
      sortedErrors.forEach(([file, messages]) => {
        report += `📛 ${file}\n`;
        messages.forEach(msg => {
          report += `   ${msg}\n`;
        });
        report += '\n';
      });
    }

    const sortedWarnings = [...this.warnings.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    if (sortedWarnings.length > 0) {
      report += `WARNINGS (${this.stats.warnings}):\n${'-'.repeat(80)}\n`;
      sortedWarnings.forEach(([file, messages]) => {
        report += `⚠️  ${file}\n`;
        messages.forEach(msg => {
          report += `   ${msg}\n`;
        });
        report += '\n';
      });
    }

    if (this.stats.errors === 0 && this.stats.warnings === 0) {
      report += '✅ No issues found!\n';
    }

    this.report = report;

    const outputFile = path.join(this.rootDir, 'code-scan-report.txt');
    try {
      fs.writeFileSync(outputFile, report);
    } catch (e) {
      this.addError(this.rootDir, `Failed to write report file: ${e.message}`);
    }

    return { errors: this.errors, warnings: this.warnings, stats: this.stats };
  }
}

const isMain = process.argv[1] === __filename;
if (isMain) {
  let dir = process.cwd();
  const checksOverrides = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--no-')) {
      const checkName = arg.slice(5);
      if (checkName in CONFIG.checks) {
        checksOverrides[checkName] = false;
      }
    } else if (!arg.startsWith('--')) {
      dir = arg;
    }
  }

  const config = {
    ...CONFIG,
    checks: { ...CONFIG.checks, ...checksOverrides },
  };

  try {
    const scanner = new CodeScanner(dir, config);
    scanner.scan();
    console.log(scanner.report);
    process.exit(scanner.stats.errors > 0 ? 1 : 0);
  } catch (e) {
    console.error('Fatal error: ', e.message);
    process.exit(2);
  }
}

export default CodeScanner;
