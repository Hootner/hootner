# 🔒 Security Commands Reference

## 🚀 Quick Security Audit

```bash
# Complete security audit
npm run security:audit

# Scan for hardcoded credentials
npm run security:scan

# Validate environment variables
npm run security:validate-env

# Generate secure secrets
npm run generate:secrets
```

## 🔍 Vulnerability Scanning

```bash
# NPM audit
npm audit
npm audit fix
npm audit fix --force

# Audit with detailed report
npm audit --audit-level moderate
npm audit --json > audit-report.json

# Snyk security scanning
npx snyk test
npx snyk monitor
npx snyk wizard  # Interactive fix
```

## 🔐 Credential & Secret Management

```bash
# Generate secure secrets
npm run generate:secrets

# Scan for hardcoded secrets
npm run security:scan
node scripts/security-scanner.js

# Validate environment setup
npm run security:validate-env
node scripts/validate-env.js

# Check for exposed credentials
grep -r "password\|secret\|key" --exclude-dir=node_modules .
grep -r "API_KEY\|SECRET" --exclude-dir=node_modules .
```

## 🛡️ Security Testing

```bash
# Run security test suite
node tests/security/security-suite.js

# Injection attack tests
node tests/security/injection-test.js
node tests/security/sql-injection-test.js
node tests/security/xss-test.js
node tests/security/csrf-test.js

# Authentication tests
node tests/security/auth-test.js
node tests/security/jwt-test.js
node tests/security/session-test.js

# Authorization tests
node tests/security/rbac-test.js
node tests/security/permission-test.js
```

## 🔒 Docker Security

```bash
# Scan Docker images
docker scan hootner-frontend
docker scan hootner-server

# Check for vulnerabilities in base images
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image hootner-frontend

# Security audit in containers
docker-compose exec web-hootner-app npm audit
docker-compose exec frontend npm audit

# Check container security
docker-compose exec web-hootner-app node scripts/security-audit.js
```

## 🌐 Web Security Headers

```bash
# Test security headers
curl -I http://localhost:5000
curl -I https://localhost:3000

# Check CSP (Content Security Policy)
curl -H "Accept: text/html" http://localhost:5000 | grep -i "content-security-policy"

# Test HTTPS configuration
openssl s_client -connect localhost:3000 -servername localhost

# SSL/TLS testing
nmap --script ssl-enum-ciphers -p 443 localhost
```

## 🔍 Code Security Analysis

```bash
# ESLint security rules
npm run lint:js -- --ext .js,.ts --config eslint.security.config.js

# Security-focused linting
npx eslint . --config eslint.security.config.js

# Static analysis security testing (SAST)
node scripts/advanced-code-scanner.js
node scripts/security-audit.js

# Check for unsafe patterns
grep -r "eval\|innerHTML\|document.write" --exclude-dir=node_modules src/
```

## 🔐 Authentication & Authorization

```bash
# Test JWT implementation
node tests/security/jwt-test.js

# Test Firebase auth
node tests/security/firebase-test.js

# Test session management
node tests/security/session-test.js

# Test password security
node tests/security/password-test.js

# Test rate limiting
node tests/security/rate-limit-test.js
```

## 🛡️ Input Validation & Sanitization

```bash
# Test input validation
node tests/security/validation-test.js

# Test XSS protection
node tests/security/xss-test.js

# Test SQL injection protection
node tests/security/sql-injection-test.js

# Test NoSQL injection protection
node tests/security/nosql-injection-test.js

# Test command injection protection
node tests/security/command-injection-test.js
```

## 🔒 Database Security

```bash
# MongoDB security check
docker-compose exec mongodb mongosh --eval "db.runCommand({connectionStatus: 1})"

# Redis security check
docker-compose exec redis redis-cli CONFIG GET "*"

# Test database connections
node tests/security/db-security-test.js

# Check for default credentials
node tests/security/default-creds-test.js
```

## 🌐 Network Security

```bash
# Port scanning
nmap -sS localhost
nmap -p 1-65535 localhost

# Check open ports
netstat -tulpn | grep LISTEN
ss -tulpn | grep LISTEN

# Test firewall rules
iptables -L
ufw status

# Network security testing
node tests/security/network-test.js
```

## 📊 Security Monitoring

```bash
# Start security monitoring
node services/security-service.js

# Check security logs
tail -f logs/security.log
grep "SECURITY" logs/app.log

# Monitor failed login attempts
grep "failed login" logs/auth.log

# Real-time security monitoring
node services/watcher-service.js
```

## 🔍 Compliance & Audit

```bash
# Generate compliance report
node services/compliance-reporter.js

# GDPR compliance check
node tests/compliance/gdpr-test.js

# SOC2 compliance check
node tests/compliance/soc2-test.js

# Security audit report
node scripts/security-audit.js > security-report.txt
```

## 🛡️ Penetration Testing

```bash
# Basic penetration testing
node tests/security/pentest-basic.js

# Web application security testing
node tests/security/web-app-test.js

# API security testing
node tests/security/api-security-test.js

# File upload security testing
node tests/security/upload-test.js
```

## 🔒 Encryption & Hashing

```bash
# Test encryption implementation
node tests/security/encryption-test.js

# Test password hashing
node tests/security/hash-test.js

# Test data encryption at rest
node tests/security/data-encryption-test.js

# Test TLS/SSL configuration
node tests/security/tls-test.js
```

## 🚨 Incident Response

```bash
# Security incident detection
node services/police-bot-service.js

# Emergency security lockdown
node scripts/emergency-lockdown.js

# Security breach response
node scripts/breach-response.js

# Forensic data collection
node scripts/forensic-collect.js
```

## 📋 Security Checklists

```bash
# Pre-deployment security check
node scripts/pre-deploy-security.js

# Security configuration validation
node scripts/security-config-check.js

# Security best practices audit
node scripts/security-best-practices.js

# Vulnerability assessment
node scripts/vulnerability-assessment.js
```

## 🔧 Security Tools Integration

```bash
# Integrate with security tools
npm install --save-dev snyk
npm install --save-dev eslint-plugin-security

# Setup security scanning in CI/CD
node scripts/setup-security-ci.js

# Configure security monitoring
node scripts/setup-security-monitoring.js
```

## 🔍 Security Environment Variables

```bash
# Required security environment variables
JWT_SECRET=<generate-secure-secret>
SERVICE_TOKEN=<generate-service-token>
MONGO_ROOT_PASSWORD=<secure-password>
REDIS_PASSWORD=<secure-password>
GRAFANA_ADMIN_PASSWORD=<secure-password>

# Generate all security secrets
npm run generate:secrets
```

## 🛡️ Security Middleware Testing

```bash
# Test security middleware
node tests/middleware/security-test.js
node tests/middleware/auth-test.js
node tests/middleware/csrf-test.js
node tests/middleware/rate-limit-test.js

# Test injection protection
node tests/middleware/injection-protection-test.js

# Test security headers
node tests/middleware/security-headers-test.js
```