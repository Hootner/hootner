# 🚀 Quick Reference - API Configuration

## 30-Second Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Set CloudFront ID (for deployments)
echo "CLOUDFRONT_DIST_ID=E1234567890ABC" >> .env

# 3. Import in your code
import { API_ENDPOINTS } from './config/api-endpoints.js';

# 4. Use it!
fetch(`${API_ENDPOINTS.API_BASE}/users`);
```

---

## Common Patterns

### REST API Call
```javascript
import { API_ENDPOINTS } from './config/api-endpoints.js';

fetch(`${API_ENDPOINTS.API_BASE}/users`)
  .then(res => res.json())
  .then(data => console.log(data));
```

### WebSocket Connection
```javascript
import { API_ENDPOINTS } from './config/api-endpoints.js';

const socket = io(API_ENDPOINTS.WS_URL, {
  transports: ['websocket', 'polling']
});
```

### GraphQL
```javascript
import { API_ENDPOINTS } from './config/api-endpoints.js';

const client = new ApolloClient({
  uri: API_ENDPOINTS.GRAPHQL_API,
  link: new WebSocketLink({ uri: API_ENDPOINTS.GRAPHQL_WS })
});
```

### Video API
```javascript
import { API_ENDPOINTS } from './config/api-endpoints.js';

const response = await fetch(`${API_ENDPOINTS.VIDEO_API}/generate`, {
  method: 'POST',
  body: JSON.stringify({ prompt: 'A cat playing piano' })
});
```

---

## Environment Variables Cheat Sheet

| Variable | Local Default | Production Example |
|----------|---------------|-------------------|
| `VITE_API_BASE` | http://localhost:4000 | https://api.hootner.com |
| `VITE_WS_URL` | ws://localhost:3005 | wss://ws.hootner.com |
| `VITE_VIDEO_API` | http://localhost:5003 | https://video.hootner.com |
| `CLOUDFRONT_DIST_ID` | *(none)* | E1234567890ABC |

**See full list:** `.env.example`

---

## Deployment Commands

### Local
```bash
npm run dev
```

### Staging
```bash
export NODE_ENV=staging
# Set staging env vars in .env.staging
node deploy-dashboard.js
```

### Production
```bash
export NODE_ENV=production
export CLOUDFRONT_DIST_ID=E1234567890ABC
export AWS_S3_BUCKET=hootner-frontend-prod
node deploy-dashboard.js
```

---

## Troubleshooting

### ❌ "Missing required API endpoints"
```bash
# Check .env file exists
ls -la .env

# Verify required vars are set
cat .env | grep VITE_API_BASE
```

### ❌ "CLOUDFRONT_DIST_ID environment variable is required"
```bash
# Add to .env
echo "CLOUDFRONT_DIST_ID=E1234567890ABC" >> .env

# Or export inline
export CLOUDFRONT_DIST_ID=E1234567890ABC
```

### ❌ WebSocket connection fails
```javascript
// Check URL in console
import { API_ENDPOINTS } from './config/api-endpoints.js';
console.log('WS URL:', API_ENDPOINTS.WS_URL);

// Common issue: http instead of ws
// Should be: ws://localhost:3005 (not http://)
```

---

## Migration Quick Guide

**Replace this:**
```javascript
socket = io('http://localhost:3005');
fetch('http://localhost:4000/api/users');
const ws = new WebSocket('ws://localhost:4000/graphql');
```

**With this:**
```javascript
import { API_ENDPOINTS } from './config/api-endpoints.js';

socket = io(API_ENDPOINTS.WS_URL);
fetch(`${API_ENDPOINTS.API_BASE}/api/users`);
const ws = new WebSocket(API_ENDPOINTS.GRAPHQL_WS);
```

---

## Available Endpoints

- `API_BASE` - Main REST API
- `WS_URL` - Main WebSocket
- `GRAPHQL_API` - GraphQL HTTP
- `GRAPHQL_WS` - GraphQL WebSocket
- `VIDEO_API` - Video generation
- `VIDEO_PLAYER_API` - Video player
- `ANALYTICS_API` - Analytics
- `WATCH_PARTY_WS` - Watch party
- `LSP_*` - Code editor LSP (JavaScript, TypeScript, Python, Java, C++)
- `MESSAGES_API` - Messaging
- `MARKETPLACE_API` - Marketplace
- `CONTACT_API` - Contact forms

---

## Links

- **Setup Guide:** [config/API_CONFIG_GUIDE.md](API_CONFIG_GUIDE.md)
- **Config README:** [config/README.md](README.md)
- **Security Report:** [../DASHBOARD_SECURITY_SCAN_REPORT.md](../DASHBOARD_SECURITY_SCAN_REPORT.md)
- **Source Code:** [config/api-endpoints.js](api-endpoints.js)

---

**Pro Tip:** Add this to your shell profile for quick access:
```bash
alias hootner-config="cat .env | grep VITE_"
alias hootner-deploy="export CLOUDFRONT_DIST_ID=\$(grep CLOUDFRONT_DIST_ID .env | cut -d '=' -f2) && node deploy-dashboard.js"
```
