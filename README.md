# 🦉 HOOTNER

**AI-Native Video Intelligence Platform**

> *Enterprise-grade video streaming with 75+ AI agents, 120 AWS integrations, and hexagonal architecture*

## 📊 Platform Stats

- **1,302 Files** across 10 architectural layers (9 hexarchy + 1 documentation)
- **797 JavaScript** | **220 Markdown** | **117 HTML** | **70 Python**
- **120 AWS Integration Pipes** - Full cloud infrastructure
- **6 Core Services** - Production-ready microservices
- **75+ AI Agents** - Autonomous system management

## 🚀 Quick Start

```bash
npm install
npm run aws:onboard    # Setup wizard
npm run start:all      # Launch platform
```

**Platform runs at:** http://localhost:3000

## 🎯 Core Services

1. **video-generation** - AI-powered video synthesis (8K HDR, Dolby Atmos)
2. **ai-agents** - 75+ specialized agents for automation
3. **graphql** - Apollo-based API layer
4. **authentication** - Cognito + USB Passkey (FIDO2/WebAuthn)
5. **stripe-billing** - Usage-based pricing with volume discounts
6. **mcp-integration** - Dual-agent orchestration (Amazon Q + GitHub Copilot)

## 🏗️ Hexagonal Architecture (10 Layers)

### Layer 0: Core Infrastructure
API configs, authentication, AWS connectors, database utilities, logging, security

### Layer 1: Foundation
Domain models, validators, repositories, events, core services

### Layer 2: Intelligence
AI services, video generation, analytics engines, ML models

### Layer 3: Communication
API adapters, GraphQL resolvers, message queues, WebSocket, MCP server

### Layer 4: Interface
React components, UI frameworks, frontend apps, view models

### Layer 5: Economy
Business logic, Stripe payments, revenue optimization, fraud detection

### Layer 6: Governance
Compliance, content moderation, legal templates, policy enforcement

### Layer 7: Data
Analytics, backup, caching, storage, data warehouse

### Layer 8: Operations
CI/CD, deployment, infrastructure as code, monitoring, testing

### Layer 9: Documentation
README, PDR, guides, API docs, architecture diagrams (220 files)

## 🔧 Development Commands

```bash
# Setup
npm run aws:onboard      # AWS setup wizard
npm run aws:status       # Check AWS connection

# Development
npm run start:all        # Start all services
npm run dev              # Start with auto-reload

# AWS Deployment
npm run aws:deploy       # Deploy to AWS
npm run aws:validate     # Validate configuration

# Quality
npm test                 # Run tests
npm run lint:fix         # Fix linting issues
```

## 🎯 Development Modes

### Local Mode (Recommended)
- ✅ No AWS account needed
- ✅ Zero costs
- ✅ Perfect for development

### AWS Mode
- 🚀 Production-like environment
- 🚀 Real AWS services
- 💰 ~$0-5/month with free tier

## 📁 Project Structure

```
my-local-repo/
├── hexarchy/          # 9-layer architecture (1,302 files)
├── api/               # Lambda & GraphQL
├── apps/              # Frontend (React/TypeScript)
├── scripts/           # Automation & agents
├── services/          # Microservices
├── docs/              # Documentation (220 files)
├── tests/             # Test suites
└── .metadata/         # Project metadata
```

## 🌟 Key Features

### Video Intelligence
- Real-time neural video synthesis
- 8K HDR support with Dolby Atmos
- Adaptive streaming
- Long-form content processing

### AI Capabilities
- 75+ specialized agents
- Dual-agent orchestration
- Predictive analytics
- Automated metadata generation

### Security
- USB Passkey (FIDO2/WebAuthn)
- JWT token management
- Quantum-resistant encryption
- Role-based access control

### Billing
- Usage-based pricing
- Stripe integration
- Volume discounts (up to 60% off)
- Real-time usage tracking

## 🛠️ Technology Stack

**Frontend:** React 18+, TypeScript, Tailwind CSS  
**Backend:** Node.js 20+, Express, GraphQL, Python 3.8+  
**Database:** DynamoDB, Redis  
**AI/ML:** Stable Diffusion, PyTorch, TensorFlow  
**DevOps:** GitHub Actions, AWS SAM, Docker, Jest

## 📚 Documentation

### Getting Started
- [AWS for Beginners](docs/AWS_FOR_BEGINNERS.md) - Complete AWS guide
- [Quick Start Guide](docs/QUICK_START.md) - Get running in 5 minutes
- [Day One Guide](docs/DAY_ONE.md) - Your first day with HOOTNER

### Architecture
- [Infrastructure Tree](INFRASTRUCTURE_TREE_120_PIPES.md) - All 120 pipes mapped
- [Architecture Diagram](ARCHITECTURE_DIAGRAM_120_PIPES.md) - Visual overview
- [Hexagonal Architecture](hexarchy/README.md) - Layer-by-layer breakdown

### Development
- [API Documentation](docs/API.md) - REST & GraphQL APIs
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Deploy to AWS
- [Contributing Guide](docs/CONTRIBUTING_TOOLING.md) - How to contribute
- [Pull Request Mechanics](docs/guides/PULL_REQUEST_MECHANICS.md) - Understand how PRs work

### Advanced
- [Dual Agent Setup](docs/DUAL_AGENT_SETUP.md) - Amazon Q + GitHub Copilot
- [Product Requirements](PDR.md) - Full PRD
- [Stripe Integration](STRIPE_USAGE_PRICING_GUIDE.md) - Billing setup

## 🔄 AWS Integration (120 Pipes)

**Compute:** Lambda, EC2, CloudFront  
**Database:** DynamoDB, ElastiCache Redis  
**Messaging:** SQS, SNS, EventBridge  
**Security:** Cognito, IAM, KMS, Secrets Manager  
**Monitoring:** CloudWatch, X-Ray  
**Networking:** VPC, API Gateway, Route 53

## 💡 Requirements

**Required:** Node.js 20+, npm 9+  
**Optional:** AWS CLI, Java (local DynamoDB), Python 3.8+, Docker

## 📊 Cost Management

**Free Tier:** 1M Lambda requests/month, 25GB DynamoDB, 5GB S3  
**Development:** $0 (local mode) or $0-5/month (AWS mode)  
**Production:** $10-50/month (light usage)

## 🤝 Contributing

**New to Git/Pull Requests?** Read our [Pull Request Mechanics Guide](docs/guides/PULL_REQUEST_MECHANICS.md)

We welcome contributions! See [CONTRIBUTING_TOOLING.md](docs/CONTRIBUTING_TOOLING.md)

```bash
npm run format           # Format code
npm run lint:fix         # Fix issues
npm test                 # Run tests
```

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 🎯 Support

- 📖 **Documentation**: [docs/](docs/)
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

---

**Built with:** Node.js • Express • GraphQL • React • AWS • Stripe • AI/ML

**Last Updated:** 2026-02-06 | **Version:** 1.0 | **Files:** 1,302 | **Layers:** 10
