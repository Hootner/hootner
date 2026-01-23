# 🛠️ Development Commands

## 🚀 Quick Start Development

```bash
# Install dependencies
npm install

# Start full development environment
npm run dev

# Start individual services
npm run dev:frontend    # Frontend only
npm run dev:api        # API only
npm run dev:hub        # Hub app
npm run dev:secure     # HTTPS server
npm run collab         # Collaboration server
```

## 📱 Frontend Development

```bash
# Navigate to frontend
cd apps/frontend

# Start Vite dev server
npm run dev

# Start hub application
npm run dev:hub

# Start secure HTTPS server
npm run dev:secure

# Build for production
npm run build

# Preview production build
npm run preview

# TypeScript compilation
npm run compile
```

## 🖥️ Server Development

```bash
# Navigate to server
cd apps/server

# Start with nodemon (auto-reload)
npm run dev

# Start production mode
npm start

# Build server
npm run build
```

## 🎬 Video Player Development

```bash
# Navigate to HTML pages
cd apps/frontend/html-pages

# Start video player server
node video-player-server.js

# Access at: http://localhost:3000/video-player.html
```

## 🤖 AI Services Development

```bash
# Setup AI video generation
npm run ai:setup

# Install video generation dependencies
npm run video:install

# Start video generation API
npm run video:start

# Run video generation example
npm run video:example

# Start all AI services
npm run services:start
```

## 🔧 Code Quality & Linting

```bash
# Run all linters
npm run lint

# Fix all lint issues
npm run lint:fix

# Advanced linting
npm run lint:all
npm run lint:all:fix

# Format code
npm run format
npm run format:check

# Specific linting
npm run lint:js         # JavaScript only
npm run lint:html       # HTML only
npm run lint:css        # CSS only
```

## 🧪 Testing During Development

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:frontend
npm run test:api
npm run test:chaos
npm run test:load
npm run test:smoke

# Frontend testing
cd apps/frontend && npm test

# Server testing
cd apps/server && npm test
```

## 📊 Development Analysis

```bash
# Analyze code duplication
npm run analyze:duplication

# Generate documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve  # http://localhost:8080

# Security scanning
npm run security:scan
npm run security:validate-env
```

## 🔄 Development Workflow Scripts

```bash
# Run custom development scripts
node scripts/lint-all.js
node scripts/code-scanner.js
node scripts/fix-code-quality.js
node scripts/setup-testing.js
node scripts/extract-constants.js
```

## 🐳 Docker Development

```bash
# Start Docker development environment
npm run docker:up
docker-compose -f docker-compose.dev.yml up

# Build development images
npm run docker:build

# Stop Docker environment
npm run docker:down

# View logs
docker-compose logs -f web-hootner-app
docker-compose logs -f frontend
```

## 🔍 Debugging Commands

```bash
# Debug with Node.js inspector
node --inspect server.js
node --inspect-brk server.js  # Break on start

# Debug frontend
cd apps/frontend
npm run dev  # Includes source maps

# Debug in Docker
docker-compose exec web-hootner-app bash
docker-compose exec frontend sh
```

## 🌐 Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Generate secure secrets
npm run generate:secrets

# Validate environment
npm run security:validate-env
```

## 📦 Package Management

```bash
# Install all dependencies
npm install

# Install frontend dependencies
cd apps/frontend && npm install

# Install server dependencies
cd apps/server && npm install

# Update dependencies
npm update
npm audit fix
```

## 🔧 Development Tools

```bash
# Start Electron app
npm start

# Package Electron app
npm run package

# Create installers
npm run make

# Start collaboration server
npm run collab
```

## 🏥 Health Checks

```bash
# Check application health
node healthcheck.js

# Check services in Docker
docker-compose exec web-hootner-app node healthcheck.js
docker-compose ps  # Service status
```

## 🔄 Hot Reload & Live Updates

```bash
# Frontend hot reload (automatic with Vite)
cd apps/frontend && npm run dev

# Server auto-reload (with nodemon)
cd apps/server && npm run dev

# Docker development with volumes
docker-compose -f docker-compose.dev.yml up
```

## 📝 Development Notes

### Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional)

### Port Usage

- 3000: Frontend dev server
- 5000: Main application
- 8080: Documentation server
- Various: Microservices (3001-3015)

### Environment Files

- `.env` - Main environment variables
- `apps/frontend/.env` - Frontend specific
- `.env.example` - Template file
