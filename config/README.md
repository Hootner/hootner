# 🔧 Configuration Directory

This directory contains centralized configuration for the HOOTNER platform.

## Files

### `api-endpoints.js`
**Purpose:** Central API endpoint configuration module  
**Usage:** Import in all frontend pages and components  
**Status:** ✅ Production-ready

Single source of truth for all API endpoints across the platform. Supports multiple environments through environment variables with intelligent defaults.

```javascript
import { API_ENDPOINTS } from './config/api-endpoints.js';
const socket = io(API_ENDPOINTS.WS_URL);
```

### `API_CONFIG_GUIDE.md`
**Purpose:** Complete setup and migration guide  
**Audience:** Developers implementing the new configuration system  
**Status:** ✅ Documentation complete

Step-by-step guide for:
- Setting up environment variables
- Using the configuration module
- Migrating existing pages
- Deploying to different environments

## Quick Start

1. **Copy environment file:**
   ```bash
   cp ../.env.example ../.env
   ```

2. **Import configuration in your code:**
   ```javascript
   import { API_ENDPOINTS } from './config/api-endpoints.js';
   ```

3. **Use endpoints:**
   ```javascript
   fetch(`${API_ENDPOINTS.API_BASE}/users`);
   ```

## Environment Variables

All API endpoints can be configured via environment variables prefixed with `VITE_`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | http://localhost:4000 | Main REST API |
| `VITE_WS_URL` | ws://localhost:3005 | WebSocket server |
| `VITE_VIDEO_API` | http://localhost:5003 | Video services |
| `VITE_GRAPHQL_API` | http://localhost:4000/graphql | GraphQL endpoint |

See [API_CONFIG_GUIDE.md](API_CONFIG_GUIDE.md) for the complete list.

## Benefits

✅ **Single source of truth** - All endpoints in one place  
✅ **Environment flexibility** - Easy dev/staging/prod switching  
✅ **Type safety** - Centralized exports prevent typos  
✅ **Security** - No hardcoded production URLs in code  
✅ **Testability** - Easy to mock endpoints for testing  

## Migration Status

- ✅ Configuration module created
- ✅ Environment variables defined
- ✅ Deploy script updated
- ⏳ Dashboard pages migration (in progress)

## Related Files

- `../.env.example` - Development environment template
- `../.env.staging.example` - Staging environment template
- `../.env.production.example` - Production environment template
- `../deploy-dashboard.js` - Dashboard deployment script (uses env vars)

## Security Notes

⚠️ **Never commit:**
- `.env` files with actual credentials
- Production API URLs in source code
- AWS credentials or CloudFront IDs

✅ **Always use:**
- Environment variables for sensitive data
- Different credentials per environment
- HTTPS/WSS in production

---

For detailed setup instructions, see [API_CONFIG_GUIDE.md](API_CONFIG_GUIDE.md)
