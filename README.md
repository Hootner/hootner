# 🦉 HOOTNER - The Owl Never Sleeps

## Ultimate Video Player & Social Platform

A full-stack, enterprise-grade video streaming platform with PWA capabilities, real-time features, and comprehensive DevOps infrastructure.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start video player
cd apps/frontend/html-pages
node video-player-server.js
```

---

## 📁 Project Structure

(")
Hootner/
├── apps/
│   └── frontend/              # React + Vite frontend
│       ├── html-pages/        # Standalone HTML pages (18 pages)
│       │   ├── video-player.html
│       │   ├── dashboard.html
│       │   ├── social-feed.html
│       │   ├── marketplace.html
│       │   ├── analytics.html
│       │   ├── code-editor.html
│       │   └── ...
│       ├── src/               # React components & features
│       │   ├── components/
│       │   ├── features/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── store/
│       │   └── services/
│       ├── public/            # Static assets
│       ├── ssl/               # SSL certificates
│       └── tests/             # Frontend tests
├── api/
│   ├── graphql/               # GraphQL API (NestJS)
│   │   ├── src/
│   │   │   ├── resolvers/
│   │   │   ├── middleware/
│   │   │   ├── monitoring/
│   │   │   └── versioning/
│   │   └── schema.graphql
│   └── sdks/
│       └── go/                # Go SDK client
├── services/                  # Microservices
│   ├── audit-service.js
│   ├── backup-service.js
│   ├── backup-monitoring-service.js
│   ├── marketplace-service.js
│   ├── payment-service.js
│   ├── security-service.js
│   ├── content-moderation-service.js
│   ├── search-service.js
│   ├── watcher-service.js
│   └── police-bot-service.js
├── infrastructure/            # Infrastructure as Code
│   ├── k8s/
│   ├── services/
│   │   ├── auth/              # Auth microservice
│   │   ├── analytics/
│   │   ├── event-processor/
│   │   └── shared/            # Shared utilities
│   ├── traefik/
│   └── scripts/
├── k8s/                       # Kubernetes deployments
│   ├── istio/                 # Service mesh configs
│   ├── deployment.yaml
│   ├── blue-green-deployment.yaml
│   ├── chaos-experiments.yaml
│   └── backup-cronjob.yaml
├── scripts/                   # Automation scripts
│   ├── backup-all.sh
│   ├── blue-green-deploy.sh
│   ├── chaos-test.js
│   ├── security-audit.js
│   ├── multi-region-sync.sh
│   └── pitr-backup.sh
├── tests/
│   └── chaos/                 # Chaos engineering tests
│       ├── chaos-monkey.js
│       ├── load-test.js
│       ├── spike-test.js
│       └── game-day.js
├── middleware/                # Express middleware
│   ├── chaos.js
│   ├── rate-limiter.js
│   ├── metrics.js
│   └── csp.js
├── lib/                       # Shared libraries
│   ├── circuit-breaker.js
│   ├── retry.js
│   ├── bulkhead.js
│   └── graceful-shutdown.js
├── grafana/                   # Monitoring dashboards
│   ├── dashboards/
│   └── datasources/
├── prisma/                    # Database ORM
│   └── schema.prisma
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_SCHEMA.md
│   ├── CHAOS_ENGINEERING.md
│   ├── BACKUP_STRATEGY.md
│   └── STRIPE_INTEGRATION.md
└── .github/
    └── workflows/             # CI/CD pipelines (24 workflows)

## ✨ Features

### 🎬 Video Player

- **Jukebox-style carousel** with vinyl record animations
- **Touch/swipe navigation** for mobile
- **Web Audio API effects** (reverb, delay, distortion)
- **Offline caching** via Service Worker
- **PWA installable** with manifest.json
- **Upload/Download** functionality
- **Share API** integration

### 🌐 Frontend (18 HTML Pages)

- **Landing Page** - Marketing homepage
- **Video Player** - Enhanced jukebox player
- **Dashboard** - Admin control panel
- **Social Feed** - User posts & interactions
- **Marketplace** - Digital goods store
- **Analytics** - Real-time metrics
- **Code Editor** - In-browser IDE with Cursor-style AI modes
- **Moderation** - Content review tools
- **Messages** - Real-time chat
- **Profile** - User management
- **Search** - Advanced filtering
- **Settings** - Configuration panel

### 🤖 AI-First Editing (Cursor-Style)

- **Chat Mode (Ctrl+K)** - Conversational AI assistance
- **Write Mode (Ctrl+L)** - Full code generation
- **Refactor Mode** - Intelligent transformations
- **Modernize Mode** - Legacy to TypeScript 7
- **Deep Context** - Project-wide awareness
- **Multi-Agent** - Parallel task execution

### ⚡ Speed & Collaboration (Zed-Inspired)

- **Fast Startup** - <100ms with lazy loading
- **Real-time Collab** - WebSocket multi-user editing
- **AI Conflict Resolution** - Automatic merge handling
- **Minimalist Design** - Load only what's needed
- **Performance Monitoring** - Built-in metrics

### 🎨 Visual Designer & Debug (2025)

- **Visual UI Designer** - Drag-and-drop prototyping
- **AI Snooze** - Control suggestion noise
- **Integrated Breakpoints** - Terminal debugging
- **Session Logging** - Compliance audit trail

### 🌱 Sustainability & Compliance (2025)

- **Energy Tracking** - Power consumption monitoring
- **AI Ethics Audits** - Automated compliance checks
- **GDPR/SOC2** - Multi-standard support
- **Auto-Reporting** - Generate compliance reports

### 🔐 Security

- JWT authentication with Firebase
- Helmet.js security headers
- Rate limiting per IP
- CORS protection
- Content Security Policy (CSP)
- DOMPurify for XSS prevention
- Snyk security scanning
- Safe comparison utilities
- Session management

### 🏗️ Infrastructure

- **Docker** multi-stage builds (7 Dockerfiles)
- **Kubernetes** orchestration with Istio service mesh
- **Blue-Green deployments** with automated rollback
- **Chaos engineering** with 8 test scenarios
- **Prometheus + Grafana** monitoring
- **Automated backups** with PITR (Point-in-Time Recovery)
- **Multi-region sync** for disaster recovery
- **CI/CD** with 24 GitHub Actions workflows

### 💳 Integrations

- Stripe payment processing
- GraphQL API with Apollo Client
- MongoDB + Redis with Prisma ORM
- AWS S3 for storage
- Firebase authentication
- Socket.io for real-time features

---

## 🎮 Video Player Usage

### Standalone HTML Player

```bash
cd apps/frontend/html-pages
node video-player-server.js
```

Open `http://localhost:3000/video-player.html`

### Features

- **Carousel Navigation**: Scroll or swipe through videos
- **Keyboard Shortcuts**: Arrow keys to navigate
- **Offline Mode**: Click 📥 to cache videos
- **Audio Effects**: Apply reverb, delay, distortion
- **Share**: Native Web Share API support

### PWA Installation

1. Serve from HTTPS or localhost
2. Click browser's "Install" prompt
3. Uses manifest.json for app configuration

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Kubernetes (optional)

### Quick Start

```bash
# Install dependencies
npm install

# Start Electron app
npm start

# Start collaboration server
npm run collab

# Package for distribution
npm run package

# Create installers
npm run make
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Generate secrets
npm run generate:secrets

# Configure Firebase
# See apps/frontend/FIREBASE_SETUP_STEPS.md
```

### Run Services

```bash
# Development mode
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose -f docker-compose.prod.yml up

# With monitoring
docker-compose -f docker-compose.monitoring.yml up

# Blue-Green deployment
docker-compose -f docker-compose.blue-green.yml up

# Chaos testing
docker-compose -f docker-compose.chaos.yml up
```

### Frontend Development

```bash
cd apps/frontend

# Vite dev server
npm run dev

# Secure HTTPS server
npm run dev:secure

# Hub app (standalone)
npm run dev:hub
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Chaos engineering tests
npm run test:chaos

# Load testing
npm run test:load

# Security audit
npm run security:audit

# Smoke tests
npm run test:smoke
```

### Chaos Engineering Tests

- **Chaos Monkey** - Random service failures
- **Load Test** - High traffic simulation
- **Spike Test** - Sudden traffic bursts
- **Recovery Test** - Disaster recovery
- **Game Day** - Full system chaos
- **Circuit Breaker** - Failure isolation
- **Dependency Test** - Service mesh testing

---

## 🚢 Deployment

### Docker

```bash
# Build images
docker build -t hootner-frontend -f Dockerfile.frontend .
docker build -t hootner-server -f Dockerfile .

# Push to registry
docker push your-registry/hootner-frontend
docker push your-registry/hootner-server
```

### Kubernetes

```bash
# Deploy to cluster
kubectl apply -f k8s/

# Install Istio service mesh
cd k8s/istio
./install.sh  # Linux/Mac
./install.bat # Windows

# Blue-Green deployment
./scripts/blue-green-deploy.sh
```

### CI/CD (24 Workflows)

GitHub Actions workflows handle:

- ✅ **Testing** - Automated test suite
- 🔒 **Security** - CodeQL, Snyk scanning
- 📦 **Docker** - Image builds & registry push
- 🚀 **Deployment** - Staging/Production/Preview
- 📊 **Monitoring** - Performance & health checks
- 🔄 **Rollback** - Automated failure recovery
- 🧪 **Chaos** - Scheduled chaos tests
- 📋 **Backup** - Automated database backups
- 🏷️ **Release** - Semantic versioning
- 🧹 **Cleanup** - Resource management

---

## 📊 Monitoring

### Prometheus Metrics

- Request rates & latencies
- Error rates
- Resource usage (CPU, memory, disk)
- Custom business metrics
- Chaos experiment results

### Grafana Dashboards

- Service health overview
- Database performance
- Backup status & verification
- Real-time analytics
- Chaos engineering metrics

Access: `http://localhost:3001` (Grafana)

---

## 🔒 Security

### Best Practices Implemented

- JWT with secure secrets
- HTTPS/TLS encryption
- Rate limiting per IP
- Input validation & sanitization
- **SQL injection prevention** (parameterized queries, input escaping)
- **Command injection protection** (argument validation, shell escaping)
- **XSS protection** (DOMPurify, HTML sanitization, entity escaping)
- **NoSQL injection prevention** (query sanitization, operator filtering)
- **LDAP injection protection** (special character escaping)
- CSRF tokens (double-submit cookie pattern)
- Security headers (Helmet.js with CSP)
- Dependency scanning (Snyk)
- Regular security audits
- Safe comparison utilities (timing-attack resistant)
- Session management (secure cookies)
- Path traversal prevention
- Prototype pollution protection

### Compliance

- GDPR considerations
- Data encryption at rest
- Audit logging service
- 90-day retention policy
- Compliance reporter service

### Injection Attack Protection

- [Injection Protection Guide](docs/INJECTION_PROTECTION.md) ⭐ NEW
- SQL injection prevention
- Command injection protection
- XSS (Cross-Site Scripting) protection
- NoSQL injection prevention
- LDAP injection protection
- Path traversal prevention
- Prototype pollution protection

---

## 📚 Documentation

### Architecture & Design

- [Architecture](docs/ARCHITECTURE.md)
- [Enhanced Architecture](docs/ENHANCED_ARCHITECTURE.md)
- [API Schema](docs/API_SCHEMA.md)
- [API Versioning](docs/API_VERSIONING.md)
- [Services Guide](docs/SERVICES.md)

### Code Quality

- [Code Duplication Solution](CODE_DUPLICATION_SOLUTION.md)
- [Deduplication Guide](docs/DEDUPLICATION_GUIDE.md)
- [Shared Utilities Reference](docs/SHARED_UTILITIES_REFERENCE.md)
- [Documentation Guide](docs/DOCUMENTATION_GUIDE.md) ⭐ NEW
- [Documentation Status](docs/DOCUMENTATION_STATUS.md) ⭐ NEW
- [JSDoc Quick Reference](JSDOC_QUICK_REFERENCE.md) ⭐ NEW
- [Syntax Fixes Summary](docs/SYNTAX_FIXES_SUMMARY.md) ⭐ NEW
- [Syntax Fix Guide](docs/SYNTAX_FIX_GUIDE.md) ⭐ NEW
- [Syntax Fixes Checklist](docs/SYNTAX_FIXES_CHECKLIST.md) ⭐ NEW
- [Syntax Fixes Examples](docs/SYNTAX_FIXES_EXAMPLES.md) ⭐ NEW

### Codebase Fixes & Migration

- [Codebase Fixes Plan](CODEBASE_FIXES_PLAN.md) ⭐ NEW - Comprehensive fix plan
- [Migration Guide](MIGRATION_GUIDE.md) ⭐ NEW - Step-by-step implementation
- [Fixes Checklist](FIXES_CHECKLIST.md) ⭐ NEW - Progress tracking
- [Fixes Summary](FIXES_SUMMARY.md) ⭐ NEW - Executive summary

### Operations

- [Deployment Checklist](.github/DEPLOYMENT_CHECKLIST.md)
- [Chaos Engineering](docs/CHAOS_ENGINEERING.md)
- [Backup Strategy](docs/BACKUP_STRATEGY.md)
- [Advanced Backup](docs/ADVANCED_BACKUP.md)
- [Blue-Green Deployment](docs/BLUE_GREEN_DEPLOYMENT.md)

### Developer Resources

- [Documentation Guide](docs/DOCUMENTATION_GUIDE.md) - JSDoc standards & best practices ⭐ NEW
- [Documentation Status](docs/DOCUMENTATION_STATUS.md) - Coverage tracking ⭐ NEW
- [JSDoc Quick Reference](JSDOC_QUICK_REFERENCE.md) - Quick syntax guide ⭐ NEW
- [Type Definitions](types/services.d.ts) - TypeScript definitions ⭐ NEW

### AI Features

- [AI Agent Orchestration](docs/AI_AGENT_ORCHESTRATION.md) - Multi-agent system ⭐ NEW
- [Cursor AI Modes](docs/CURSOR_AI_MODES.md) - AI-first editing ⭐ NEW

### Performance & Collaboration

- [Zed Optimization](docs/ZED_OPTIMIZATION.md) - Speed & real-time collab ⭐ NEW
- [Electron Optimization](docs/ELECTRON_OPTIMIZATION.md) - Secure, fast, <50MB builds ⭐ NEW

### Visual Design & Debugging

- [Visual Designer](docs/VISUAL_DESIGNER.md) - UI prototyping & debug enhancements ⭐ NEW
- [Sustainability & Compliance](docs/SUSTAINABILITY_COMPLIANCE.md) - Energy tracking & AI ethics ⭐ NEW

### Integrations

- [Stripe Integration](docs/STRIPE_INTEGRATION.md)
- [Watcher Agent](docs/WATCHER.md)
- [Agent Guide](docs/AGENT_GUIDE.md)

### Security

- [Data Exposure Prevention](docs/DATA_EXPOSURE_PREVENTION.md) ⭐ NEW
- [Security Checklist](SECURITY_CHECKLIST.md) ⭐ NEW
- [Injection Protection Guide](docs/INJECTION_PROTECTION.md)
- [Security Quick Reference](SECURITY_QUICK_REFERENCE.md)
- [Injection Fixes Summary](INJECTION_FIXES_SUMMARY.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 Scripts

| Script                           | Description                           |
| -------------------------------- | ------------------------------------- |
| `npm start`                      | Start production server               |
| `npm run dev`                    | Start development server              |
| `npm test`                       | Run test suite                        |
| `npm run lint`                   | Lint codebase                         |
| `npm run build`                  | Build for production                  |
| `npm run analyze:duplication`    | Analyze code duplication              |
| `npm run docs:generate`          | Generate API documentation ⭐ NEW     |
| `npm run docs:serve`             | Serve documentation locally ⭐ NEW    |
| `npm run verify:syntax`          | Verify syntax fixes ⭐ NEW            |
| `npm run fix:all-syntax`         | Fix all syntax issues ⭐ NEW          |
| `npm run detect:regex`           | Detect unterminated regex ⭐ NEW      |
| `npm run detect:jsdoc`           | Detect malformed JSDoc ⭐ NEW         |
| `npm run security:audit`         | Security vulnerability scan           |
| `npm run security:scan`          | Scan for hardcoded credentials ⭐ NEW |
| `npm run security:validate-env`  | Validate environment variables ⭐ NEW |
| `npm run generate:secrets`       | Generate secure secrets ⭐ NEW        |
| `node scripts/backup-manager.js` | Unified backup manager ⭐ NEW         |
| `./scripts/backup-all.sh`        | Backup all services (deprecated)      |
| `./scripts/blue-green-deploy.sh` | Deploy with zero downtime             |
| `./scripts/chaos-test.js`        | Run chaos engineering tests           |
| `./scripts/multi-region-sync.sh` | Sync backups across regions           |
| `./scripts/pitr-backup.sh`       | Point-in-time recovery backup         |
| `./scripts/security-audit.js`    | Comprehensive security audit          |

---

## 🌟 Key Technologies

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Socket.io
**Backend**: Node.js, Express, GraphQL, NestJS
**Database**: MongoDB, Redis, Prisma ORM
**Infrastructure**: Docker, Kubernetes, Istio, Traefik
**Monitoring**: Prometheus, Grafana
**CI/CD**: GitHub Actions (24 workflows)
**Cloud**: AWS (S3, EC2)
**Payments**: Stripe
**Auth**: Firebase, JWT
**Testing**: Vitest, Chaos Engineering

---

## 🏛️ Architecture Highlights

### Microservices (10+ Services)

- **Audit Service** - Activity logging
- **Backup Service** - Automated backups
- **Backup Monitoring** - Backup verification
- **Marketplace Service** - Digital goods
- **Payment Service** - Stripe integration
- **Security Service** - Threat detection
- **Content Moderation** - AI-powered filtering
- **Search Service** - Advanced search
- **Watcher Service** - System monitoring
- **Police Bot** - Automated enforcement

### Resilience Patterns

- **Circuit Breaker** - Failure isolation
- **Retry Logic** - Automatic retries
- **Bulkhead** - Resource isolation
- **Timeout** - Request timeouts
- **Graceful Shutdown** - Clean termination
- **Rate Limiting** - Traffic control

### Service Mesh (Istio)

- Traffic management
- Security policies
- Observability
- Service discovery
- Load balancing

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🦉 About HOOTNER

**"The Owl Never Sleeps"** - A 24/7 video streaming platform built with enterprise-grade architecture, designed for scale, reliability, and performance.

### Why HOOTNER?

- 🎯 **Production-ready** with comprehensive DevOps
- 🔄 **Zero-downtime** deployments with blue-green strategy
- 📈 **Scalable** microservices architecture (10+ services)
- 🛡️ **Secure** by design with multiple security layers
- 🧪 **Tested** with chaos engineering (8 scenarios)
- 📊 **Observable** with full monitoring stack
- 🔧 **Resilient** with circuit breakers & retry logic
- 🌍 **Multi-region** backup and disaster recovery

---

## 🆘 Support

- 📧 Email: [support@hootner.com](mailto:support@hootner.com)
- 💬 Discord: [Join our community](https://discord.gg/your-invite-link)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/hootner/issues)
- 📖 Docs: [Full Documentation](docs/)

---

### Made with 🦉 by the HOOTNER Team
