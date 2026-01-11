# 🤖 Copilot Directions for HOOTNER

## Quick Start Commands
```bash
# Essential setup
npm install && cd api/graphql && npm install
docker-compose up -d
npm run start:all

# Copilot workflow
node copilot-delegate.js delegate "Fix security issues"
node copilot-guide.js  # View delegation guide
```

## Repository Structure (Key Paths)
- **Frontend**: `hexarchy/4-interface/ui/` - UI components and frameworks
- **API**: `api/graphql/` - GraphQL server with enhanced schema
- **AI Services**: `services/video-generation/` - Python ML services
- **Hexarchy**: `hexarchy/0-core/` to `hexarchy/8-operations/` - Clean architecture
- **Frameworks**: `hexarchy/4-interface/ui/frameworks/` - Organized frontend frameworks
- **Scripts**: `.github/scripts/` - Automation and utilities
- **Docs**: `docs/` - Comprehensive documentation

## Code Standards
- **ES Modules**: Use `import/export` (Node.js 25.2.1)
- **Comments**: Add `// COPILOT: [description]` to changes
- **Error Handling**: Comprehensive try-catch blocks
- **Security First**: Always check for vulnerabilities
- **Chalk Colors**: Use for console output

## Key Files to Understand
1. `README.md` - Project overview and quick start
2. `.github/copilot-instructions.md` - Detailed architecture guide
3. `enhanced-agent-hub.js` - 75+ AI agents orchestration
4. `hexarchy/0-core/orchestration/event-bus.js` - Event orchestration
5. `copilot-delegate.js` - Task delegation system

## Workflow Integration
- **Task Delegation**: `node copilot-delegate.js delegate "task"`
- **Progress Monitoring**: `node copilot-delegate.js monitor`
- **GitHub Actions**: 24 automated workflows
- **Pre-commit Hooks**: Husky + lint-staged

## Security Focus Areas
- Injection attacks (SQL, XSS, NoSQL, LDAP)
- Deserialization vulnerabilities
- JWT/Firebase auth validation
- Rate limiting and CORS
- Dependency audits

## Development Patterns
- Hexagonal architecture layers
- Microservices with service mesh
- Real-time GraphQL subscriptions
- AI agent orchestration
- Container-first deployment

## Testing Strategy
- Unit: Vitest
- E2E: Playwright
- Load: k6
- Security: Snyk + CodeQL
- Chaos: 8 engineering scenarios

## Deployment
- Docker + Kubernetes + Istio
- Blue-green deployments
- AWS SAM serverless
- Multi-region sync
- Zero-downtime updates

## Hexarchy Architecture Layers

The HOOTNER platform uses a hexagonal architecture organized into 9 layers:

### 0-core: Core Business Logic
- **orchestration/**: Event bus and service orchestration
- Core domain models and business rules
- Framework-agnostic business logic

### 1-foundation: Infrastructure Layer
- Database connections and repositories
- External service integrations
- Low-level system operations

### 2-intelligence: AI and Analytics
- Machine learning models
- Data analytics pipelines
- AI agent implementations

### 3-communication: External Interfaces
- REST APIs
- GraphQL endpoints
- WebSocket connections
- MCP (Model Context Protocol) servers

### 4-interface: User Interfaces
- React components
- UI frameworks (in `ui/frameworks/`)
- Frontend assets and pages

### 5-economy: Business Logic
- Payment processing
- Subscription management
- Billing operations

### 6-governance: Policies and Rules
- Access control
- Compliance rules
- Policy enforcement

### 7-data: Data Management
- Data models
- Data validation
- Data transformation

### 8-operations: DevOps and Monitoring
- Deployment scripts
- Monitoring configurations
- Operations automation

## AI Agent Integration

### Enhanced Agent Hub
The `enhanced-agent-hub.js` orchestrates 75+ specialized AI agents:

- **Core AI Agents (12)**: Personalization, recommendations, content moderation
- **Business Intelligence Agents (15)**: KPIs, dashboards, analytics
- **Security & Compliance Agents (18)**: Threat detection, DMCA, COPPA
- **Infrastructure & Operations Agents (20)**: Monitoring, scaling, incident response
- **Specialized Service Agents (10)**: Payment fraud, user behavior analytics

### Task Delegation System
Use the Copilot delegation system for automated task management:

```bash
# Delegate a task
node copilot-delegate.js delegate "Fix security vulnerabilities" file1.js file2.js

# Monitor progress
node copilot-delegate.js monitor

# Mark task complete
node copilot-delegate.js complete <taskId>
```

## GraphQL API

The GraphQL API is located in `api/graphql/` with:
- **Schema**: `schema.graphql` - Complete type definitions
- **Server**: `server.js` - Apollo Server configuration
- **Resolvers**: Implement business logic and data fetching

Start the API:
```bash
cd api/graphql && npm install && npm start
```

Access the GraphQL Playground at `http://localhost:4000/graphql`

## Video Generation Service

Python-based ML service in `services/video-generation/`:
- **unet.py**: 3D U-Net diffusion model implementation
- **generator.py**: Video generation orchestration
- **api.py**: Flask REST API for video generation

Install dependencies:
```bash
cd services/video-generation
python install.py  # Installs PyTorch, diffusers, etc.
```

## Code Quality and Linting

The project uses multiple linting configurations:

```bash
# Standard linting
npm run lint

# Security-focused linting
npm run lint:security

# Auto-fix issues
npm run lint:fix

# Frontend-specific linting
npm run lint:frontend
```

Linting configurations are in `hexarchy/4-interface/ui/frameworks/linting/`:
- `simple.eslintrc.json` - Basic ESLint rules
- `eslint.security.config.js` - Security-focused rules
- `frontend-eslint.config.js` - Frontend-specific rules

## Testing Infrastructure

### Unit Tests (Vitest)
```bash
npm test
npm run test:unit
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Chaos Engineering
```bash
npm run chaos:test
```

Test configurations:
- `vitest.config.js` - Unit test configuration
- `playwright.config.js` - E2E test configuration
- `tests/chaos/chaos-monkey.js` - Chaos engineering scenarios

## Docker and Containerization

```bash
# Development environment
npm run deploy:dev
docker-compose -f docker-compose.dev.yml up -d

# Production environment
npm run deploy:prod
docker-compose -f docker-compose.prod.yml up -d

# Build custom image
npm run docker:build

# Run container
npm run docker:run
```

## Security Auditing

Run comprehensive security audits:

```bash
# Full security audit
npm run security:audit

# Check for known vulnerabilities
npm audit

# Dependency updates
npm run dependency:update
```

The project uses:
- CodeQL for static analysis
- Snyk for dependency scanning
- Custom security audit scripts in `.github/scripts/`

## Pre-commit Hooks

Husky is configured with pre-commit hooks:
- Lint staged files
- Run affected tests
- Validate commit messages
- Check for security issues

Configuration in `.husky/` directory.

## GitHub Actions Workflows

24 automated workflows in `.github/workflows/`:
- **copilot-commits.yml**: Automated commit monitoring
- **copilot-review.yml**: Code review automation
- **copilot-monitor.yml**: Task progress monitoring
- **copilot-docs.yml**: Documentation updates
- **commit-validation.yml**: Commit message validation
- **dependency-update.yml**: Automated dependency updates
- **aws-compliance.yaml**: AWS compliance checks

## Common Development Tasks

### Starting the Application
```bash
# Start all services
npm run start:all

# Start frontend only
npm start

# Start API only
npm run start:api

# Start with PM2 process manager
npm run runtime:start
```

### Monitoring and Logs
```bash
# PM2 monitoring
npm run runtime:monitor

# View logs
npm run runtime:logs

# Health check
npm run health:check
```

### Backup and Recovery
```bash
# Full backup
npm run backup:full
```

### Code Analysis
```bash
# Scan TODOs and technical debt
npm run todos:scan

# Export TODO report
npm run todos:export
```

## Environment Configuration

1. Copy `.env.example` to `.env`
2. Configure required environment variables:
   - Database URLs (MongoDB, Redis)
   - API keys and secrets
   - Service endpoints

## Best Practices for Copilot Users

1. **Use Descriptive Task Descriptions**: Be specific when delegating tasks
   ```bash
   node copilot-delegate.js delegate "Fix SQL injection in user authentication"
   ```

2. **Add COPILOT Comments**: Mark your changes with comments
   ```javascript
   // COPILOT: Added input validation to prevent XSS attacks
   const sanitizedInput = sanitize(userInput);
   ```

3. **Focus on Security**: Always prioritize security vulnerabilities
   - Check for injection attacks
   - Validate all inputs
   - Use parameterized queries
   - Implement proper error handling

4. **Follow ES Module Standards**: Use modern JavaScript
   ```javascript
   import { someFunction } from './module.js';
   export { myFunction };
   ```

5. **Use Chalk for Console Output**: Maintain consistency
   ```javascript
   import chalk from 'chalk';
   console.log(chalk.green('✅ Task completed'));
   console.log(chalk.red('❌ Error occurred'));
   ```

6. **Validate Before Committing**: Run linting and tests
   ```bash
   npm run lint:fix && npm test
   ```

## Troubleshooting

### Common Issues

**ESLint not found**:
```bash
npm install
```

**API not starting**:
```bash
cd api/graphql
npm install
npm start
```

**Docker issues**:
```bash
docker-compose down
docker-compose up -d
```

**Port conflicts**:
- Frontend: 3000
- GraphQL API: 4000
- MongoDB: 27017
- Redis: 6379

## Additional Resources

- **Main README**: `/README.md`
- **Architecture Guide**: `.github/copilot-instructions.md`
- **Security Report**: `.security-report.md`
- **Documentation Index**: `docs/DOCUMENTATION_INDEX.md`
- **MCP Integration**: `docs/MCP_INTEGRATION.md`
- **TODO Guidelines**: `docs/TODO_GUIDELINES.md`

## Contributing with Copilot

1. Create a branch for your feature/fix
2. Use `copilot-delegate.js` to track tasks
3. Add `// COPILOT:` comments to changes
4. Run linting and tests before committing
5. Monitor task progress with `copilot-delegate.js monitor`
6. Use GitHub Actions for automated reviews

## Support and Documentation

For more detailed information, consult:
- `/docs/` - Comprehensive documentation
- `.github/copilot-instructions.md` - AI agent guidelines
- `README.md` - Quick start and overview
- GitHub Issues - Report bugs or request features

---

**Remember**: The owl never sleeps 🦉 - HOOTNER runs 24/7 with automated monitoring and AI-driven operations.
