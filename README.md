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
├── 📄 template-enhanced.yaml        # 120-pipe AWS infrastructure
├── apps/                            # Frontend applications
├── hexarchy/                        # Hexagonal architecture layers
│   ├── 1-foundation/                # Core utilities
│   ├── 2-intelligence/              # AI services
│   ├── 3-communication/             # APIs & adapters (GraphQL, REST)
│   ├── 4-interface/                 # UI components
│   ├── 5-economy/                   # Business logic (payments)
│   ├── 6-information/               # Data models
│   ├── 7-data/                      # Storage & databases (DynamoDB)
│   └── 8-operations/                # Infrastructure & DevOps
├── api/                             # Lambda functions & GraphQL server
├── services/                        # Microservices (S3, SQS processing)
├── docs/                            # Documentation
└── scripts/                         # Automation & deployment scripts
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
- [AI Agent Orchestration](docs/AI_AGENT_ORCHESTRATION.md)
- [Dual Agent Setup](docs/DUAL_AGENT_SETUP.md)
- [DynamoDB Migration](docs/DYNAMODB_MIGRATION.md)

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
- Node.js 18+ 
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
- React & Tailwind CSS
- AI/ML Integration

---

**Remember:** You don't need to know AWS to get started. Run `npm run aws:onboard` and choose Local Mode!
