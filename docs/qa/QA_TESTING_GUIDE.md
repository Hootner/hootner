# QA Testing Guide

## Overview
Comprehensive testing procedures for HOOTNER platform deployment.

## Testing Pyramid

```
        /\
       /E2E\          10% - End-to-End Tests
      /------\
     /Integration\    20% - Integration Tests
    /------------\
   /    Unit      \   70% - Unit Tests
  /----------------\
```

## Pre-Deployment Checklist

### 1. Automated Tests
- [ ] All unit tests passing (`npm test`)
- [ ] Integration tests passing (`npm run test:integration`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] Security tests passing (`npm run test:security`)
- [ ] Performance tests passing (`npm run test:performance`)

### 2. Security Audit
- [ ] Run security scan (`npm run security:audit`)
- [ ] No critical vulnerabilities
- [ ] No high-severity vulnerabilities
- [ ] Dependency audit clean
- [ ] OWASP Top 10 checks passed
- [ ] Penetration testing completed

### 3. Compliance Checks
- [ ] GDPR compliance verified
- [ ] SOC2 controls implemented
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] Cookie consent implemented
- [ ] Data retention policies active
- [ ] Audit logging enabled

### 4. Performance Testing
- [ ] Load testing completed (target: 1000 concurrent users)
- [ ] Stress testing completed
- [ ] API response times < 500ms
- [ ] Database query optimization verified
- [ ] CDN configuration tested
- [ ] Caching strategy validated

### 5. Infrastructure
- [ ] Docker containers healthy
- [ ] Kubernetes deployments ready
- [ ] Database backups configured
- [ ] Monitoring dashboards active
- [ ] Alert rules configured
- [ ] SSL certificates valid
- [ ] DNS configuration correct

### 6. Data Integrity
- [ ] Database migrations tested
- [ ] Backup/restore tested
- [ ] Data validation rules active
- [ ] PITR (Point-in-Time Recovery) tested
- [ ] Multi-region sync verified

## Testing Procedures

### Unit Testing
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Coverage Requirements:**
- Minimum 80% code coverage
- Critical paths: 100% coverage
- Business logic: 95% coverage

### Integration Testing
```bash
# Run integration tests
npm run test:integration

# Test specific service
npm run test:integration -- --grep "payment"
```

**Test Scenarios:**
- API endpoint integration
- Database operations
- External service integration (Stripe, AWS)
- Message queue processing
- Cache invalidation

### E2E Testing
```bash
# Run E2E tests
npm run test:e2e

# Run specific browser
npm run test:e2e -- --project=chromium

# Debug mode
npm run test:e2e -- --debug
```

**Critical User Flows:**
1. User registration → Email verification → Login
2. Video upload → Processing → Playback
3. Subscription purchase → Payment → Access granted
4. Content moderation → Review → Approval/Rejection
5. Data export request → Processing → Download

### Security Testing
```bash
# Run security test suite
npm run test:security

# Run specific security tests
npm run test:security -- --grep "injection"
```

**Security Test Categories:**
- Authentication & Authorization
- Injection attacks (SQL, NoSQL, XSS, Command)
- CSRF protection
- Session management
- File upload security
- API security
- Data exposure prevention

### Performance Testing
```bash
# Run load tests
npm run test:performance

# Custom load test
k6 run --vus 100 --duration 30s load-test.js
```

**Performance Metrics:**
- Response time: p95 < 500ms, p99 < 1000ms
- Throughput: > 1000 req/s
- Error rate: < 0.1%
- CPU usage: < 70%
- Memory usage: < 80%

## Manual Testing Checklist

### Functional Testing
- [ ] User registration and login
- [ ] Password reset flow
- [ ] Video upload (various formats)
- [ ] Video playback (all resolutions)
- [ ] Search functionality
- [ ] Social features (like, comment, share)
- [ ] Payment processing
- [ ] Subscription management
- [ ] Profile management
- [ ] Notifications

### UI/UX Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Loading states
- [ ] Error messages
- [ ] Form validation
- [ ] Navigation flow

### Browser Compatibility
| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | ✓      |
| Firefox | Latest  | ✓      |
| Safari  | Latest  | ✓      |
| Edge    | Latest  | ✓      |

### Device Testing
| Device Type | Resolutions | Status |
|-------------|-------------|--------|
| Mobile      | 375x667     | ✓      |
| Tablet      | 768x1024    | ✓      |
| Desktop     | 1920x1080   | ✓      |
| 4K          | 3840x2160   | ✓      |

## Deployment Testing

### Staging Environment
```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:smoke

# Verify deployment
npm run verify:staging
```

**Smoke Test Checklist:**
- [ ] Application starts successfully
- [ ] Health check endpoints responding
- [ ] Database connectivity
- [ ] Redis connectivity
- [ ] External API connectivity
- [ ] File upload/download
- [ ] Authentication working

### Production Deployment
```bash
# Blue-green deployment
./scripts/deployment/blue-green-deploy.sh

# Monitor deployment
npm run monitor:deployment

# Rollback if needed
./scripts/deployment/rollback.sh
```

**Post-Deployment Verification:**
- [ ] All services healthy
- [ ] No error spikes in logs
- [ ] Response times normal
- [ ] Database connections stable
- [ ] CDN serving content
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured

## Regression Testing

### After Each Release
- [ ] Run full test suite
- [ ] Verify critical user flows
- [ ] Check for performance degradation
- [ ] Review error logs
- [ ] Validate new features
- [ ] Confirm bug fixes

### Automated Regression Suite
```bash
# Run regression tests
npm run test:regression

# Generate report
npm run test:report
```

## Bug Reporting Template

```markdown
## Bug Report

**Title:** [Clear, concise description]

**Severity:** Critical | High | Medium | Low

**Environment:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Version: [1.0.0]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach screenshots]

**Logs:**
```
[Paste relevant logs]
```

**Additional Context:**
[Any other relevant information]
```

## Test Data Management

### Test Users
```javascript
const testUsers = {
  admin: { email: 'admin@test.com', password: 'Admin123!' },
  user: { email: 'user@test.com', password: 'User123!' },
  premium: { email: 'premium@test.com', password: 'Premium123!' }
};
```

### Test Videos
- Small: 1MB, 10s duration
- Medium: 50MB, 5min duration
- Large: 500MB, 30min duration
- 4K: 2GB, 10min duration

### Test Payments
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0027 6000 3184

## Monitoring & Alerts

### Key Metrics to Monitor
- Error rate
- Response time (p50, p95, p99)
- Request rate
- CPU/Memory usage
- Database connections
- Queue depth
- Cache hit rate

### Alert Thresholds
- Error rate > 1%: Warning
- Error rate > 5%: Critical
- Response time p95 > 1s: Warning
- Response time p95 > 2s: Critical
- CPU > 80%: Warning
- Memory > 90%: Critical

## Compliance Testing

### GDPR Compliance
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Consent management
- [ ] Privacy policy accessible
- [ ] Cookie banner displayed
- [ ] Data retention enforced

### SOC2 Compliance
- [ ] Access controls tested
- [ ] Audit logging verified
- [ ] Encryption validated
- [ ] Backup procedures tested
- [ ] Incident response tested
- [ ] Change management followed

## Performance Benchmarks

### API Endpoints
| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| GET /api/videos | 50ms | 200ms | 500ms |
| POST /api/upload | 100ms | 500ms | 1000ms |
| GET /api/users/me | 20ms | 100ms | 200ms |

### Database Queries
| Query Type | Target | Actual |
|------------|--------|--------|
| Simple SELECT | < 10ms | 5ms |
| JOIN queries | < 50ms | 30ms |
| Aggregations | < 100ms | 80ms |

## Test Automation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Security scan
        run: npm run security:audit
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### Scheduled Tests
- Unit tests: On every commit
- Integration tests: On every PR
- E2E tests: Daily at 2 AM
- Security scan: Weekly
- Performance tests: Before each release

## Documentation

### Test Documentation
- Test plans in `/docs/qa/`
- Test cases in `/tests/`
- Bug reports in GitHub Issues
- Test reports in `/tests/reports/`

### Knowledge Base
- Common issues and solutions
- Testing best practices
- Tool documentation
- Troubleshooting guides

## Contact

**QA Team Lead:** qa@hootner.com
**Security Team:** security@hootner.com
**DevOps Team:** devops@hootner.com

---

**Last Updated:** [DATE]
**Version:** 1.0
