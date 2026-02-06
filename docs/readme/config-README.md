# Configuration Module

Centralized configuration management for HOOTNER platform.

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

## Usage

```javascript
import { HTTP_STATUS, TIMEOUTS, LIMITS } from './config/index.js';

// HTTP Status Codes
res.status(HTTP_STATUS.OK).json({ data });

// Timeouts for DynamoDB/Lambda
setTimeout(callback, TIMEOUTS.LAMBDA_TIMEOUT);

// AWS Limits
if (payload.length > LIMITS.LAMBDA_PAYLOAD_SIZE) {
  throw new Error('Payload too large');
}
```

## Configuration Files

- `api-endpoints.js` - API endpoint configurations
- `jest.config.js` - Test configuration
- `playwright.config.js` - E2E test configuration
- `validate-config.js` - Environment validation
- `timeouts.js` - AWS service timeouts

## Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
TABLE_NAME=HootnerActivities

# API Configuration
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...

# Development
NODE_ENV=development
PORT=4000
```
