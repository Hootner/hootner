# 🔧 API Configuration Setup Guide

## Overview

All hardcoded localhost URLs have been replaced with a centralized configuration system that supports multiple environments (development, staging, production).

## Files Created/Updated

1. **`config/api-endpoints.js`** - Central API configuration module
2. **`deploy-dashboard.js`** - Updated to use environment variables
3. **`.env.example`** - Updated with all API endpoint variables

---

## Quick Start

### 1. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your favorite editor
```

### 2. Configure Required Variables

**For Local Development (Already set in .env.example):**
```bash
# Most variables default to localhost - no changes needed!
VITE_API_BASE=http://localhost:4000
VITE_WS_URL=ws://localhost:3005
```

**For AWS Deployment (REQUIRED):**
```bash
# Replace with your actual CloudFront distribution ID
CLOUDFRONT_DIST_ID=E1234ABCDEF567

# Replace with your S3 bucket name
AWS_S3_BUCKET=hootner-frontend
```

### 3. Using the Configuration Module

#### In Browser/Dashboard Pages (ES Modules):
```javascript
// Import the configuration
import { API_ENDPOINTS } from '/config/api-endpoints.js';

// Use in your code
fetch(`${API_ENDPOINTS.API_BASE}/users`)
  .then(res => res.json());

// WebSocket connections
const socket = io(API_ENDPOINTS.WS_URL);

// GraphQL
const client = new ApolloClient({
  uri: API_ENDPOINTS.GRAPHQL_API
});
```

#### In Node.js (CommonJS):
```javascript
const { API_ENDPOINTS } = require('./config/api-endpoints.js');

console.log('API Base:', API_ENDPOINTS.API_BASE);
```

---

## Environment-Specific Configuration

### Development (Local)
```bash
# .env.development
NODE_ENV=development
VITE_API_BASE=http://localhost:4000
VITE_WS_URL=ws://localhost:3005
VITE_VIDEO_API=http://localhost:5003
```

### Staging
```bash
# .env.staging
NODE_ENV=staging
VITE_API_BASE=https://api-staging.hootner.com
VITE_WS_URL=wss://ws-staging.hootner.com
VITE_VIDEO_API=https://video-staging.hootner.com
CLOUDFRONT_DIST_ID=E1234STAGING567
AWS_S3_BUCKET=hootner-frontend-staging
```

### Production
```bash
# .env.production
NODE_ENV=production
VITE_API_BASE=https://api.hootner.com
VITE_WS_URL=wss://ws.hootner.com
VITE_VIDEO_API=https://video.hootner.com
CLOUDFRONT_DIST_ID=E1234PRODUCTION567
AWS_S3_BUCKET=hootner-frontend-prod
CLOUDFRONT_URL=https://cdn.hootner.com
```

---

## Deploying Dashboard

### Before (Old Way - INSECURE):
```bash
node deploy-dashboard.js  # Used hardcoded CloudFront ID
```

### After (New Way - SECURE):
```bash
# Set environment variables first
export CLOUDFRONT_DIST_ID=E1234ABCDEF567
export AWS_S3_BUCKET=hootner-frontend
export AWS_REGION=us-east-1

# Then deploy
node deploy-dashboard.js
```

Or using .env file:
```bash
# Make sure .env has CLOUDFRONT_DIST_ID set
node -r dotenv/config deploy-dashboard.js
```

---

## Available API Endpoints

| Endpoint Variable | Default (Development) | Description |
|------------------|----------------------|-------------|
| `API_BASE` | http://localhost:4000 | Main REST API |
| `WS_URL` | ws://localhost:3005 | Main WebSocket |
| `GRAPHQL_API` | http://localhost:4000/graphql | GraphQL endpoint |
| `GRAPHQL_WS` | ws://localhost:4000/graphql | GraphQL subscriptions |
| `VIDEO_API` | http://localhost:5003 | Video generation API |
| `VIDEO_PLAYER_API` | http://localhost:3000 | Video player API |
| `ANALYTICS_API` | http://localhost:5003/api/analytics | Analytics API |
| `WATCH_PARTY_WS` | ws://localhost:5004 | Watch party WebSocket |
| `LSP_JAVASCRIPT` | ws://localhost:3001/lsp/javascript | JavaScript LSP |
| `LSP_TYPESCRIPT` | ws://localhost:3001/lsp/typescript | TypeScript LSP |
| `LSP_PYTHON` | ws://localhost:3001/lsp/python | Python LSP |
| `LSP_JAVA` | ws://localhost:3001/lsp/java | Java LSP |
| `LSP_CPP` | ws://localhost:3001/lsp/cpp | C++ LSP |
| `MESSAGES_API` | http://localhost:4000/api/messages | Messaging API |
| `MARKETPLACE_API` | http://localhost:4000/api/marketplace | Marketplace API |
| `CONTACT_API` | http://localhost:4000/api/contact | Contact form API |

---

## Validation

The configuration module automatically validates required endpoints on startup:

```javascript
import { validateEndpoints } from '/config/api-endpoints.js';

// Call this in your app initialization
validateEndpoints();
// ✅ API endpoints configured: { API_BASE: '...', WS_URL: '...', ... }
```

---

## Migration Guide for Existing Pages

### Example: Updating dashboard.html

**Before:**
```javascript
socket = io('http://localhost:3005', {
  transports: ['websocket', 'polling']
});
```

**After:**
```javascript
import { API_ENDPOINTS } from '/config/api-endpoints.js';

socket = io(API_ENDPOINTS.WS_URL, {
  transports: ['websocket', 'polling']
});
```

### Pages That Need Migration:

1. ✅ `dashboard.html` - WebSocket (Line 3330)
2. ⏳ `ai-video.html` - Video API (Lines 627, 1070)
3. ⏳ `contact.html` - Contact API (Line 535)
4. ⏳ `video-player.html` - Multiple APIs (Lines 6335, 7525-7527)
5. ⏳ `feed-react.html` - All APIs (Lines 130-133)
6. ⏳ `code-editor.html` - LSP services (Lines 1005-1007)
7. ⏳ `messages.html` - Messages API (Lines 240, 264)
8. ⏳ `marketplace.html` - Marketplace API (Line 127)
9. ⏳ `analytics.html` - WebSocket (Line 90)
10. ⏳ `live-stream.html` - WebSocket (Line 143)
11. ⏳ `live-activity.html` - APIs (Lines 278-279)
12. ⏳ `login.html` - Redirect URLs (Lines 640, 682)
13. ⏳ `manifest.json` - Service URLs (Lines 96-98)
14. ⏳ `cinema-player.html` - APIs (Lines 1176-1177)
15. ⏳ `electron-code-editor/*` - LSP services

---

## Build System Integration

### Vite
```javascript
// vite.config.js
export default {
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE),
    'import.meta.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL),
    // ... other variables
  }
};
```

### Webpack
```javascript
// webpack.config.js
plugins: [
  new webpack.DefinePlugin({
    'process.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE),
    'process.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL),
  })
]
```

---

## Testing Different Environments

```bash
# Test with development config
npm run dev

# Test with staging config
NODE_ENV=staging npm run dev

# Test with production config (locally)
NODE_ENV=production npm run build
npm run preview
```

---

## Security Best Practices

✅ **DO:**
- Keep `.env` file in `.gitignore`
- Use different credentials for each environment
- Rotate `CLOUDFRONT_DIST_ID` if exposed
- Use environment variables in CI/CD

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode production URLs in source code
- Share `.env` files in chat/email
- Use production credentials in development

---

## Troubleshooting

### Error: "Missing required API endpoints"
**Solution:** Check that your `.env` file has the required variables set.

### Error: "CLOUDFRONT_DIST_ID environment variable is required"
**Solution:** 
```bash
export CLOUDFRONT_DIST_ID=E1234ABCDEF567
# Or add to .env file
```

### WebSocket connection fails
**Solution:** Check that `VITE_WS_URL` matches your WebSocket server:
```bash
# Development
VITE_WS_URL=ws://localhost:3005

# Production (use wss:// for secure)
VITE_WS_URL=wss://ws.hootner.com
```

### API calls return 404
**Solution:** Verify `VITE_API_BASE` points to the correct server:
```bash
# Check in browser console
console.log(API_ENDPOINTS.API_BASE);
```

---

## Next Steps

1. ✅ Configuration module created
2. ✅ deploy-dashboard.js updated with environment variables
3. ✅ .env.example updated with all endpoints
4. ⏳ **TODO:** Migrate all 15+ dashboard pages to use the new configuration
5. ⏳ **TODO:** Test in staging environment
6. ⏳ **TODO:** Deploy to production

---

## Support

For questions or issues:
1. Check this guide first
2. Review [DASHBOARD_SECURITY_SCAN_REPORT.md](../DASHBOARD_SECURITY_SCAN_REPORT.md)
3. Check the [API endpoints module](api-endpoints.js) source code
4. Open an issue on GitHub

---

**Last Updated:** January 25, 2026  
**Version:** 1.0.0  
**Status:** ✅ Core configuration complete, page migration in progress
