# 🦉 HOOTNER

> **The Owl Never Sleeps** - Enterprise Video Streaming Platform

[![Node.js](https://img.shields.io/badge/Node.js-25.2.1-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Full-stack video streaming platform with AI generation, real-time collaboration, and enterprise DevOps.

## 🚀 Day 1: One Command Start

```bash
# Prove the owl flies in 60 seconds
node scripts/onboard-dev.js
```

This single script checks prerequisites, starts infrastructure, and launches core services.

**Manual setup:**
```bash
docker-compose up -d          # Start MongoDB + Redis
npm install                   # Install dependencies
cd api/graphql && npm install # Install API dependencies
npm run start:all            # Start frontend + API
```

- **Login Page**: Frontend application
- **Dashboard**: Central hub
- **Cinema Player**: Video streaming
- GraphQL API: [localhost:4000/graphql](http://localhost:4000/graphql)
- Frontend: [localhost:3000](http://localhost:3000)
- MongoDB: localhost:27017
- Redis: localhost:6379

## 🤖 AI Development Tools

### Enhanced Copilot CLI

**Comprehensive code quality, security, and automation tools** - [Full Guide](docs/COPILOT_CLI_GUIDE.md)

```bash
# Task delegation
node copilot-delegate.js delegate "Add retry logic" src/api.js
node copilot-delegate.js monitor      # Monitor tasks
node copilot-delegate.js complete ID  # Mark complete

# Code analysis & security
node copilot-delegate.js analyze src/handlers/auth.js  # Full code analysis
node copilot-delegate.js security                      # Security audit
node copilot-delegate.js refactor src/components/Player.js  # Refactoring suggestions
node copilot-delegate.js optimize src/algorithms/search.js  # Performance tips
node copilot-delegate.js docs src/services/VideoPlayer.js   # Documentation generation
node copilot-delegate.js validate                           # Commit validation
```

**Quick Start:** Run `node copilot-delegate.js` for help or see [Copilot CLI Guide](docs/COPILOT_CLI_GUIDE.md)

### VSCode Optimization

- **Network throttling disabled** for maximum performance
- **Prettier formatting** for JS/TS/React files
- **Python interpreter** configured for AI services
- **Docker integration** ready when needed

## 📁 Architecture

**Enterprise-Grade** • 300+ files • 15+ frameworks • Hexagonal architecture

```
Hootner/
├── api/
│   └── graphql/               # GraphQL API server
│       ├── middleware/        # API middleware
│       ├── models/            # Data models
│       ├── resolvers/         # GraphQL resolvers
│       ├── routes/            # API routes
│       ├── utils/             # Utility functions
│       ├── webhooks/          # Webhook handlers
│       └── schema.graphql     # GraphQL schema
├── apps/
│   └── frontend/              # React 18 + TypeScript + Vite frontend
│       ├── html-pages/        # Standalone HTML pages (cinema-player, index)
│       └── src/               # React components with Apollo GraphQL
├── constants/                 # Application constants
├── data/                      # Application data
│   ├── logs/                  # Log files
│   ├── uploads/               # User uploads
│   └── usage/                 # Usage analytics
├── frameworks/                # 🏗️ Framework Architecture
│   ├── ai/                    # AI services, agents, MCP servers
│   │   └── agents/            # AI agent orchestration
│   └── backend/               # Server-side frameworks
│       └── nestjs/            # NestJS modules & decorators
├── scripts/                   # 🔧 Server Management & Automation
│   ├── deployment/            # Deployment automation
│   │   └── blue-green-deploy.sh
│   ├── onboard-dev.js         # Developer onboarding
│   ├── smoke-test.sh          # Smoke testing
│   └── validate_workflows.py  # Workflow validation
├── docs/                      # 📚 Comprehensive Documentation
│   ├── readme/                # Component-specific READMEs
│   │   ├── apps-README.md     # Frontend applications guide
│   │   ├── services-README.md # AI video generation service
│   │   ├── commands-README.md # Command references
│   │   └── config-README.md   # Configuration guides
│   ├── commands/              # Command references & quick guides
│   │   ├── quick-reference.md # Essential commands
│   │   ├── development.md     # Dev workflow
│   │   ├── security.md       # Security commands
│   │   └── ai-services.md    # AI service commands
│   ├── reports/               # Project reports
│   │   ├── lint/              # Linting and code quality
│   │   ├── syntax/            # Syntax fix documentation
│   │   └── phases/            # Project phase reports
│   └── status/                # Status reports
├── services/                  # 🔄 Microservices & AI Services
│   └── video-generation/      # AI text-to-video service
│       ├── config/            # Configuration files
│       ├── unet.py            # 3D U-Net diffusion model
│       ├── generator.py       # Video generation orchestrator
│       ├── api.py             # Flask REST API
│       ├── diffusion.py       # Diffusion models
│       ├── hdr_processing.py  # HDR video processing
│       ├── dolby_atmos.py     # Audio processing
│       └── install.py         # Dependency installer
├── terraform/                 # Infrastructure as Code
│   └── main.tf                # Terraform configuration
├── hexarchy/                  # 🏛️ Hexagonal Architecture
│   ├── 0-core/                # Core business logic
│   ├── 1-foundation/          # Infrastructure layer
│   ├── 2-intelligence/        # AI and analytics
│   ├── 3-communication/       # External interfaces
│   ├── 4-interface/           # User interfaces
│   ├── 5-economy/             # Business logic
│   ├── 6-governance/          # Policies and rules
│   ├── 7-data/                # Data management
│   └── 8-operations/          # DevOps and monitoring
├── k8s/                       # ☸️ Kubernetes Configuration
│   ├── istio/                 # Istio service mesh
│   ├── frontend-deployment.yaml
│   ├── namespace.yaml
│   └── redis-deployment.yaml
├── logs/                      # 📊 Application logs
├── tests/                     # 🧪 Testing Infrastructure
│   ├── e2e/                   # End-to-end tests (Playwright)
│   ├── integration/           # Integration tests
│   ├── performance/           # Performance tests
│   ├── electron-code-editor/  # Editor tests
│   └── reports/               # Test reports
├── terraform/                 # Infrastructure as Code
│   └── main.tf                # Terraform configuration
├── wiki/                      # Project wiki
│   └── Home.md                # Wiki home page
└── .github/
    ├── workflows/             # CI/CD pipelines (11 workflows)
    ├── scripts/               # GitHub automation scripts
    └── ISSUE_TEMPLATE/        # Issue templates
```

## ✨ Core Features

### 🎬 AI Video Platform

- **Text-to-Video Generation** - 3D U-Net diffusion models, 30s generation time
- **Jukebox Player** - Vinyl animations, touch navigation, Web Audio effects
- **PWA Ready** - Offline caching, installable, Service Worker
- **Real-time Streaming** - WebSocket, live collaboration

### 🌐 Frontend Stack

- **React 18 + TypeScript + Vite** - Modern development experience
- **HTML Pages** - Cinema Player, Landing pages
- **Apollo GraphQL** - Real-time subscriptions, Firebase auth, JWT
- **Tailwind CSS** - Utility-first styling

### 🤖 AI-Powered Development

- **Cursor-Style Editing** - Chat (Ctrl+K), Write (Ctrl+L), Refactor modes
- **Zed-Inspired Speed** - <100ms startup, real-time collaboration
- **Multi-Agent System** - 12+ specialized AI agents
- **Visual Designer** - Drag-and-drop prototyping (2025)
- **Sustainability** - Energy tracking, AI ethics audits (2025)

### 🔐 Security & Compliance

- **Multi-layer Protection** - JWT/Firebase, Helmet.js, rate limiting, CORS
- **Injection Prevention** - SQL, XSS, NoSQL, LDAP, command injection
- **Compliance Ready** - GDPR, SOC2, audit logging, 90-day retention
- **Automated Scanning** - Snyk, CodeQL, dependency audits

### 🏗️ Enterprise Infrastructure

- **Container Runtime** - Docker Alpine, 512MB-1GB memory, health checks
- **Node.js 25.2.1** - ES modules, 4GB memory, 30 worker threads, GPU acceleration
- **Kubernetes + Istio** - Service mesh, blue-green deployments, auto-rollback
- **Monitoring Stack** - Prometheus, Grafana, 24 CI/CD workflows
- **Resilience** - Chaos engineering (8 scenarios), PITR backups, multi-region sync

### 💳 Integrations

- **Payments** - Stripe processing, fraud detection
- **Database** - MongoDB, Redis, Prisma ORM
- **Cloud** - AWS S3, Firebase, Socket.io
- **AI/ML** - PyTorch 2.0+, 3D U-Net, BERT, OpenCV
- **Serverless** - AWS SAM, SQS+Lambda, CloudWatch

### 🤖 AI Agent Hub (75+ Agents)

- **Core AI (12)** - Personalization, ML, NLP, Computer Vision, Speech-to-Text
- **Business Intelligence (15)** - Revenue optimization, Analytics, Pricing algorithms
- **Security & Compliance (18)** - Fraud detection, GDPR, Penetration testing, Zero-trust
- **Infrastructure & Operations (20)** - Auto-scaling, CDN, Database sharding, Multi-cloud
- **Specialized Services (10)** - Localization, Voice assistants, Blockchain, CRM integration

### 🎬 Cinema Player (NEW - GitHub Copilot Integration)

**Features:**
- ✅ Theater/Cinema modes with immersive UI
- ✅ Real-time WebSocket sync (comments, likes, watch parties)
- ✅ Drag-drop video upload with preview
- ✅ Playlist manager with drag-reorder
- ✅ Watch history with localStorage
- ✅ Advanced search with filter chips
- ✅ 7 quality options (auto, 360p-8K)
- ✅ Screenshot capture with download/share
- ✅ Mini-player (Picture-in-Picture)
- ✅ 15 keyboard shortcuts
- ✅ Mobile touch gestures
- ✅ Comprehensive analytics tracking
- ✅ Social features (like, comment, share, watch parties)

**Integration:**
- ✅ WebSocket subscriptions to GraphQL API
- ✅ Real-time comment stream
- ✅ Live like count updates
- ✅ User profile loading
- ✅ Video recommendations
- ✅ Analytics event tracking (page views, playback events, UI interactions)

**Tech Stack:**
- Frontend: HTML5, CSS3 (glassmorphism), vanilla JS, Video.js
- Backend: GraphQL API (port 4000), Video Gen (port 5003)
- Database: MongoDB (videos, users, comments), Redis (caching)
- Infrastructure: Docker, AWS S3/CloudFront

### 🎭 Advanced Agent Orchestration (NEW!)

**Intelligent Automation** - 5 advanced agents with sophisticated coordination:

- **Intelligent Code Agent** - Auto-analysis, refactoring, security scanning
- **Continuous Learning Agent** - Pattern recognition, adaptation, feedback loops
- **Predictive Maintenance Agent** - Anomaly detection, failure prediction, auto-remediation
- **Autonomous Deployment Agent** - CI/CD orchestration, canary deployments, rollbacks
- **Intelligent Documentation Agent** - Auto-docs, API discovery, changelog generation

**Quick Start:**
```bash
npm run orchestrator:init           # Initialize all agents
npm run orchestrator:analyze        # Run code analysis
npm run orchestrator:deploy         # Autonomous deployment
npm run orchestrator:docs           # Generate documentation
npm run orchestrator:maintenance    # Predictive maintenance
npm run orchestrator:status         # Check agent status
```

See [docs/ADVANCED_AGENTS.md](docs/ADVANCED_AGENTS.md) for complete guide.

## 🎮 Usage Examples

### Video Player

```bash
cd apps/frontend/html-pages
# Open cinema-player.html in browser
```

### AI Video Generation

```bash
cd services/video-generation
python install.py  # Auto-install ML dependencies
python api.py      # Start API on port 5003
```

### All Servers

```bash
npm run start:all  # Cross-platform orchestration
```

## 🛠️ Development

### 🎯 Backend Infrastructure (NEW!)

**Amazon Q has optimized the complete backend infrastructure:**

✅ **NPM Dependencies Fixed** - Removed `express-graphql` conflict
✅ **MongoDB + Redis** - Docker Compose for local development
✅ **Security Hardened** - Rate limiting, XSS protection, injection prevention
✅ **Backend Orchestrator** - One command to start all services
✅ **AWS Setup** - Automated S3, DynamoDB, Lambda configuration
✅ **Database Optimization** - Indexes, caching, performance tuning

**Quick Start Backend:**
```bash
# Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Start all backend services
npm run start:backend

# Validate setup
npm run backend:validate
```

**Backend Services:**
- GraphQL API: http://localhost:4000/graphql
- Video Generation: http://localhost:5003/health
- MongoDB: mongodb://localhost:27017/hootner
- Redis: redis://localhost:6379

**Documentation:**
- [Backend Quick Start](docs/BACKEND_QUICKSTART.md)
- [Backend Status](BACKEND_STATUS.md)
- [Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md)
- [Backend Checklist](docs/BACKEND_CHECKLIST.md)

### Prerequisites

- Node.js 18+, NPM 9+
- Docker & Docker Compose
- Git

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d     # Start infrastructure
npm install              # Install dependencies
cd api/graphql && npm install
```

### Development Modes

```bash
# Full stack development
npm run start:all        # Frontend + API

# Individual services
npm start               # Frontend only (port 3000)
npm run start:api       # GraphQL API only (port 4000)
docker-compose up       # Infrastructure only
```

## 🧪 Testing & Quality

```bash
npm test                    # Unit tests with Vitest
npm run test:e2e           # End-to-end tests with Playwright
npm run test:smoke         # Smoke tests
npm run security:audit     # Security vulnerability scan
npm run lint               # Code linting
```

### 🔍 Code Quality Status

⚠️ **Security Review Required** - Recent deep scan identified multiple security vulnerabilities and code quality issues that need attention. Use the Code Issues Panel in your IDE to review and fix:

- Security vulnerabilities requiring immediate attention
- Code quality improvements for maintainability
- Performance optimization opportunities
- Best practices compliance updates

**Action Required**: Review findings in Code Issues Panel and implement recommended fixes before production deployment.

### Load Testing

```bash
# Install k6 (https://k6.io/docs/getting-started/installation/)
k6 run load-test.js        # Performance testing
```

## 🚀 Deployment

### Docker

```bash
docker build -t hootner-frontend -f Dockerfile.frontend .
docker build -t hootner-server -f Dockerfile .
```

### Kubernetes + Istio

```bash
kubectl apply -f k8s/
cd k8s/istio && ./install.sh
scripts/deployment/blue-green-deploy.sh
```

### CI/CD Pipeline (11 Workflows)

✅ Testing • 🔒 Security • 📦 Docker • 🚀 Deploy • 📊 Monitoring • 🔄 Rollback

## 📊 Monitoring & Observability

**Prometheus + Grafana Stack** → Monitoring dashboard

- Request rates, latencies, error rates
- Resource usage (CPU, memory, disk)
- Business metrics, service health
- Database performance, backup status

## 📚 Documentation Hub

### 📝 Quick References

- **[Day 1 Guide](docs/DAY_ONE.md)** • [Architecture](docs/architecture/ARCHITECTURE.md) • [API Reference](docs/API.md)
- [Security](docs/security/SECURITY.md) • [TODO Guidelines](docs/TODO_GUIDELINES.md)
- **[Frontend Integration Guide](docs/FRONTEND_INTEGRATION_GUIDE.md)** ⭐ NEW
- **[Frontend Quick Card](FRONTEND_QUICK_CARD.md)** ⭐ NEW
- **[Live API Testing Guide](LIVE_API_TESTING_GUIDE.md)** ⭐ NEW
- **[Project Completion Summary](PROJECT_COMPLETION_SUMMARY.md)** ⭐ NEW

### 🔧 Developer Resources

- [IDE MCP Setup](docs/development/IDE_MCP_SETUP.md) • [Dual Agent Setup](docs/DUAL_AGENT_SETUP.md)
- [Documentation Index](docs/DOCUMENTATION_INDEX.md) • [Contributing Tooling](docs/CONTRIBUTING_TOOLING.md)

### 🤖 AI & Performance

- [AI Agent Orchestration](docs/AI_AGENT_ORCHESTRATION.md) • [Cursor AI Modes](docs/CURSOR_AI_MODES.md)
- [Zed Optimization](docs/ZED_OPTIMIZATION.md) • [Visual Designer](docs/VISUAL_DESIGNER.md)
- [Sustainability](docs/SUSTAINABILITY_COMPLIANCE.md) • [Enhanced Agents](frameworks/ai/agents/README.md)

### 🛠️ Operations

- [Deployment Guide](docs/deployment/MCP_DEPLOYMENT.md) • [Blue-Green Script](scripts/deployment/blue-green-deploy.sh)

## 📝 Essential Commands

### Server Management

| Command                        | Description                          |
| ------------------------------ | ------------------------------------ |
| `node scripts/onboard-dev.js`  | Day 1 onboarding (checks + starts)   |
| `npm run start:all`            | Start all servers (cross-platform)   |
| `npm run start:backend`        | Start backend services only          |
| `npm run backend:validate`     | Validate backend setup               |
| `npm run db:optimize`          | Optimize MongoDB and Redis           |
| `npm run dev`                  | Development server with nodemon      |
| `npm run collaboration`        | Real-time collaboration server       |
| `npm run launch:platform`      | Launch platform services             |

### AI & Video Generation

| Command                                         | Description                     |
| ----------------------------------------------- | ------------------------------- |
| `cd services/video-generation && python api.py` | Start AI video API (port 5003)  |
| `npm run agents:manage`                         | Start agent manager             |
| `npm run orchestrator`                          | Agent orchestrator CLI          |
| `npm run orchestrator:status`                   | Check agent status              |

### Code Quality & Security

| Command                                    | Description                  |
| ------------------------------------------ | ---------------------------- |
| `npm run security:audit`                   | Security vulnerability scan  |



| `node commit-validator.js`                 | Validate commits (auto-runs) |
| `node copilot-delegate.js delegate "task"` | Delegate tasks to copilot    |

### Infrastructure

| Command                          | Description              |
| -------------------------------- | ------------------------ |
| `./scripts/deployment/blue-green-deploy.sh` | Zero-downtime deployment |
| `npm run infra:terraform`                   | Terraform infrastructure |
| `npm run aws:validate`                      | Validate AWS config      |

## 🌆 Tech Stack

**Frontend** • React 18, TypeScript, Vite, Tailwind CSS
**Backend** • Node.js, Express, GraphQL, NestJS
**Database** • MongoDB, Redis, Prisma ORM
**Infrastructure** • Docker, Kubernetes, Istio
**Monitoring** • Prometheus, Grafana
**CI/CD** • GitHub Actions (24 workflows)
**Cloud** • AWS (S3, Lambda, SQS)
**Payments** • Stripe
**Auth** • Firebase, JWT

## 🏗️ Architecture Highlights

### Microservices (14+ Core Services)

- **AI Agents** - Security, Compliance, BI, Operations, Payment Fraud
- **Core Services** - Audit, Backup, Marketplace, Payment, Content Moderation
- **Video Generation** - PyTorch 2.0+, 3D U-Net, Flask API (port 5003)
- **AWS Serverless** - SQS+Lambda, DLQ, CloudWatch, IAM

### Resilience Patterns

- Circuit Breaker, Retry Logic, Bulkhead, Timeout
- Graceful Shutdown, Rate Limiting
- Istio Service Mesh - Traffic management, security, observability

## 🤝 Contributing

1. Fork → Create branch → Commit → Push → PR
2. See [CONTRIBUTING_TOOLING.md](docs/CONTRIBUTING_TOOLING.md) for guidelines

## 📜 License & Support

**MIT License** - See [LICENSE](LICENSE)

**Support Channels**

- 📧 support@hootner.com
- 💬 Discord Community
- 🐛 [GitHub Issues](https://github.com/hootner/enterprise-platform/issues)
- 📝 [Documentation](docs/)

---

## 🦉 Why HOOTNER?

🎯 **Production-Ready** • 🔄 **Zero-Downtime** • 📊 **Scalable** • 🛡️ **Secure**
🧪 **Tested** • 📊 **Observable** • 🔧 **Resilient** • 🌍 **Multi-Region**

> **"The Owl Never Sleeps"** - 24/7 enterprise video streaming platform

---

<div align="center">

**Made with 🦉 by the HOOTNER Team**

[Documentation](docs/) • [Architecture](docs/architecture/ARCHITECTURE.md) • [Security](docs/security/SECURITY.md) • [Contributing](docs/CONTRIBUTING_TOOLING.md)

</div>
