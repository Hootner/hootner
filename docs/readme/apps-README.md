# Hootner Apps

This directory contains all frontend applications for the Hootner social media platform.

## Applications

### 🎯 Main Frontend (`frontend/`)

- **Technology**: React 18 + TypeScript + Vite
- **Port**: 5173 (dev), 3000 (video player)
- **Features**:
  - 18 standalone HTML pages (video-player, dashboard, social-feed, marketplace, analytics, code-editor, etc.)
  - React components with Apollo GraphQL
  - PWA with offline support
  - Service Worker for caching
  - Web Audio API effects
  - Firebase authentication
- **Commands**:
  - `npm run dev` - Vite dev server
  - `npm run dev:secure` - HTTPS server
  - `cd html-pages && node video-player-server.js` - Video player

## Development

### Start Frontend

```bash
cd apps/frontend

# Vite dev server
npm run dev

# Secure HTTPS server
npm run dev:secure

# Video player (standalone)
cd html-pages
node video-player-server.js
```

## Architecture

The frontend connects to:

- **GraphQL API** (NestJS with Apollo)
- **10+ Microservices** (audit, backup, marketplace, payment, security, etc.)
- **Firebase Authentication** + JWT
- **MongoDB + Redis** with Prisma ORM
- **AWS S3** for storage
- **Socket.io** for real-time features

## Frontend Features

### 🎬 Video Player (Jukebox Style)

- ✅ Carousel navigation with vinyl record animations
- ✅ Touch/swipe support for mobile
- ✅ Web Audio API effects (reverb, delay, distortion)
- ✅ Offline caching via Service Worker
- ✅ PWA installable with manifest.json
- ✅ Upload/Download functionality
- ✅ Native Share API integration

### 📄 18 HTML Pages

- ✅ Landing page, Video player, Dashboard
- ✅ Social feed, Marketplace, Analytics
- ✅ Code editor, Moderation, Messages
- ✅ Profile, Search, Settings
- ✅ And 6 more specialized pages

### ⚛️ React Components

- ✅ Apollo GraphQL integration
- ✅ Firebase authentication
- ✅ Real-time features with Socket.io
- ✅ State management with hooks
- ✅ Responsive design

## Security

All applications implement:

- 🛡️ CSRF protection
- 🛡️ XSS prevention
- 🛡️ Path traversal protection
- 🛡️ Input validation
- 🛡️ Rate limiting
- 🛡️ Security headers

## Deployment

Each application can be deployed independently:

```bash
# Build all applications
npm run build

# Docker deployment
docker-compose up -d

# AWS deployment
npm run agent:deploy
```
