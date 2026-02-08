# 🧪 Testing Commands Reference

## 🚀 Quick Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:frontend
npm run test:api
npm run test:chaos
npm run test:load
npm run test:smoke
```

## 🎯 Test Categories

### Frontend Tests

```bash
# Navigate to frontend
cd apps/frontend

# Run frontend tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test files
npm test -- video-player.test.js
npm test -- components/
```

### API Tests

```bash
# Navigate to API
cd api/graphql

# Run API tests
npm test

# Run integration tests
npm run test:integration

# Run unit tests
npm run test:unit
```

### Server Tests

```bash
# Navigate to server
cd apps/server

# Run server tests
npm test

# Test specific endpoints
npm test -- auth.test.js
npm test -- upload.test.js
```

## 🌪️ Chaos Engineering Tests

```bash
# Run chaos monkey (random failures)
npm run test:chaos
node tests/chaos/chaos-monkey.js

# Load testing
npm run test:load
node tests/chaos/load-test.js

# Spike testing (sudden traffic)
node tests/chaos/spike-test.js

# Recovery testing
node tests/chaos/recovery-test.js

# Game day (full system chaos)
node tests/chaos/game-day.js

# Circuit breaker testing
node tests/chaos/circuit-breaker-test.js

# Dependency testing
node tests/chaos/dependency-test.js
```

## 🔥 Load & Performance Tests

```bash
# Basic load test
npm run test:load

# Spike test (traffic bursts)
node tests/chaos/spike-test.js

# Stress test (gradual increase)
node tests/performance/stress-test.js

# Volume test (large data)
node tests/performance/volume-test.js

# Endurance test (long duration)
node tests/performance/endurance-test.js
```

## 💨 Smoke Tests

Smoke tests are designed to quickly validate critical functionality. They run in two contexts:

### Pre-Push Context (Local Development)
```bash
# Quick smoke tests (skips if servers not running)
npm run test:smoke
```

When run locally during pre-push checks, smoke tests will automatically skip if the servers are not running. This is expected behavior and allows developers to push code without starting all services.

### Deployment Context
```bash
# Full smoke tests for deployment validation
npm run test:smoke:deployment

# Or run directly with version
node scripts/smoke-test.js v1.0.0
```

During deployment, smoke tests verify that deployed services are healthy by checking:
- Main API health endpoint: `http://localhost:3000/api/health`
- GraphQL API endpoint: `http://localhost:4000/graphql`

### Environment Variables
- `SKIP_SMOKE_IF_NO_SERVER=true` - Skip tests if servers are not running (used in pre-push)
- `DEPLOYMENT_CONTEXT=true` - Force tests to run and fail if servers unavailable

### Testing the Smoke Test
```bash
# Test the smoke test script itself
node scripts/test-smoke-test.js
```

## 🔒 Security Tests

```bash
# Security audit
npm run security:audit

# Vulnerability scan
npm audit

# Dependency security check
npm audit fix

# Custom security tests
node tests/security/injection-test.js
node tests/security/auth-test.js
node tests/security/xss-test.js
```

## 🐳 Docker Testing

```bash
# Test in Docker environment
docker-compose -f docker-compose.test.yml up

# Run tests in containers
docker-compose exec web-hootner-app npm test
docker-compose exec frontend npm test

# Integration tests with Docker
docker-compose run test-runner npm run test:integration
```

## 🌐 End-to-End Tests

```bash
# Run E2E tests with Playwright
npx playwright test

# Run specific E2E test
npx playwright test feed.spec.cjs

# Run with UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

## 📊 Test Coverage

```bash
# Generate coverage report
npm test -- --coverage

# Frontend coverage
cd apps/frontend && npm test -- --coverage

# API coverage
cd api/graphql && npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 🔧 Test Configuration

### Jest Configuration

```bash
# Run with specific config
npm test -- --config jest.config.js

# Run in watch mode
npm test -- --watch

# Run changed files only
npm test -- --onlyChanged
```

### Playwright Configuration

```bash
# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run headed mode
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## 🎮 Interactive Testing

```bash
# Jest watch mode
npm test -- --watch

# Playwright debug mode
npx playwright test --debug

# Manual testing server
npm run dev  # Start dev server for manual testing
```

## 📝 Test Scripts in Scripts Directory

```bash
# Setup testing environment
node scripts/setup-testing.js

# Run quality tests
node scripts/fix-code-quality.js

# Syntax validation
node scripts/fix-syntax-errors.js

# Code scanning
node scripts/code-scanner.js
```

## 🏥 Health & Monitoring Tests

```bash
# Application health check
node healthcheck.js

# Service health tests
curl http://localhost:5000/health
curl http://localhost:3000/health

# Database connectivity
node tests/db-connection-test.js

# Redis connectivity
node tests/redis-connection-test.js
```

## 🔄 Continuous Testing

```bash
# Watch mode for continuous testing
npm test -- --watch

# File watcher for specific tests
npm test -- --watchAll

# Auto-run on file changes
nodemon --exec "npm test" --watch src/
```

## 📋 Test Environment Setup

```bash
# Setup test database
npm run test:setup

# Seed test data
npm run test:seed

# Clean test environment
npm run test:clean

# Reset test state
npm run test:reset
```

## 🎯 Specific Test Commands

### Video Player Tests

```bash
cd apps/frontend/html-pages
node test-video-player.js
```

### Authentication Tests

```bash
node tests/auth/jwt-test.js
node tests/auth/firebase-test.js
```

### Database Tests

```bash
node tests/db/mongodb-test.js
node tests/db/redis-test.js
```

### API Tests

```bash
node tests/api/graphql-test.js
node tests/api/rest-test.js
```

## 📊 Test Reporting

```bash
# Generate test reports
npm test -- --reporters=default,jest-junit

# HTML test report
npm test -- --reporters=jest-html-reporter

# Coverage report
npm test -- --coverage --coverageReporters=html,text,lcov

# Playwright report
npx playwright show-report
```

## 🔍 Debugging Tests

```bash
# Debug Jest tests
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug Playwright tests
npx playwright test --debug

# Verbose test output
npm test -- --verbose

# Test with logs
npm test -- --silent=false
```

## ⚡ Performance Testing

```bash
# Lighthouse performance audit
npm run lighthouse

# Bundle size analysis
npm run analyze:bundle

# Memory leak detection
node --inspect tests/memory-leak-test.js

# CPU profiling
node --prof tests/cpu-profile-test.js
```
