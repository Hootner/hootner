# Quick Orient for AI Coding Agents

> **Purpose**: Give an AI agent the exact, actionable signals it needs to be productive in this repository (architecture, key files, developer workflows, and conventions).

## 🎯 Big Picture

HOOTNER is a monorepo-style full-stack platform (video player, AI services, microservices) organized around a **hexagonal architecture** (see `hexarchy/`). The platform features:
- 75+ AI agents orchestrated by `enhanced-agent-hub.js`
- GraphQL API with real-time subscriptions
- Python ML services for video generation
- Hexagonal architecture with 9 layers (0-core through 8-operations)
- Enterprise DevOps with Docker, Kubernetes, and Istio

## 📚 Key Files to Read First

1. **[copilot-directions.md](./copilot-directions.md)** — Comprehensive Copilot guide with quick start, commands, and best practices
2. **[../README.md](../README.md)** — Project quick-start, top-level commands, and environment notes
3. **[../enhanced-agent-hub.js](../enhanced-agent-hub.js)** — The entrypoint for 75+ enhanced agents; demonstrates how agents are initialized and routed
4. **[../copilot-delegate.js](../copilot-delegate.js)** — Task delegation system for Copilot workflows
5. **[../api/graphql/server.js](../api/graphql/server.js)** — GraphQL Apollo Server configuration

## 🏗️ Architecture Summary

### Hexagonal Architecture (9 Layers)
The repository is organized into hexarchy layers in `hexarchy/`:

- **0-core**: Core business logic and orchestration (`hexarchy/0-core/orchestration/event-bus.js`)
- **1-foundation**: Infrastructure layer (databases, external services)
- **2-intelligence**: AI and analytics (ML models, data pipelines)
- **3-communication**: External interfaces (REST, GraphQL, WebSocket)
- **4-interface**: User interfaces (React components, UI frameworks in `ui/frameworks/`)
- **5-economy**: Business logic (payments, subscriptions)
- **6-governance**: Policies and rules (access control, compliance)
- **7-data**: Data management (models, validation, transformation)
- **8-operations**: DevOps and monitoring (deployment, operations automation)

### AI Agent Architecture
- **Enhanced Agent Hub** (`enhanced-agent-hub.js`): Orchestrates 75+ specialized agents
  - Core AI Agents (12): Personalization, recommendations, content moderation
  - Business Intelligence Agents (15): KPIs, dashboards, analytics
  - Security & Compliance Agents (18): Threat detection, DMCA, COPPA
  - Infrastructure & Operations Agents (20): Monitoring, scaling, incident response
  - Specialized Service Agents (10): Payment fraud, user behavior analytics

- **Agent Interface**: All agents expose `initialize()`, `processRequest(req, res)`, and `getStatus()` methods

## 🚀 Developer Workflows & Commands

Use these **exact commands** when scripting or running tasks:

### Setup and Installation
```bash
npm install                          # Install root dependencies
cd api/graphql && npm install        # Install API dependencies
docker-compose up -d                 # Start MongoDB + Redis
```

### Development
```bash
npm run start:all                    # Start all servers (cross-platform)
npm start                            # Start frontend server
npm run start:api                    # Start GraphQL API only
npm run dev                          # Start with nodemon
```

### Testing
```bash
npm test                             # Run unit tests (Vitest)
npm run test:unit                    # Run unit tests explicitly
npm run test:e2e                     # Run E2E tests (Playwright)
npm run chaos:test                   # Run chaos engineering tests
```

### Linting and Code Quality
```bash
npm run lint                         # Standard linting
npm run lint:fix                     # Auto-fix linting issues
npm run lint:security                # Security-focused linting
npm run lint:frontend                # Frontend-specific linting
npm run format                       # Format with Prettier
```

### Copilot Workflows
```bash
node copilot-delegate.js delegate "Fix security issues"    # Delegate a task
node copilot-delegate.js monitor                          # Monitor progress
node copilot-delegate.js complete <taskId>                # Mark task complete
node copilot-guide.js                                     # View delegation guide
```

### Security and Auditing
```bash
npm run security:audit               # Comprehensive security audit
npm audit                            # Check dependencies for vulnerabilities
```

### Deployment
```bash
npm run deploy:dev                   # Deploy development environment
npm run deploy:prod                  # Deploy production environment
npm run docker:build                 # Build Docker image
npm run docker:run                   # Run Docker container
```

### Process Management
```bash
npm run runtime:start                # Start with PM2
npm run runtime:stop                 # Stop PM2 processes
npm run runtime:monitor              # Monitor with PM2
npm run runtime:logs                 # View PM2 logs
```

## 🎨 Conventions and Patterns to Follow

### Module System
- **ES Modules** are the primary module system (Node.js 25.2.1)
- Some legacy files use CommonJS (`.cjs` or `require()`)
- **Always prefer ESM** when adding new modules
- Check the module style before editing imports/exports

### Code Style
```javascript
// Use ES6+ imports/exports
import { someFunction } from './module.js';
export { myFunction };

// Add COPILOT comments to mark changes
// COPILOT: Added input validation to prevent XSS attacks
const sanitizedInput = sanitize(userInput);

// Use chalk for colored console output
import chalk from 'chalk';
console.log(chalk.green('✅ Task completed'));
console.log(chalk.red('❌ Error occurred'));

// Comprehensive error handling
try {
  await riskyOperation();
} catch (error) {
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
}
```

### Directory Placement
- **AI code**: `hexarchy/2-intelligence/` 
- **API endpoints**: `api/graphql/`
- **UI components**: `hexarchy/4-interface/ui/`
- **DevOps scripts**: `hexarchy/8-operations/`
- **Frontend frameworks**: `hexarchy/4-interface/ui/frameworks/`

### Agent Implementation
Agents should follow this interface:
```javascript
class MyAgent {
  initialize() {
    // Setup and initialization
  }
  
  processRequest(req, res) {
    // Handle requests
  }
  
  getStatus() {
    // Return agent status
  }
}
```

## 🔗 Integration Points & Runtime Details

### Service Endpoints
- **Frontend**: `http://localhost:3000`
- **GraphQL API**: `http://localhost:4000/graphql`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

### ML Services
- **Location**: `services/video-generation/`
- **Installation**: Run `python install.py` in the service directory
- **Models**: 3D U-Net diffusion model (`unet.py`)
- **API**: Flask REST API (`api.py`)

### Node Runtime
- **Version**: Node.js 25.2.1
- **Module System**: ES Modules first
- **Memory**: 4GB max old space size
- **Workers**: 30 worker threads for parallel processing

## ⚠️ What to Avoid / Watch For

### Module System
- **Don't assume all files are ESM** — check before editing imports/exports
- Be careful with `.cjs` and `.mjs` boundaries
- Some files may use CommonJS for compatibility

### Refactoring
- Large operations (refactors) should follow the **Plan Agent pattern**:
  - Break into steps
  - Run tests after each step
  - Use hexarchy layer boundaries
- Avoid touching unrelated hexarchy layers
- The repo is intentionally wide and opinionated — put changes into the correct scope

### Testing
- Always run tests before proposing changes
- Don't remove or modify unrelated tests
- Add tests for new functionality

## ✅ When Creating Patches

Before submitting:
1. **Run linting**: `npm run lint:fix`
2. **Run tests**: `npm test`
3. **Check security**: `npm run lint:security`
4. **Verify changes**: Review modified files
5. **Add COPILOT comments**: Mark your changes with `// COPILOT: [description]`
6. **Update documentation**: If you change interfaces or add features

Include in PR description:
- List of files changed
- Brief description of changes
- Any breaking changes or migration notes
- Security considerations (if applicable)

## 🔐 Security Focus Areas

Always check for:
- **Injection attacks**: SQL, XSS, NoSQL, LDAP
- **Deserialization vulnerabilities**
- **JWT/Firebase auth validation**
- **Rate limiting and CORS**
- **Input validation and sanitization**
- **Dependency vulnerabilities**: Run `npm audit`

## 📖 Additional Resources

- **[copilot-directions.md](./copilot-directions.md)** — Full Copilot guide
- **[copilot-agent.md](./copilot-agent.md)** — Custom agent configuration
- **[../docs/DOCUMENTATION_INDEX.md](../docs/DOCUMENTATION_INDEX.md)** — Complete documentation index
- **[../docs/MCP_INTEGRATION.md](../docs/MCP_INTEGRATION.md)** — Model Context Protocol integration
- **[../.security-report.md](../.security-report.md)** — Security findings and fixes

## 🤝 Need More Details?

If anything is unclear or you need deeper details about:
- Agent interfaces and event payload shapes
- Large-scale refactoring checklists
- Hexarchy layer boundaries and responsibilities
- Testing strategies for specific components
- Deployment procedures

Ask for clarification or consult the comprehensive documentation in the `docs/` directory.
