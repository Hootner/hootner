# 🦉 HOOTNER

**Enterprise Video Streaming Platform with AI Integration**

A full-stack video platform built with hexagonal architecture, microservices, and AI-powered features.

## 🚀 Quick Start (No AWS Required!)

New to development or AWS? No problem! Start with local mode:

```bash
# Install dependencies
npm install

# Run the onboarding wizard (picks local or AWS mode)
npm run aws:onboard

# Start the platform
npm run start:all
```

**That's it!** Your app is now running at http://localhost:3000

**Additional Services:**
- GraphQL API: http://localhost:3000/graphql
- Amazon Q Chat: http://localhost:3000/api/mcp
- Health Check: http://localhost:3000/api/health

## 📚 For Complete Beginners

**Never used AWS?** → Read [AWS for Beginners Guide](docs/AWS_FOR_BEGINNERS.md)

**What is HOOTNER?** → A video streaming platform like YouTube, but you control it

**Do I need AWS?** → No! You can develop everything locally on your computer

## 🎯 Development Modes

### Local Mode (Recommended for Beginners)

- ✅ No AWS account needed
- ✅ Everything runs on your computer  
- ✅ Perfect for learning and building features
- ✅ Zero costs

```bash
npm run aws:onboard  # Choose "Local Mode"
npm run start:all
```

### AWS Mode (When You're Ready)

- 🚀 Deploy to real AWS infrastructure
- 🚀 Test with real users
- 🚀 Production-like environment
- 💰 ~$0-5/month with free tier

```bash
npm run aws:onboard  # Choose "AWS Mode"
npm run aws:deploy
```

## 🔧 Common Commands

### Getting Started

```bash
npm run onboard          # Initial project setup
npm run aws:onboard      # AWS setup wizard (beginner-friendly!)
npm run aws:status       # Check AWS connection
```

### Development

```bash
npm run start:all        # Start all services
npm run dev              # Start with auto-reload
npm run start:platform   # Start full platform
```

### Frontend (Unified Server)

```bash
npm run start:all        # All services on port 3000
```

All services now run on http://localhost:3000 with different endpoints.

### AWS (Optional)

```bash
npm run aws:check        # Verify AWS credentials
npm run aws:deploy       # Deploy to AWS
npm run aws:validate     # Validate AWS configuration
```

### Testing & Quality

```bash
npm test                 # Run tests
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
```

## 📁 Project Structure

```
my-local-repo/
├── 📄 template.yaml                   # 120-pipe AWS infrastructure
├── .amazonq/                        # Amazon Q config
├── .aws/                            # AWS CLI & SSO configuration
├── .github/                         # GitHub workflows, templates, security
├── .husky/                          # Git hooks for code quality
├── agents/                          # API security scanner agents
├── api/                             # Lambda functions & GraphQL server
│   ├── graphql/                     # GraphQL API implementation
│   │   ├── cache/                   # Caching layer
│   │   ├── models/                  # DynamoDB models
│   │   ├── resolvers/               # GraphQL resolvers
│   │   ├── routes/                  # REST routes
│   │   ├── utils/                   # Utilities
│   │   └── webhooks/                # Stripe webhooks
│   ├── lambda/                      # Lambda handlers
│   └── layers/                      # Lambda layers
├── apps/                            # Frontend applications
│   └── frontend/                    # React/TypeScript frontend
│       ├── html-pages/              # Static HTML pages
│       └── src/                     # React components
├── config/                          # Configuration files
├── constants/                       # Application constants
├── data/                            # Data storage
│   ├── logs/                        # Application logs
│   ├── uploads/                     # File uploads
│   └── usage/                       # Usage tracking
├── docs/                            # Documentation
│   ├── ai/                          # AI & agent docs
│   ├── architecture/                # Architecture docs
│   ├── commands/                    # Command references
│   ├── compliance/                  # Compliance guides
│   ├── guides/                      # How-to guides
│   ├── legal/                       # Legal templates
│   ├── security/                    # Security docs
│   └── status/                      # Project status reports
├── frameworks/                      # Framework implementations
│   ├── ai/agents/                   # AI agent orchestration
│   └── backend/nestjs/              # NestJS backend
├── hexarchy/                        # Hexagonal architecture layers
│   ├── 0-core/                      # Core infrastructure
│   │   ├── api/                     # API configs
│   │   ├── auth/                    # Authentication
│   │   ├── aws/                     # AWS service configs
│   │   ├── database/                # Database configs
│   │   ├── logging/                 # Logging & monitoring
│   │   ├── security/                # Security middleware
│   │   └── utils/                   # Core utilities
│   ├── 1-foundation/                # Domain models & services
│   │   ├── events/                  # Domain events
│   │   ├── models/                  # Domain models
│   │   ├── repositories/            # Data repositories
│   │   ├── services/                # Business services
│   │   └── validators/              # Business validators
│   ├── 2-intelligence/              # AI & analytics
│   │   ├── ai/                      # AI services
│   │   ├── ai-services/             # Video generation, agents
│   │   ├── analytics/               # Analytics engines
│   │   └── ml/                      # ML models
│   ├── 3-communication/             # APIs & integrations
│   │   ├── adapters/                # API adapters
│   │   ├── clients/                 # External clients
│   │   ├── controllers/             # API controllers
│   │   ├── graphql/                 # GraphQL resolvers
│   │   ├── queue/                   # Message queues
│   │   └── websocket/               # WebSocket handlers
│   ├── 4-interface/                 # UI layer
│   │   ├── components/              # React components
│   │   ├── ui/                      # UI assets & pages
│   │   │   ├── components/          # Electron code editor
│   │   │   ├── frameworks/          # Linting, Prettier
│   │   │   ├── frontend/            # React frontend
│   │   │   ├── pages/               # HTML pages
│   │   │   └── utils/               # UI utilities
│   │   └── view-models/             # View models
│   ├── 5-economy/                   # Business logic
│   │   ├── business/                # Business services
│   │   │   ├── ai/                  # AI business logic
│   │   │   ├── analytics/           # Business analytics
│   │   │   ├── commerce/            # Payment processing
│   │   │   ├── compliance/          # Compliance services
│   │   │   ├── infrastructure/      # Infrastructure services
│   │   │   ├── integration/         # Third-party integrations
│   │   │   ├── media/               # Media processing
│   │   │   └── revenue/             # Revenue optimization
│   │   ├── fraud-detection/         # Fraud prevention
│   │   ├── monetization/            # Monetization services
│   │   ├── payments/                # Payment services
│   │   └── pricing/                 # Pricing engines
│   ├── 6-governance/                # Compliance & security
│   │   ├── compliance/              # Compliance services
│   │   ├── legal/                   # Legal templates
│   │   ├── moderation/              # Content moderation
│   │   └── policies/                # Policy enforcement
│   ├── 7-data/                      # Data layer
│   │   ├── analytics/               # Data analytics
│   │   ├── backup/                  # Backup services
│   │   ├── caching/                 # Cache layer
│   │   ├── storage/                 # Storage services
│   │   └── warehouse/               # Data warehouse
│   └── 8-operations/                # DevOps & infrastructure
│       ├── backup/                  # Backup operations
│       ├── ci-cd/                   # CI/CD pipelines
│       ├── deployment/              # Deployment services
│       ├── infrastructure/          # Infrastructure as code
│       ├── monitoring/              # Monitoring services
│       └── testing/                 # Test suites
├── layers/                          # Lambda layers
├── lib/                             # Shared libraries
├── scripts/                         # Automation scripts
│   ├── agents/                      # Agent orchestration
│   ├── deployment/                  # Deployment scripts
│   ├── monitoring/                  # Monitoring scripts
│   ├── security/                    # Security scripts
│   ├── servers/                     # Server launchers
│   └── testing/                     # Test scripts
├── services/                        # Microservices
│   └── video-generation/            # AI video generation service
├── src/                             # Source code
├── tests/                           # Test suites
│   ├── e2e/                         # End-to-end tests
│   ├── integration/                 # Integration tests
│   ├── performance/                 # Performance tests
│   ├── security/                    # Security tests
│   └── unit/                        # Unit tests
└── training_images/                 # AI training data
```

**🌳 See complete infrastructure mapping:** [INFRASTRUCTURE_TREE_120_PIPES.md](INFRASTRUCTURE_TREE_120_PIPES.md)

- All 120 connection pipes mapped to code
- Data flow visualizations
- AWS resource connections

## 🌟 Key Features

- 📹 **Video Streaming** - Upload, process, and stream videos via CloudFront CDN
- 🤖 **AI Integration** - AI-powered video generation and analysis  
- 🔐 **Authentication** - Cognito user management with JWT tokens
- 💳 **Payment Processing** - ✅ **Stripe integration with usage-based pricing**
  - **Start at base price, get cheaper with scale!**
  - Starter: $29.99 + $0.50/user → Enterprise: $999.99 + $0.20/user (60% cheaper)
  - Automatic volume discounts up to 25% off at 100K+ users
  - Real-time usage tracking (users, videos, storage)
  - See [STRIPE_USAGE_PRICING_GUIDE.md](STRIPE_USAGE_PRICING_GUIDE.md) for details
- 📊 **Analytics** - Real-time CloudWatch monitoring
- 🛡️ **Security** - KMS encryption, API Gateway auth, IAM policies
- ⚡ **120 Connection Pipes** - Fully integrated AWS infrastructure

## 🎓 Learning Resources

### New to the Project?

1. [AWS for Beginners](docs/AWS_FOR_BEGINNERS.md) - Complete AWS guide
2. [Infrastructure Tree](INFRASTRUCTURE_TREE_120_PIPES.md) - **NEW!** See all 120 pipes mapped to code
3. [Architecture Diagram](ARCHITECTURE_DIAGRAM_120_PIPES.md) - Visual infrastructure overview
4. [Day One Guide](docs/DAY_ONE.md) - Your first day with HOOTNER

### Developer Guides

- [Backend Quick Start](docs/BACKEND_QUICKSTART.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Contributing Guide](docs/CONTRIBUTING_TOOLING.md)

### 120-Pipe Infrastructure

- **[Infrastructure Tree](INFRASTRUCTURE_TREE_120_PIPES.md)** - Complete project → AWS mapping
  - **NEW:** Stripe usage-based pricing (PIPES 106-120)
  - Base pay → gets cheaper with scale (volume discounts)
  - Real-time usage tracking for billing
- **[Stripe Integration](STRIPE_INTEGRATION_SUMMARY.md)** - Complete implementation summary
- **[Stripe Pricing Guide](STRIPE_USAGE_PRICING_GUIDE.md)** - Setup & usage examples
- **[Stripe Cost Comparison](STRIPE_COST_COMPARISON.md)** - See how much you save at scale
- **[Stripe Connection Diagram](STRIPE_CONNECTION_DIAGRAM.md)** - Visual flow diagrams
- [Connections Map](TEMPLATE_CONNECTIONS_MAP.md) - All 120 pipes documented
- [Deployment Checklist](DEPLOYMENT_CHECKLIST_120_PIPES.md) - Deploy to AWS
- [Quick Reference](QUICK_REFERENCE_120_PIPES.md) - One-page cheat sheet

### Advanced Topics

- [AI Agent Orchestration](docs/ai/AI_AGENT_ORCHESTRATION.md)
- [Dual Agent Setup](docs/DUAL_AGENT_SETUP.md)
- [DynamoDB Migration](docs/DYNAMODB_MIGRATION.md)
- [10-Year Platform Lifecycle](PLATFORM_10_YEAR_LIFECYCLE.md) - Pricing decay model

### Integration Points

- **Event Bus:** [hexarchy/0-core/orchestration/event-bus.js](hexarchy/0-core/orchestration/event-bus.js)
- **Enhanced Agent Hub:** [scripts/agents/enhanced-agent-hub.js](scripts/agents/enhanced-agent-hub.js)
- **Agent Modules:** [frameworks/ai/agents](frameworks/ai/agents)

## 🔄 Switching AWS Accounts

Need to switch between AWS accounts? Easy!

```bash
# Method 1: Use profiles (recommended)
aws configure --profile personal
aws configure --profile work
export AWS_PROFILE=personal  # Switch to personal

# Method 2: Re-run wizard
npm run aws:onboard

# Method 3: Manual
aws configure  # Overwrites existing credentials
```

**What happens when you switch:**

- Resources stay in the old account (they're isolated)
- You'll need to re-deploy: `npm run aws:deploy`
- Your code doesn't change, just AWS configuration

👉 See [AWS for Beginners Guide](docs/AWS_FOR_BEGINNERS.md#switching-aws-accounts) for detailed info

## 🛠️ Requirements

### Required

- Node.js 20+ 
- npm 9+

### Optional (depending on mode)

- AWS CLI (for AWS mode)
- Java (for local DynamoDB)
- Python 3.8+ (for AI services)
- Docker (for containerized development)

## 💡 Troubleshooting

### "AWS CLI not found"

```bash
# Run the wizard - it will guide you through installation
npm run aws:onboard
```

### "Cannot connect to AWS"

```bash
# Check your status
npm run aws:status

# Re-run setup if needed
npm run aws:onboard
```

### "Port already in use"

```bash
# Kill processes on common ports
npx kill-port 3000 4000 5000 8000
```

### Still stuck?

1. Check [AWS for Beginners](docs/AWS_FOR_BEGINNERS.md#common-issues-for-beginners)
2. Open an issue on GitHub
3. Review [Documentation Index](docs/DOCUMENTATION_INDEX.md)

## 📊 AWS Cost Management

**Worried about AWS costs?**

✅ **Free Tier Benefits:**

- 12 months of free services
- 1M Lambda requests/month
- 25 GB DynamoDB storage
- 5 GB S3 storage

✅ **Expected Development Costs:**

- Local mode: **$0**
- AWS mode with free tier: **$0-5/month**
- Light production: **$10-50/month**

✅ **Set billing alerts:**

```bash
# AWS Console → Billing → Budgets → Create Budget
# Set $5 alert threshold
```

## 🔀 Branch Management

Need to merge multiple branches? We've got you covered!

### Merge All Branches

```bash
# Test merges first (recommended)
npm run git:merge:dry-run

# Merge all branches into main
npm run git:merge:all

# Merge a specific branch
npm run git:merge:branch -- --branch=feature/my-feature
```

**Via GitHub Actions (Recommended):**

1. Go to **Actions** tab → "Merge All Branches into Main"
2. Click **"Run workflow"**
3. Select dry-run mode for testing
4. Review results and handle conflicts

📖 **Full Guide**: [docs/BRANCH_MERGE_GUIDE.md](docs/BRANCH_MERGE_GUIDE.md)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING_TOOLING.md](docs/CONTRIBUTING_TOOLING.md)

```bash
npm run format           # Format code
npm run lint:fix         # Fix linting issues
npm test                 # Run tests before committing
```

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 🎯 Getting Help

- 📖 **Documentation**: [docs/](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/hootner/enterprise-platform/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/hootner/enterprise-platform/discussions)

## 🙏 Acknowledgments

Built with ❤️ by the HOOTNER team

**Key Technologies:**

- Node.js & Express
- GraphQL & Apollo
- DynamoDB & Redis
- AWS Lambda & CloudFront
- React & hootner.css
- AI/ML Integration

---

**Remember:** You don't need to know AWS to get started. Run `npm run aws:onboard` and choose Local Mode!
